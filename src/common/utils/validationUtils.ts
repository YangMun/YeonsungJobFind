import axios from 'axios';
import { Platform } from 'react-native';

export const API_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000'
});

interface ValidationResult {
  isValid: boolean;
  message: string;
}

interface SignUpResult {
  success: boolean;
  message: string;
}

// ProfileData 인터페이스 정의
export interface ProfileData {
  department_name: string;
  phone_number: string;
  email: string;
}

export interface Message {
  id: string;
  text?: string;
  image?: any;
  isUser: boolean;
}

interface PostJobData {
  title: string;
  contents: string;
  companyName: string;
  location: string;
  qualificationType: string;
  workPeriodStart: string;
  workPeriodEnd: string;
  recruitmentDeadline: string;
  hourlyWage: string;
  applicationMethod: string;
  contactNumber: string;
}

interface PostJobValidationResult {
  isValid: boolean;
  message: string;
}

export interface Job {
  id: number;
  title: string;
  company_name: string;
  contents: string;
  recruitment_deadline: string;
  location: string;
}

export interface JobDetail {
  id: number;
  title: string;
  contents: string;
  company_name: string;
  location: string;
  qualification_type: string;
  work_period_start: string;
  work_period_end: string;
  recruitment_deadline: string;
  hourly_wage: number;
  application_method: string;
  contact_number: string;
}

// 기본 정보 인터페이스를 export하고 필수 필드 정의
export interface NormalInfoData {
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  image?: string;     // 선택적 필드
  gender?: string;    // 선택적 필드
}

// 필요한 경우 NormalInfoData를 확장하여 사용
export type NormalInfoDisplay = Pick<NormalInfoData, 'name' | 'birthDate' | 'gender' | 'phone' | 'email'> & {
  image: string;  // 필수 필드로 변경
};

export interface GradInfoData {
  jobSeekerId: string;
  universityType: string;
  schoolName: string;
  region: string;
  admissionDate: string;
  graduationDate: string;
  graduationStatus: string;
  major: string;
}

// GradInfoDisplay 타입 추가
export type GradInfoDisplay = Pick<GradInfoData, 'universityType' | 'schoolName' | 'region' | 'admissionDate' | 'graduationDate' | 'graduationStatus' | 'major'>;

// snake_case에서 camelCase로 변환하는 함수 추가
export const convertGradInfo = (serverData: any): GradInfoDisplay => {
  return {
    universityType: serverData.university_type,
    schoolName: serverData.school_name,
    region: serverData.region,
    admissionDate: serverData.admission_date,
    graduationDate: serverData.graduation_date,
    graduationStatus: serverData.graduation_status,
    major: serverData.major,
  };
};

// 자격 이터 인터페이스 추가
export interface CertificationData {
  certificationName: string;
  issuingOrganization: string;
  acquisitionDate: string;
}

// Certification 인터페이스 추가
export interface Certification {
  id: number;
  certification_name: string;
  issuing_organization: string;
  acquisition_date: string;
}

// 변환 함수 추가
export const convertCertification = (serverData: Certification): CertificationData => {
  return {
    certificationName: serverData.certification_name,
    issuingOrganization: serverData.issuing_organization,
    acquisitionDate: serverData.acquisition_date
  };
};

// 자기소개서 섹션 인페이스 추가
export interface CareerSectionData {
  title: string;
  text: string;
}

// CareerStatement 인터페이스 추가
export interface CareerStatement {
  growth_process: string;
  personality: string;
  motivation: string;
  aspiration: string;
  career_history: string;
}

