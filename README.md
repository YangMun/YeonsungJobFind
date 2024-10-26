# YEONSUNG_JOBFIND 프로젝트

## 프로젝트 개요
YEONSUNG_JOBFIND는 연성대학교 학생들을 위한 구직 플랫폼 앱입니다. 이 앱은 구직자, 고용주, 관리자를 위한 다양한 기능을 제공합니다.

## 기술 스택
- Frontend: React Native, TypeScript
- Backend: Node.js
- Database: MySQL (추정)

## 프로젝트 구조 상세 설명

YEONSUNG_JOBFIND
├── server
│   ├── node_modules: 서버 측 의존성 모듈
│   ├── uploads: 사용자 업로드 파일 저장 디렉토리
│   ├── package-lock.json: 서버 의존성 버전 고정 파일
│   ├── package.json: 서버 프로젝트 설정 및 의존성 정의
│   └── server.js: 메인 서버 파일, Express.js 기반 API 정의
├── src
│   ├── assets
│   │    ├── YeonsungLogo.png: 연성대학교 로고 이미지
│   │    └── default-profile.jpg: 기본 프로필 이미지
│   ├── auth
│   │   ├── components: 인증 관련 재사용 가능한 컴포넌트
│   │   ├── screens
│   │   │   ├── LoginScreen.tsx: 로그인 화면
│   │   │   └── SignUpScreen.tsx: 회원가입 화면
│   │   └── utils: 인증 관련 유틸리티 함수
│   ├── common
│   │   ├── components: 공통으로 사용되는 컴포넌트
│   │   ├── styles: 공통 스타일 정의
│   │   └── utils
│   │       ├── validationUtils.ts: 입력 유효성 검사 함수
│   │       └── imagePickerUtils.ts: 이미지 선택 관련 유틸리티
│   ├── employer
│   │   ├── components: 고용주 관련 재사용 가능한 컴포넌트
│   │   ├── screens
│   │   │   ├── EditJobScreen.tsx: 구인 공고 수정 화면
│   │   │   ├── EmployerMain.tsx: 고용주 메인 화면
│   │   │   ├── JobDetailScreen.tsx: 구인 공고 상세 화면
│   │   │   ├── JobListScreen.tsx: 구인 공고 목록 화면
│   │   │   ├── NotificationsScreen.tsx: 알림 화면
│   │   │   ├── PostJobScreen.tsx: 구인 공고 등록 화면
│   │   │   └── ProfileScreen.tsx: 고용주 프로필 화면
│   │   └── utils: 고용주 관련 유틸리티 함수
│   ├── jobSeeker
│   │   ├── components: 구직자 관련 재사용 가능한 컴포넌트
│   │   ├── screens
│   │   │   ├── profile
│   │   │   │   ├── ExperienceActivity.tsx: 경험/활동 정보 화면
│   │   │   │   ├── GradInfo.tsx: 학력 정보 화면
│   │   │   │   ├── JobSeekerProfileScreen.tsx: 구직자 프로필 메인 화면
│   │   │   │   ├── MyCareerEditView.tsx: 경력 정보 수정 화면
│   │   │   │   ├── NormalInfo.tsx: 기본 정보 화면
│   │   │   │   └── ProfileEditView.tsx: 프로필 수정 화면
│   │   │   ├── DetailScreen.tsx: 구인 공고 상세 화면
│   │   │   ├── HomeScreen.tsx: 구직자 홈 화면
│   │   │   ├── JobSeekerMain.tsx: 구직자 메인 화면
│   │   │   ├── MessageScreen.tsx: 메시지 화면
│   │   │   └── NotificationScreen.tsx: 알림 화면
│   │   └── utils: 구직자 관련 유틸리티 함수
│   ├── manager
│   │   ├── components: 관리자 관련 컴포넌트 (향후 구현 예정)
│   │   ├── screens: 관리자 화면 (향후 구현 예정)
│   │   └── utils: 관리자 관련 유틸리티 (향후 구현 예정)
│   ├── navigation
│   │   └── AppNavigator.tsx: 앱 전체 네비게이션 구조 정의
│   └── context
│       └── AuthContext.tsx: 인증 상태 관리를 위한 Context
├── .gitignore: Git 버전 관리에서 제외할 파일 목록
├── app.json: Expo 설정 파일
├── App.tsx: 앱의 진입점, 전체 구조 정의
├── babel.config.js: Babel 설정 파일
├── package-lock.json: 프로젝트 의존성 버전 고정 파일
├── package.json: 프로젝트 설정 및 의존성 정의
└── tsconfig.json: TypeScript 설정 파일

## 데이터베이스 구조 (DBText.txt 참고)
주요 테이블:
- manager: 관리자 정보
- employer: 고용주 정보
- jobSeeker: 구직자 기본 정보
- NormalInformation: 구직자 상세 정보
- GradeInformation: 구직자 학력 정보
- ExperienceActivity: 구직자 경험 및 활동 정보
- PostJob: 구인 공고 정보

## 설치 및 실행 방법
1. 저장소 클론:
   ```
   git clone [저장소 URL]
   ```
2. 의존성 설치:
   ```
   npm install
   cd server && npm install
   ```
3. 앱 실행:
   ```
   mpx expo start 
   -> i (ios)
   -> a (안드로이드)
   -> r (재실행)
   ```
4. 서버 실행:
   ```
   cd server && npm start
   ```

   ## 주요 사용 라이브러리

### Frontend (React Native)
- @react-navigation/native: 네비게이션 구조 관리
- @react-navigation/stack: 스택 네비게이션 구현
- @react-native-async-storage/async-storage: 로컬 데이터 저장
- axios: HTTP 요청 처리
- expo: React Native 개발 환경
- expo-image-picker: 이미지 선택 기능
- react-native-calendars: 달력 컴포넌트
- react-native-gesture-handler: 터치 및 제스처 핸들링
- react-native-safe-area-context: 안전 영역 관리
- @expo/vector-icons: 아이콘 사용