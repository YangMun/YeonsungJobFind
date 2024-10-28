import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api',
  default: 'http://localhost:3000/api', // 웹이나 다른 플랫폼을 위한 기본값
});

interface ValidationResult {
  isValid: boolean;
  message: string;
}

interface SignUpResult {
  success: boolean;
  message: string;
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

interface NormalInfoData {
  name: string;
  birthDate: string;
  email: string;
  phone: string;
}

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

// 자격 데이터 인터페이스 추가
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
    const response = await axios.post(`${API_URL}/validate-jobseeker`, { studentId, email });
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
    const response = await axios.post(`${API_URL}/validate-employer`, { id });
    return response.data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    return { isValid: false, message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.' };
  }

  return { isValid: true, message: '유효성 검사 통과' };
};

export const signUpJobSeeker = async (
  studentId: string,
  email: string,
  password: string
): Promise<SignUpResult> => {
  try {
    const response = await axios.post(`${API_URL}/signup-jobseeker`, { studentId, email, password });
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
    const response = await axios.post(`${API_URL}/signup-employer`, { id, password, departmentName });
    return response.data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    return { success: false, message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.' };
  }
};

export const login = async (
  userType: 'jobSeeker' | 'employer',
  id: string,
  password: string
): Promise<SignUpResult> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { userType, id, password });
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

  // 휴대폰 번호 형식 확인
  const phoneRegex = /^\d{3}\d{3,4}\d{4}$/;
  if (!phoneRegex.test(data.phone)) {
    return { isValid: false, message: '올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)' };
  }

  return { isValid: true, message: '유효성 검사 통과' };
};

export const formatDate = (input: string): string => {
  const numericValue = input.replace(/[^0-9]/g, '');
  if (numericValue.length <= 4) return numericValue;
  return numericValue.slice(0, 4) + '.' + numericValue.slice(4, 6);
};

export const validateDate = (date: string): boolean => {
  const dateRegex = /^\d{4}\.(0[1-9]|1[0-2])$/;
  return dateRegex.test(date);
};

export const validateGradInfo = (data: GradInfoData): ValidationResult => {
  // 모든 필수 필드가 력되었는지 확인
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
    return { isValid: false, message: '학교명은 30자를 초과할 수 없습니다.' };
  }

  // 재학기간 형식 검사
  const dateRegex = /^\d{4}\.(0[1-9]|1[0-2])$/;
  if (!dateRegex.test(data.admissionDate) || !dateRegex.test(data.graduationDate)) {
    return { isValid: false, message: '재학기간은 YYYY.MM 형식으로 입력해주세요.' };
  }

  // 졸업여부 유효성 검사
  const graduationOptions = ['졸업', '재학중', '휴학중', '수료', '중퇴', '자퇴', '졸업예정'];
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

// ExperienceActivity 유효성 검사 함수
export const validateExperienceActivity = (data: ExperienceActivityData): ValidationResult => {
  // 모든 필드가 입력되었는지 확인
  if (!data.activityType || !data.organization || !data.startDate || !data.endDate || !data.description) {
    return { isValid: false, message: '모든 필드를 입력해주세요.' };
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

  // 활동내용 길이 검사
  if (data.description.length > 500) {
    return { isValid: false, message: '활동내용은 500자를 초과할 수 없습니다.' };
  }

  return { isValid: true, message: '유효성 검사 통과' };
};

// 날짜 포맷팅 함수 (YYYYMM -> YYYY-MM)
export const formatExperienceDate = (input: string): string => {
  const numericValue = input.replace(/[^0-9]/g, '');
  if (numericValue.length !== 6) return input;
  return numericValue.slice(0, 4) + '-' + numericValue.slice(4, 6);
};

// 날짜 유효성 검사 함수
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
    return { isValid: false, message: '올바른 날짜 형식이 아닙니다.' };
  }

  return { isValid: true, message: '유효성 검사 통과' };
};