export const validateJobSeeker = async (
  studentId: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<ValidationResult> => {
  // 모든 필드가 입력되었는지 확인
  if (!studentId || !email || !password || !confirmPassword) {
    return { isValid: false, message: '모든 필드를 입력해주세요.' };
  }

  // 비밀번호 일치 확인
  if (password !== confirmPassword) {
    return { isValid: false, message: '비밀번호가 일치하지 않습니다.' };
  }

  // 이메일 형식 확인
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: '올바른 이메일 형식이 아닙니다.' };
  }

  // 길이 확인
  if (studentId.length > 15 || email.length > 30 || password.length > 20) {
    return { isValid: false, message: '입력 길이가 제한을 초과했습니다.' };
  }

  // DB에 이미 존재하는 학번 또는 이메일인지 확인
  try {
    const response = await axios.post(`${API_URL}/api/validate-jobseeker`, { studentId, email });
    return response.data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    return { isValid: false, message: '서버 오류가 발생했습니다. 나에 다시 시도해주세요.' };
  }
};

export const validateEmployer = async (
  id: string,
  departmentName: string,
  password: string,
  confirmPassword: string
): Promise<ValidationResult> => {
  // 모든 필드가 입력되었는지 확인
  if (!id || !departmentName || !password || !confirmPassword) {
    return { isValid: false, message: '모든 필드를 입력해주세요.' };
  }

  // 비밀번호 일치 확인
  if (password !== confirmPassword) {
    return { isValid: false, message: '비밀번호가 일치하지 않습니다.' };
  }

  // 길이 검사
  if (id.length > 7 || departmentName.length > 15 || password.length > 15) {
    return { isValid: false, message: '입력 길이가 제한을 초과했습니다.' };
  }

  // DB에 이미 존재하는 아이디인지 확인
  try {
    const response = await axios.post(`${API_URL}/api/validate-employer`, { id });
    return response.data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    return { isValid: false, message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.' };
  }
};

export const signUpJobSeeker = async (
  studentId: string,
  email: string,
  password: string
): Promise<SignUpResult> => {
  try {
    const response = await axios.post(`${API_URL}/api/signup-jobseeker`, { studentId, email, password });
    return response.data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    return { success: false, message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.' };
  }
};

export const signUpEmployer = async (
  id: string,
  password: string,
  departmentName: string
): Promise<SignUpResult> => {
  try {
    const response = await axios.post(`${API_URL}/api/signup-employer`, { id, password, departmentName });
    return response.data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    return { success: false, message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.' };
  }
};

export const login = async (
  userType: 'jobSeeker' | 'employer' | 'manager',
  id: string,
  password: string
): Promise<SignUpResult> => {
  try {
    const response = await axios.post(`${API_URL}/api/login`, { userType, id, password });
    return response.data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    return { success: false, message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.' };
  }
};


export const validatePostJob = (data: PostJobData): PostJobValidationResult => {
  // 1. 모든 필드가 입력되었는 확인
  for (const [key, value] of Object.entries(data)) {
    if (!value || value.trim() === '') {
      return { isValid: false, message: '모든 항목을 입력하세요' };
    }
  }

  // 2. 시급이 숫자인지 확인
  const hourlyWageRegex = /^\d+$/;
  if (!hourlyWageRegex.test(data.hourlyWage)) {
    return { isValid: false, message: '모든 항목을 입력하세요' };
  }

  // 3. 날짜 형식 확인 (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.workPeriodStart) || !dateRegex.test(data.workPeriodEnd) || !dateRegex.test(data.recruitmentDeadline)) {
    return { isValid: false, message: '날짜 형식이 안 맞아요' };
  }

  // 4. 전화번호 형식 확인 (선택적)
  const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
  if (!phoneRegex.test(data.contactNumber)) {
    return { isValid: false, message: '전화번호 형식이 다릅니다.' };
  }

  // contents 필드 길이 검사 추가
  if (data.contents.length > 500) {
    return { isValid: false, message: '상세 내용은 500자를 초과할 수 없습니다.' };
  }

  return { isValid: true, message: '유효성 검사 통과' };
};

export const validateNormalInfo = (data: NormalInfoData): ValidationResult => {
  // 필수 필드 확인
  if (!data.name || !data.birthDate || !data.email || !data.phone) {
    return { isValid: false, message: '이름, 생년월일, 이메일, 휴대폰 번호는 필수 입력 항목입니다.' };
  }

  // 이름 길이 확인
  if (data.name.length > 5) {
    return { isValid: false, message: '이름은 5자를 초과할 수 없습니다.' };
  }

  // 생년월일 형식 확인 (YYYYMMDD)
  const birthDateRegex = /^\d{8}$/;
  if (!birthDateRegex.test(data.birthDate)) {
    return { isValid: false, message: '생년월일은 YYYYMMDD 형식으로 입력해주세요.' };
  }

  // 이메일 형식 확인
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { isValid: false, message: '올바른 이메일 형식이 아닙니다.' };
  }

  // 휴대폰 번호 형 확인
  const phoneRegex = /^\d{3}\d{3,4}\d{4}$/;
  if (!phoneRegex.test(data.phone)) {
    return { isValid: false, message: '올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)' };
  }

  return { isValid: true, message: '유효성 검사 통과' };
};

export const formatDate = (dateString: string): string => {
  // 이 YYYY-MM-DD 형식이면 그대로 반환
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  const date = new Date(dateString);
  // 로컬 시간으로 변환
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const validateDate = (date: string): boolean => {
  // YYYY.MM 형식 검사
  const dateRegex = /^\d{4}\.(0[1-9]|1[0-2])$/;
  if (!dateRegex.test(date)) return false;

  // 년도와 월이 유효한지 검사
  const [year, month] = date.split('.');
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);

  const currentYear = new Date().getFullYear();

  return yearNum >= 1900 && 
         yearNum <= currentYear + 10 && 
         monthNum >= 1 && 
         monthNum <= 12;
};

export const validateGradInfo = (data: GradInfoData): ValidationResult => {
  // 모 필수 필드가 력되었는지 확인
  if (!data.universityType || !data.schoolName || !data.admissionDate || !data.graduationDate || !data.graduationStatus || !data.major) {
    return { isValid: false, message: '모든 필수 항목을 입력해주세요.' };
  }

  // 대학 유효성 검사
  const universityOptions = ['대학(2,3년)', '대학교(4년)', '대학원(석사)', '대학원(박사)'];
  if (!universityOptions.includes(data.universityType)) {
    return { isValid: false, message: '올바른 대학 유형을 선택해주세요.' };
  }

  // 학교명 길이 검사
  if (data.schoolName.length > 30) {
    return { isValid: false, message: '학교명은 30자를 초과 수 없습니다.' };
  }

  // 재학기간 형식 검사
  const dateRegex = /^\d{4}\.(0[1-9]|1[0-2])$/;
  if (!dateRegex.test(data.admissionDate) || !dateRegex.test(data.graduationDate)) {
    return { isValid: false, message: '재학기간은 YYYY.MM 형식��로 입력해주세요.' };
  }

  // 졸업여부 유효성 사
  const graduationOptions = ['졸업', '재학중', '휴학중', '수료', '중', '자퇴', '졸업예정'];
  if (!graduationOptions.includes(data.graduationStatus)) {
    return { isValid: false, message: '올바른 졸업여부를 선택해주세요.' };
  }

  // 전공 길이 검사
  if (data.major.length > 15) {
    return { isValid: false, message: '전공은 15자를 초과할 수 없습니다.' };
  }

  return { isValid: true, message: '유효성 검사 통과' };
};

// ActivityItem 인터페이스 추가
export interface ActivityItem {
  id: number;
  organization: string;
  activity_type: string;
  start_date: string;
  end_date: string;
  description: string;
}

// ExperienceActivity 인터페이스 추가
export interface ExperienceActivityData {
  activityType: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

// 서버 응답 데이터 인터페이스
interface ExperienceActivityResponse {
  id: number;
  activity_type: string;
  organization: string;
  start_date: string;
  end_date: string;
  description: string;
}

// 변환 함수 추가
export const convertExperienceActivity = (serverData: ExperienceActivityResponse): ExperienceActivityData => {
  return {
    activityType: serverData.activity_type,
    organization: serverData.organization,
    startDate: serverData.start_date,
    endDate: serverData.end_date,
    description: serverData.description
  };
};

// ExperienceActivity 유효성 검사 함수
export const validateExperienceActivity = (data: ExperienceActivityData): ValidationResult => {
  // 모든 필드가 입력되었는지 확인
  if (!data.activityType || !data.organization || !data.startDate || !data.endDate || !data.description) {
    return { isValid: false, message: '모 필드를 입력해주요.' };
  }

  // 동구분 유효성 검사
  const activityTypes = ['교내활동', '인턴', '자원봉사', '동아리', '아르바이트', '사회활동', '수행과제', '해외연수'];
  if (!activityTypes.includes(data.activityType)) {
    return { isValid: false, message: '올바른 활동구분을 선택해주세요.' };
  }

  // 기관/장소 길이 검사
  if (data.organization.length > 20) {
    return { isValid: false, message: '기관/장소는 20자를 초과할 수 없습니다.' };
  }

  // 날짜 형식 검사
  const dateRegex = /^\d{4}-\d{2}$/;
  if (!dateRegex.test(data.startDate) || !dateRegex.test(data.endDate)) {
    return { isValid: false, message: '날짜는 YYYY-MM 형식으로 입력해주세요.' };
  }

  // 활동내용 길�� 검사
  if (data.description.length > 500) {
    return { isValid: false, message: '활동내용은 500자를 초과할 수 없습니다.' };
  }

  return { isValid: true, message: '유효성 검사 통과' };
};

// 날짜 포맷팅 함수 (YYYYMM -> YYYY-MM)
export const formatExperienceDate = (input: string): string => {
  // 숫자만 추출
  const numericValue = input.replace(/[^0-9]/g, '');
  
  // 6자리 미만이면 그대로 반환
  if (numericValue.length < 6) return numericValue;
  
  // YYYY-MM 형식으로 변환
  const year = numericValue.slice(0, 4);
  let month = numericValue.slice(4, 6);
  
  // 월 숫자로 변환
  let monthNum = parseInt(month);
  
  // 월이 0이거나 12를 초과하는 경우 처리
  if (monthNum === 0 || monthNum > 12) {
    // 마지막 숫자를 사용하여 1~12 사이의 값으로 변환
    monthNum = parseInt(month.slice(-1));
    // 만약 마지막 숫자가 0이면 1로 설정
    if (monthNum === 0) monthNum = 1;
  }
  
  // 월을 2자리 문자열로 변환 (1 -> "01")
  month = monthNum.toString().padStart(2, '0');
  
  return `${year}-${month}`;
};

// 날짜 유효성 사 함수
export const validateExperienceDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}$/;
  return dateRegex.test(date);
};


// 자격증 유효성 검사 함수 추가
export const validateCertification = (data: CertificationData): ValidationResult => {
  // 모든 필드 입력 확인
  if (!data.certificationName) {
    return { isValid: false, message: '자격증명을 입력해주세요.' };
  }
  if (!data.issuingOrganization) {
    return { isValid: false, message: '발행처/기관을 입력해주세요.' };
  }
  if (!data.acquisitionDate) {
    return { isValid: false, message: '취득일을 선택해주세요.' };
  }

  // 길이 제한 검사
  if (data.certificationName.length > 50) {
    return { isValid: false, message: '자격증명은 50자를 초과할 수 없습니다.' };
  }
  if (data.issuingOrganization.length > 50) {
    return { isValid: false, message: '발행처/기관은 50자를 초과할 수 없습니다.' };
  }

  // 날짜 형식 검사 (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.acquisitionDate)) {
    return { isValid: false, message: '올바른 날짜 형식 아닙니다.' };
  }

  return { isValid: true, message: '유효성 검사 통과' };
};

