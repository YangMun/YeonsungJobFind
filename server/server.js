const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'ysu',
  password: '1234',
  database: 'ysu_job',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 'uploads' 디렉토리가 없으면 생성
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// 이미지 업로드를 위한 정적 파일 제공
app.use('/uploads', express.static(uploadsDir));

// 구직자 유효성 검사 API
app.post('/api/validate-jobseeker', async (req, res) => {
  const { studentId, email } = req.body;
  
  try {
    const [rows] = await pool.query('SELECT * FROM jobSeeker WHERE id = ? OR email = ?', [studentId, email]);
    if (rows.length > 0) {
      res.json({ isValid: false, message: '이미 등록된 학번 또는 이메일입니다.' });
    } else {
      res.json({ isValid: true, message: '유효성 검사 통과' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ isValid: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인자 유효성 검사 API
app.post('/api/validate-employer', async (req, res) => {
  const { id } = req.body;
  
  try {
    const [rows] = await pool.query('SELECT * FROM employer WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json({ isValid: false, message: '이미 등록된 아이디입니다.' });
    } else {
      res.json({ isValid: true, message: '유효성 검사 통과' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ isValid: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구직자 회원가입 API
app.post('/api/signup-jobseeker', async (req, res) => {
  const { studentId, email, password } = req.body;
  
  try {
    await pool.query('INSERT INTO jobSeeker (id, email, password) VALUES (?, ?, ?)', [studentId, email, password]);
    res.json({ success: true, message: '구직자 회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인자 회원가입 API
app.post('/api/signup-employer', async (req, res) => {
  const { id, password, departmentName } = req.body;
  
  try {
    await pool.query('INSERT INTO employer (id, password, department_name) VALUES (?, ?, ?)', [id, password, departmentName]);
    res.json({ success: true, message: '구인자 회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  const { userType, id, password } = req.body; 

  try {
    let table;
    
    // userType에 따라 테이블을 선택
    if (userType === 'jobSeeker') {
      table = 'jobSeeker';
    } else if (userType === 'employer') {
      table = 'employer';
    } else if (userType === 'manager') {
      table = 'manager'; // manager 테이블 추가
    } else {
      return res.status(400).json({ success: false, message: '유효하지 않은 사용자 유형입니다.' });
    }

    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ? AND password = ?`, [id, password]);  

    if (rows.length > 0) {
      res.json({ success: true, userType, message: '로그인 성공' });
    } else {
      res.json({ success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인 공고 등록 API
app.post('/api/post-job', async (req, res) => {
  const { 
    employerId,
    title,
    contents,
    companyName,
    location,
    qualificationType,
    workPeriodStart,
    workPeriodEnd,
    recruitmentDeadline,
    hourlyWage,
    applicationMethod,
    contactNumber
  } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO PostJob (employer_id, title, contents, company_name, location, qualification_type, work_period_start, work_period_end, recruitment_deadline, hourly_wage, application_method, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [employerId, title, contents, companyName, location, qualificationType, workPeriodStart, workPeriodEnd, recruitmentDeadline, hourlyWage, applicationMethod, contactNumber]
    );
    res.json({ success: true, message: '구인 공고가 성공적으로 등록되었습니다.' });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생습니다.' });
  }
});

// 구인 공고 목록 조회 API
app.get('/api/job-list/:employerId', async (req, res) => {
  const { employerId } = req.params;
  const { status } = req.query;
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    let query;
    let queryParams;

    if (status === 'active') {
      query = `
        SELECT * FROM PostJob 
        WHERE employer_id = ? AND recruitment_deadline >= ? 
        ORDER BY created_at DESC
      `;
      queryParams = [employerId, currentDate];
    } else if (status === 'closed') {
      query = `
        SELECT * FROM PostJob 
        WHERE employer_id = ? AND recruitment_deadline < ? 
        ORDER BY recruitment_deadline DESC
      `;
      queryParams = [employerId, currentDate];
    } else {
      return res.status(400).json({ success: false, message: '잘못된 상태 파라미터입니다.' });
    }

    const [rows] = await pool.query(query, queryParams);
    res.json({ success: true, jobs: rows });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인 공고 상세 정보 조회 API
app.get('/api/job-detail/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM PostJob WHERE id = ?`,
      [jobId]
    );

    if (rows.length > 0) {
      res.json({ success: true, job: rows[0] });
    } else {
      res.status(404).json({ success: false, message: '해당 구인 공고를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인 공고 수정 API
app.put('/api/update-job/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const { 
    title,
    contents,
    companyName,
    location,
    qualificationType,
    workPeriodStart,
    workPeriodEnd,
    recruitmentDeadline,
    hourlyWage,
    applicationMethod,
    contactNumber
  } = req.body;
  
  try {
    await pool.query(
      `UPDATE PostJob SET 
        title = ?, 
        contents = ?, 
        company_name = ?, 
        location = ?, 
        qualification_type = ?, 
        work_period_start = ?, 
        work_period_end = ?, 
        recruitment_deadline = ?, 
        hourly_wage = ?, 
        application_method = ?, 
        contact_number = ?
      WHERE id = ?`,
      [title, contents, companyName, location, qualificationType, 
       workPeriodStart, workPeriodEnd, recruitmentDeadline, hourlyWage, 
       applicationMethod, contactNumber, jobId]
    );
    res.json({ success: true, message: '구인 공고가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인 공고 삭제 API
app.delete('/api/delete-job/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  try {
    // 트랜잭션 시작
    await pool.query('START TRANSACTION');

    // 1. JobPost_Status 테이블에서 관련 데이터 삭제
    await pool.query('DELETE FROM JobPost_Status WHERE job_id = ?', [jobId]);

    // 2. postjob_apply 테이블에서 관련 데이터 삭제
    await pool.query('DELETE FROM postjob_apply WHERE job_id = ?', [jobId]);

    // 3. PostJob 테이블에서 공고 삭제
    await pool.query('DELETE FROM PostJob WHERE id = ?', [jobId]);

    // 트랜잭션 커밋
    await pool.query('COMMIT');

    res.json({ success: true, message: '구인 공고가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    // 오류 발생 시 롤백
    await pool.query('ROLLBACK');
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인자 프로필 정보 조회 API
app.get('/api/employer-profile/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await pool.query('SELECT department_name, phone_number, email FROM employer WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json({ success: true, profile: rows[0] });
    } else {
      res.status(404).json({ success: false, message: '해당 구인자를 찾을 수 없니다.' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인자 프로필 정보 업데이트 API
app.put('/api/update-employer-profile/:id', async (req, res) => {
  const { id } = req.params;
  const { phone_number, email } = req.body;
  
  try {
    await pool.query('UPDATE employer SET phone_number = ?, email = ? WHERE id = ?', [phone_number, email, id]);
    res.json({ success: true, message: '프로필이 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인자 계정 삭제 API
app.delete('/api/delete-employer/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // 트랜잭션 시작
    await pool.query('START TRANSACTION');

    // 해당 구인자가 작성한 모든 구인 공고 삭제
    await pool.query('DELETE FROM PostJob WHERE employer_id = ?', [id]);

    // 구인자 계정 삭제
    await pool.query('DELETE FROM employer WHERE id = ?', [id]);

    // 트랜잭션 커밋
    await pool.query('COMMIT');

    res.json({ success: true, message: '계정과 관련된 모든 정보가 성공적으로 었습니다.' });
  } catch (error) {
    // 오류 발생 시 롤백
    await pool.query('ROLLBACK');
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 전체 구인 공고 목록 조회 API
app.get('/api/all-jobs', async (req, res) => {
  const { status, departments } = req.query;
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    let query;
    let queryParams;

    if (status === 'active') {
      query = `
        SELECT pj.* FROM PostJob pj
        JOIN employer e ON pj.employer_id = e.id
        WHERE pj.recruitment_deadline >= ?
      `;
      queryParams = [currentDate];
    } else if (status === 'closed') {
      query = `
        SELECT pj.* FROM PostJob pj
        JOIN employer e ON pj.employer_id = e.id
        WHERE pj.recruitment_deadline < ?
      `;
      queryParams = [currentDate];
    } else {
      return res.status(400).json({ success: false, message: '잘못된 상태 파라미터입니다.' });
    }

    if (departments && departments.length > 0) {
      const departmentList = departments.split(',');
      query += ` AND e.department_name IN (?)`;
      queryParams.push(departmentList);
    }

    query += ` ORDER BY pj.created_at DESC`;

    const [rows] = await pool.query(query, queryParams);
    res.json({ success: true, jobs: rows });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 부서 목록 조회 API
app.get('/api/departments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT department_name FROM employer ORDER BY department_name');
    const departments = rows.map(row => row.department_name);
    res.json({ success: true, departments });
  } catch (error) {
    console.error('데이터베이 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구직자 기본 정보 조회 API
app.get('/api/get-normal-info/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  
  try {
    const [rows] = await pool.query('SELECT * FROM NormalInformation WHERE jobSeeker_id = ?', [jobSeekerId]);
    if (rows.length > 0) {
      res.json({ success: true, info: rows[0] });
    } else {
      res.json({ success: false, message: '기본 정보가 없습니다.' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구직자 기 정보 저장/수정 API (이미지 업로드 포함)
app.post('/api/save-normal-info', upload.single('image'), async (req, res) => {
  const { jobSeekerId, name, birthDate, email, phone, gender } = req.body;
  const image = req.file ? req.file.filename : null;
  
  try {
    // 전화번호에 하이픈 추가
    const formattedPhone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');

    // 기존 정보 확인
    const [existingInfo] = await pool.query('SELECT * FROM NormalInformation WHERE jobSeeker_id = ?', [jobSeekerId]);

    let query;
    let queryParams;

    if (existingInfo.length > 0) {
      // 기존 정보가 있으면 UPDATE
      query = `
        UPDATE NormalInformation 
        SET name = ?, birthDate = ?, email = ?, phone = ?, gender = ?
        ${image ? ', image = ?' : ''}
        WHERE jobSeeker_id = ?
      `;
      queryParams = [name, birthDate, email, formattedPhone, gender || '미정'];
      if (image) queryParams.push(image);
      queryParams.push(jobSeekerId);
    } else {
      // 기존 정보가 없으면 INSERT
      query = `
        INSERT INTO NormalInformation 
        (jobSeeker_id, image, name, birthDate, email, phone, gender) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      queryParams = [jobSeekerId, image || 'default-profile.jpg', name, birthDate, email, formattedPhone, gender || '미정'];
    }

    await pool.query(query, queryParams);

    res.json({ success: true, message: '기본 정보가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구직자 프로필 요약 정보 조회 API
app.get('/api/jobseeker-profile-summary/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  
  try {
    const [rows] = await pool.query('SELECT name, image FROM NormalInformation WHERE jobSeeker_id = ?', [jobSeekerId]);
    if (rows.length > 0) {
      res.json({ success: true, profile: rows[0] });
    } else {
      res.json({ success: false, message: '프로필 정보가 없습니다.' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구직자 력 정보 저장 API
app.post('/api/save-grad-info', async (req, res) => {
  const { jobSeekerId, universityType, schoolName, region, admissionDate, graduationDate, graduationStatus, major } = req.body;
  
  try {
    // 기존 정보 확인
    const [existingInfo] = await pool.query('SELECT * FROM GradeInformation WHERE jobSeeker_id = ?', [jobSeekerId]);

    let query;
    let queryParams;

    if (existingInfo.length > 0) {
      // 기존 정보가 있으면 UPDATE
      query = `
        UPDATE GradeInformation 
        SET university_type = ?, school_name = ?, region = ?, admission_date = ?, graduation_date = ?, graduation_status = ?, major = ?
        WHERE jobSeeker_id = ?
      `;
      queryParams = [universityType, schoolName, region, admissionDate, graduationDate, graduationStatus, major, jobSeekerId];
    } else {
      // 기존 정보가 없으면 INSERT
      query = `
        INSERT INTO GradeInformation 
        (jobSeeker_id, university_type, school_name, region, admission_date, graduation_date, graduation_status, major) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      queryParams = [jobSeekerId, universityType, schoolName, region, admissionDate, graduationDate, graduationStatus, major];
    }

    await pool.query(query, queryParams);

    res.json({ success: true, message: '학력 정보가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구직자 학력 정 조회 API
app.get('/api/get-education-info/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  
  try {
    const [rows] = await pool.query('SELECT university_type, school_name, region, admission_date, graduation_date, graduation_status, major FROM GradeInformation WHERE jobSeeker_id = ?', [jobSeekerId]);
    if (rows.length > 0) {
      res.json({ success: true, info: rows[0] });
    } else {
      res.json({ success: false, message: '학력 정보가 없습니다.' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구직자 학력 정보 삭제 API
app.delete('/api/delete-grad-info/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  
  try {
    await pool.query('DELETE FROM GradeInformation WHERE jobSeeker_id = ?', [jobSeekerId]);
    res.json({ success: true, message: '학력 정보가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 경험/활동/교육 정보 저장 API
app.post('/api/save-experience-activity', async (req, res) => {
  const { jobSeekerId, activityType, organization, startDate, endDate, description } = req.body;
  
  // 입력값 검증
  if (!jobSeekerId || !activityType || !organization || !startDate || !endDate || !description) {
    return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' });
  }

  // 활동구분 유효성 검사
  const activityTypes = ['교내활동', '인턴', '자원봉사', '동아리', '아르바이트', '사회활동', '수행과제', '해외연수'];
  if (!activityTypes.includes(activityType)) {
    return res.status(400).json({ success: false, message: '올바른 활동구분을 선택해주세요.' });
  }

  // 기관/장소 길이 검사
  if (organization.length > 20) {
    return res.status(400).json({ success: false, message: '기관/장소는 20자를 초과할 수 없습니다.' });
  }

  // 날짜 형식 검사
  const dateRegex = /^\d{4}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return res.status(400).json({ success: false, message: '날짜는 YYYY-MM 형식으로 입력해주세요.' });
  }

  // 활동내용 길이 검사
  if (description.length > 500) {
    return res.status(400).json({ success: false, message: '활동내용은 500자를 초과할 수 없습니다.' });
  }

  try {
    const query = `
      INSERT INTO ExperienceActivity 
      (jobSeeker_id, activity_type, organization, start_date, end_date, description) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const queryParams = [jobSeekerId, activityType, organization, startDate, endDate, description];

    await pool.query(query, queryParams);

    res.json({ success: true, message: '경험/활동/교육 정보가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 경험/활동/교육 정보 조회 API
app.get('/api/get-experience-activities/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  
  try {
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as count FROM ExperienceActivity WHERE jobSeeker_id = ?',
      [jobSeekerId]
    );
    
    const [activities] = await pool.query(
      'SELECT id, organization, activity_type, start_date, end_date, description FROM ExperienceActivity WHERE jobSeeker_id = ? ORDER BY start_date DESC',
      [jobSeekerId]
    );
    
    if (activities.length > 0) {
      res.json({ 
        success: true, 
        count: countResult[0].count, 
        activities: activities 
      });
    } else {
      res.json({ success: false, message: '경험/활동/교육 정보가 없습니다.' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 경험/활동/교육 정보 수정 API
app.put('/api/update-experience-activity/:id', async (req, res) => {
  const { id } = req.params;
  const { activityType, organization, startDate, endDate, description, jobSeekerId } = req.body;
  
  if (!jobSeekerId) {
    return res.status(400).json({ 
      success: false, 
      message: '사용자 ID가 필요합니다.' 
    });
  }

  try {
    const query = `
      UPDATE ExperienceActivity 
      SET activity_type = ?, organization = ?, start_date = ?, end_date = ?, description = ?
      WHERE id = ? AND jobSeeker_id = ?
    `;
    const queryParams = [activityType, organization, startDate, endDate, description, id, jobSeekerId];

    const [result] = await pool.query(query, queryParams);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '해당 활동을 찾을 수 없습니다.' 
      });
    }

    res.json({ 
      success: true, 
      message: '경험/활동/교육 정보가 성공적으로 정되었습니다.' 
    });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 경험/활동/교육 정보 조회 API 수정
app.get('/api/get-experience-activities/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  
  try {
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as count FROM ExperienceActivity WHERE jobSeeker_id = ?',
      [jobSeekerId]
    );
    
    const [activities] = await pool.query(
      'SELECT id, organization, activity_type, start_date, end_date, description FROM ExperienceActivity WHERE jobSeeker_id = ? ORDER BY start_date DESC',
      [jobSeekerId]
    );
    
    if (activities.length > 0) {
      res.json({ 
        success: true, 
        count: countResult[0].count, 
        activities: activities 
      });
    } else {
      res.json({ success: false, message: '경험/활동/교육 정가 없습니다.' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 경험/활동/교육 정보 삭제 API
app.delete('/api/delete-experience-activity/:activityId/:jobSeekerId', async (req, res) => {
  const { activityId, jobSeekerId } = req.params;
  
  try {
    const [result] = await pool.query(
      'DELETE FROM ExperienceActivity WHERE id = ? AND jobSeeker_id = ?', 
      [activityId, jobSeekerId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '해당 활동을 찾을 수 없거나 삭제 권한이 없습니다.' 
      });
    }

    res.json({ 
      success: true, 
      message: '활동이 성공적으로 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 자격증 정보 저장 API
app.post('/api/save-certification', async (req, res) => {
  const { jobSeekerId, certificationName, issuingOrganization, acquisitionDate } = req.body;
  
  // 입력값 검증
  if (!jobSeekerId || !certificationName || !issuingOrganization || !acquisitionDate) {
    return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' });
  }

  // 길이 제한 검사
  if (certificationName.length > 50) {
    return res.status(400).json({ success: false, message: '자격증명은 50자를 초과할 수 없습니다.' });
  }
  if (issuingOrganization.length > 50) {
    return res.status(400).json({ success: false, message: '발행처/기관은 50자를 초과할 수 없습니다.' });
  }

  // 날짜 형식 검사 (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(acquisitionDate)) {
    return res.status(400).json({ success: false, message: '올바른 날짜 형식이 아닙니다.' });
  }

  try {
    const query = `
      INSERT INTO certifications 
      (jobSeeker_id, certification_name, issuing_organization, acquisition_date) 
      VALUES (?, ?, ?, ?)
    `;
    const queryParams = [jobSeekerId, certificationName, issuingOrganization, acquisitionDate];

    await pool.query(query, queryParams);
    res.json({ success: true, message: '자격증 정보가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 자격증 정보 조회 API
app.get('/api/get-certifications/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  
  try {
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as count FROM certifications WHERE jobSeeker_id = ?',
      [jobSeekerId]
    );
    
    // DATE_FORMAT 사용하여 날짜를 YYYY-MM-DD 형식으로 직접 변환
    const [certifications] = await pool.query(
      `SELECT id, 
        certification_name, 
        issuing_organization, 
        DATE_FORMAT(acquisition_date, '%Y-%m-%d') as acquisition_date 
      FROM certifications 
      WHERE jobSeeker_id = ? 
      ORDER BY acquisition_date DESC`,
      [jobSeekerId]
    );
    
    if (certifications.length > 0) {
      res.json({ 
        success: true, 
        count: countResult[0].count, 
        certifications: certifications 
      });
    } else {
      res.json({ success: false, message: '자격증 정보가 없습니다.' });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 자격증 정보 수정 API
app.post('/api/update-certification', async (req, res) => {
  const { jobSeekerId, certificationId, certificationName, issuingOrganization, acquisitionDate } = req.body;
  
  // 입력값 검증
  if (!jobSeekerId || !certificationId || !certificationName || !issuingOrganization || !acquisitionDate) {
    return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' });
  }

  // 길이 한 검사
  if (certificationName.length > 50) {
    return res.status(400).json({ success: false, message: '자격증명은 50자를 초과할 수 없습니다.' });
  }
  if (issuingOrganization.length > 50) {
    return res.status(400).json({ success: false, message: '발행처/기관은 50자를 초과할 수 없습니다.' });
  }

  // 날짜 형식 검사 (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(acquisitionDate)) {
    return res.status(400).json({ success: false, message: '올바른 날짜 형식이 아닙니다.' });
  }

  try {
    const query = `
      UPDATE certifications 
      SET certification_name = ?, 
          issuing_organization = ?, 
          acquisition_date = ?
      WHERE id = ? AND jobSeeker_id = ?
    `;
    const queryParams = [
      certificationName,
      issuingOrganization,
      acquisitionDate,
      certificationId,
      jobSeekerId
    ];

    const [result] = await pool.query(query, queryParams);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '해당 자격증을 찾을 수 없거나 수정 권한이 없습니다.' 
      });
    }

    res.json({ 
      success: true, 
      message: '자격증 정보가 성공으로 수정되었습니다.' 
    });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 자격증 정보 삭제 API
app.delete('/api/delete-certification/:id/:jobSeekerId', async (req, res) => {
  const { id, jobSeekerId } = req.params;
  
  try {
    const [result] = await pool.query(
      'DELETE FROM certifications WHERE id = ? AND jobSeeker_id = ?', 
      [id, jobSeekerId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '해당 자격증을 찾을 수 없거나 삭제 권한이 없습니다.' 
      });
    }

    res.json({ 
      success: true, 
      message: '자격증이 성공적으로 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 자기소개서 저장 API
app.post('/api/save-career-statement', async (req, res) => {
  const { 
    jobSeekerId, 
    growthProcess, 
    personality, 
    motivation, 
    aspiration, 
    careerHistory 
  } = req.body;

  try {
    const query = `
      INSERT INTO career_statements 
      (jobSeeker_id, growth_process, personality, motivation, aspiration, career_history)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [jobSeekerId, growthProcess, personality, motivation, aspiration, careerHistory];
    await pool.query(query, params);

    res.json({ 
      success: true, 
      message: '자기소개서가 성공적으로 저장되었습니다.' 
    });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 자기소개서 조회 API
app.get('/api/get-career-statement/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  
  try {
    const [rows] = await pool.query(
      'SELECT growth_process, personality, motivation, aspiration, career_history FROM career_statements WHERE jobSeeker_id = ?',
      [jobSeekerId]
    );
    
    if (rows.length > 0) {
      res.json({ 
        success: true, 
        careerStatement: rows[0]
      });
    } else {
      res.json({ 
        success: false, 
        message: '자기소개서 정보가 없습니다.' 
      });
    }
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 자기소개서 수정 API
app.put('/api/update-career-statement/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  const { 
    growthProcess, 
    personality, 
    motivation, 
    aspiration, 
    careerHistory 
  } = req.body;

  try {
    const query = `
      UPDATE career_statements 
      SET growth_process = ?, 
          personality = ?, 
          motivation = ?, 
          aspiration = ?, 
          career_history = ?
      WHERE jobSeeker_id = ?
    `;
    
    const params = [growthProcess, personality, motivation, aspiration, careerHistory, jobSeekerId];
    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '수정할 자기소개서를 찾을 수 없습니다.' 
      });
    }

    res.json({ 
      success: true, 
      message: '자기소개서가 성공적으로 수정되었습니다.' 
    });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 자기소개서 삭제 API
app.delete('/api/delete-career-statement/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  
  try {
    const [result] = await pool.query(
      'DELETE FROM career_statements WHERE jobSeeker_id = ?', 
      [jobSeekerId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '삭제할 자기소개서를 찾을 수 없습니다.' 
      });
    }

    res.json({ 
      success: true, 
      message: '자기소개서가 성공적으로 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 구인 공고 지원 API
app.post('/api/job-status-insert', async (req, res) => {
  const { jobId, jobSeekerId } = req.body;

  try {
    // 이미 지원한 공고인지 확인
    const [existingApplication] = await pool.query(
      'SELECT * FROM JobPost_Status WHERE job_id = ? AND jobSeeker_id = ?',
      [jobId, jobSeekerId]
    );

    if (existingApplication.length > 0) {
      return res.json({ success: false });
    }

    // 새로운 지원 정보 저장
    await pool.query(
      'INSERT INTO JobPost_Status (job_id, jobSeeker_id) VALUES (?, ?)',
      [jobId, jobSeekerId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false });
  }
});


// 고용주별 지원자 목록 조회 API
app.get('/api/employer/applications/:employerId', async (req, res) => {
  const { employerId } = req.params;
  
  try {
    const query = `
      SELECT js.*, pj.title
      FROM JobPost_Status js
      JOIN PostJob pj ON js.job_id = pj.id
      WHERE pj.employer_id = ?
      ORDER BY js.applied_at DESC
    `;
    
    const [applications] = await pool.query(query, [employerId]);
    res.json({ success: true, applications });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 지원자 상세 정보 조회 API
app.get('/api/employer/applicant-detail/:jobSeekerId/:jobId', async (req, res) => {
  const { jobSeekerId, jobId } = req.params;
  
  try {
    // JobPost_Status에서 해당 지원 정보의 id와 상태 조회
    const [applicationStatus] = await pool.query(
      'SELECT * FROM JobPost_Status WHERE jobSeeker_id = ? AND job_id = ?',
      [jobSeekerId, jobId]
    );

    // 공고 정보 조회
    const [jobPost] = await pool.query(
      'SELECT title, company_name FROM PostJob WHERE id = ?',
      [jobId]
    );

    // 지원자 기본 정보 조회
    const [normalInfo] = await pool.query(
      'SELECT name, email, phone, birthDate FROM NormalInformation WHERE jobSeeker_id = ?',
      [jobSeekerId]
    );

    // 학력 정보 조회
    const [education] = await pool.query(
      'SELECT university_type, school_name, major, graduation_status FROM GradeInformation WHERE jobSeeker_id = ?',
      [jobSeekerId]
    );

    // 자기소개서 조회
    const [careerStatement] = await pool.query(
      'SELECT growth_process, personality, motivation, aspiration, career_history FROM career_statements WHERE jobSeeker_id = ?',
      [jobSeekerId]
    );

    // 모든 정보를 하나의 객체로 조합
    const detail = {
      id: applicationStatus[0]?.id,
      jobSeeker_id: applicationStatus[0]?.jobSeeker_id,
      job_id: applicationStatus[0]?.job_id,
      application_status: applicationStatus[0]?.application_status,
      jobPost: jobPost[0] || { title: '정보 없음', company_name: '정보 없음' },
      applicant: {
        ...normalInfo[0] || { name: '정보 없음', email: '정보 없음', phone: '정보 없음', birthDate: '정보 없음' },
        education: education[0] || {
          university_type: '정보 없음',
          school_name: '정보 없음',
          major: '정보 없음',
          graduation_status: '정보 없음'
        },
        careerStatement: careerStatement[0] || {
          growth_process: '정보 없음',
          personality: '정보 없음',
          motivation: '정보 없음',
          aspiration: '정보 없음',
          career_history: '정보 없음'
        }
      }
    };

    res.json({ success: true, detail });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});


// 지원 상태 업데이트 API
app.put('/api/employer/update-status/:applicationId', async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  
  try {
    // 상태 유효성 검사 추가
    const validStatuses = ['합격', '불합격', '면접 요망'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: '유효하지 않은 상태값입니다.' 
      });
    }

    await pool.query(
      'UPDATE JobPost_Status SET application_status = ? WHERE id = ?',
      [status, applicationId]
    );

    res.json({
      success: true,
      message: `지원자 상태가 "${status}"(으)로 업데이트되었습니다.`
    });
  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({
      success: false,
      message: '상태 업데이트 실패',
      error: error.message
    });
  }
});

// 구직자별 지원 현황 조회 API
app.get('/api/jobseeker/applications/:jobSeekerId', async (req, res) => {
  const { jobSeekerId } = req.params;
  
  try {
    const query = `
      SELECT 
        js.*,
        pj.title,
        pj.company_name,
        pj.location,
        pj.qualification_type
      FROM JobPost_Status js
      JOIN PostJob pj ON js.job_id = pj.id
      WHERE js.jobSeeker_id = ?
      ORDER BY js.applied_at DESC
    `;
    
    const [applications] = await pool.query(query, [jobSeekerId]);
    res.json({ success: true, applications });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인 공고 전체 조회 API
app.get('/api/postManagement/getAllPostJob', async (req, res) => {
  try {
    const query = 'SELECT id, title, contents, company_name FROM PostJob';
    
    const [applications] = await pool.query(query);
    res.json({ success: true, applications });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 구인 공고 매니저 삭제 API
app.delete('/api/postManagement/deleteManagerPostJob/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); // 트랜잭션 시작

    const query = 'DELETE FROM PostJob WHERE id = ?';
    const [result] = await connection.query(query, [id]);

    // 삭제 결과 확인
    if (result.affectedRows === 0) {
      await connection.rollback(); // 롤백
      return res.status(404).json({ success: false, message: '삭제할 데이터가 없습니다.' });
    }

    await connection.commit(); // 트랜잭션 커밋
    res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error) {
    await connection.rollback(); // 롤백
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  } finally {
    connection.release(); // 연결 반환
  }
});

// 전체 사용자 목록 조회 API
app.get('/api/users', async (req, res) => {
  const { type } = req.query;
  
  try {
    let employers = [];
    let jobSeekers = [];

    // type에 따라 필요한 데이터만 조회
    if (type === 'all' || type === 'employer') {
      const [employerRows] = await pool.query('SELECT id, department_name, phone_number, email FROM employer');
      employers = employerRows;
    }

    if (type === 'all' || type === 'jobSeeker') {
      const [jobSeekerRows] = await pool.query('SELECT id, email FROM jobSeeker');
      jobSeekers = jobSeekerRows;
    }

    res.json({ 
      success: true, 
      users: {
        employers,
        jobSeekers
      }
    });
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 게시물 조회
app.get('/api/postManagement/selectManagerPostJob', async (req, res) => {
  const { category, keyword } = req.query;
  

  let query = 'SELECT id, title, contents, company_name FROM PostJob WHERE 1=1';
  const queryParams = [];

  // category 값이 있으면 조건 추가
  if (category) {
    if(category == 1) {
      query += ' AND title LIKE ?'
    }
    else if(category == 2) {
      query += ' AND contents LIKE ?';
    }
    else if(category == 3) {
      query += ' AND company_name LIKE ?'
    }
  }

  // keyword 값이 있으면 조건 추가
  if (keyword) {
    queryParams.push(`%${keyword}%`);
  }

  try {
    const [results] = await pool.query(query, queryParams);
    res.json({success: true, results}); // 결과 반환
  } catch (error) {
    console.error('쿼리 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 사용자 삭제 API
app.delete('/api/users/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  
  try {
    await pool.query('START TRANSACTION');
    
    if (type === 'employer') {
      await pool.query('DELETE FROM JobPost_Status WHERE job_id IN (SELECT id FROM PostJob WHERE employer_id = ?)', [id]);
      await pool.query('DELETE FROM PostJob WHERE employer_id = ?', [id]);
      await pool.query('DELETE FROM employer WHERE id = ?', [id]);
    } else if (type === 'jobSeeker') {
      await pool.query('DELETE FROM JobPost_Status WHERE jobSeeker_id = ?', [id]);
      await pool.query('DELETE FROM career_statements WHERE jobSeeker_id = ?', [id]);
      await pool.query('DELETE FROM certifications WHERE jobSeeker_id = ?', [id]);
      await pool.query('DELETE FROM ExperienceActivity WHERE jobSeeker_id = ?', [id]);
      await pool.query('DELETE FROM GradeInformation WHERE jobSeeker_id = ?', [id]);
      await pool.query('DELETE FROM jobSeeker WHERE id = ?', [id]);
    }

    await pool.query('COMMIT');
    res.json({ success: true, message: '사용자가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('데이터베이스 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`));