// 활동기록 번호 포맷팅 함수 추가
export const formatActivityNumber = (input: string): string => {
  // 하이픈 제거 및 숫자만 추출
  const numericValue = input.replace(/[^0-9]/g, '');
  
  // 6자리 제한
  if (numericValue.length > 8) {
    return input.slice(0, -1);
  }
  
  // 4자리 이상일 때만 하이픈 추가
  if (numericValue.length >= 4) {
    const firstPart = numericValue.slice(0, 4);
    const secondPart = numericValue.slice(4);
    return `${firstPart}-${secondPart}`;
  }
  
  return numericValue;
};

// 활동기록 번호 유효성 검사 함수 추가
export const validateActivityNumber = (number: string): boolean => {
  const numberRegex = /^\d{4}-\d{2}$/;
  return numberRegex.test(number);
};

// 자기소개서 유효성 검사 함수 추가
export const validateCareerSections = (sections: CareerSectionData[]): ValidationResult => {
  // 모든 섹션이 입력되었는지 확인
  const emptySection = sections.find(section => !section.text.trim());
  if (emptySection) {
    return { 
      isValid: false, 
      message: `${emptySection.title}을(를) 입력해주세요.` 
    };
  }

  // 각 섹션의 글자 수 인
  const invalidSection = sections.find(section => section.text.length > 500);
  if (invalidSection) {
    return { 
      isValid: false, 
      message: `${invalidSection.title}은(는) 500자를 초과할 수 없습니다.` 
    };
  }

  // 각 섹션의 내용이 의미 있는 텍스트인지 확인 (공백만 있는 경우 체크)
  const invalidContentSection = sections.find(section => section.text.trim().length === 0);
  if (invalidContentSection) {
    return {
      isValid: false,
      message: `${invalidContentSection.title}에 의미 있는 내용을 입력해주세요.`
    };
  }

  // 특수문자나 이모지만으로 구성된 내용 체크
  const textOnlyRegex = /^[\s\S]*[a-zA-Z0-9가-힣]+[\s\S]*$/;
  const invalidFormatSection = sections.find(section => !textOnlyRegex.test(section.text));
  if (invalidFormatSection) {
    return {
      isValid: false,
      message: `${invalidFormatSection.title}에 텍스트를 포함해주세요.`
    };
  }

  return { isValid: true, message: '유효성 검사 통과' };
};

// 전화번호 마스킹 함수 수정
export const maskPhoneNumber = (phone: string): string => {
  // 숫자만 추출
  const numbers = phone.replace(/[^0-9]/g, '');
  
  // 11자리 전화번호 형식으로 마스킹
  if (numbers.length === 10 || numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-****-$3');
  }
  
  return phone; // 형식이 맞지 않으면 원본 반환
};

// 이메일 마스킹 함수 추가
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  const maskedUsername = username.slice(0, 3) + '*'.repeat(username.length - 3);
  return `${maskedUsername}@${domain}`;
};

//채용공고 상태 인터페이스 추가
export interface JobPostStatus {
  id: number;
  job_id: number;
  jobSeeker_id: string;
  application_status: string;
  applied_at: string;
  updated_at: string;
  qualification_type: string;
}

//채용공고 그룹화된 데이터 타입 정의
export interface GroupedJobPost {
  jobTitle: string;
  jobId: number;
  applicants: (JobPostStatus & {
    applicantName?: string;
    qualification_type?: string;
  })[];
}


// 기존 JobPostStatus 인터페이스를 확장
export interface NotificationItem extends JobPostStatus {
  title: string;          // PostJob 테이블의 title
  company_name: string;   // PostJob 테이블의 company_name
  location: string;
}

//채용공고 지원자 정보 인터페이스 추가
export interface JobPostDetail {
  id: number;
  jobSeeker_id: string;    
  job_id: number;         
  application_status: '지원 완료/검토중' | '합격' | '불합격' | '면접 요망';
  jobPost: {
    title: string;
    company_name: string;
  };
  applicant: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    education: {
      university_type: string;
      school_name: string;
      major: string;
      graduation_status: string;
    };
    careerStatement: {
      growth_process: string;
      personality: string;
      motivation: string;
      aspiration: string;
      career_history: string;
    };
  };
}