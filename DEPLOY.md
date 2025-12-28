# Render.com 배포 가이드

## 배포 순서

### 1단계: PostgreSQL 데이터베이스 생성

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인 또는 회원가입

2. **새 PostgreSQL 데이터베이스 생성**
   - "New +" 버튼 클릭
   - "PostgreSQL" 선택
   - 설정:
     - **Name**: `order-app-db` (또는 원하는 이름)
     - **Database**: `order_app`
     - **User**: 자동 생성됨
     - **Region**: 가장 가까운 지역 선택
     - **PostgreSQL Version**: 최신 버전
     - **Plan**: Free 또는 원하는 플랜 선택
   - "Create Database" 클릭

3. **데이터베이스 연결 정보 확인**
   - 데이터베이스 생성 후 "Connections" 탭에서 확인:
     - **Internal Database URL**: 백엔드 서버에서 사용
     - **External Database URL**: 로컬에서 접속 시 사용
   - 연결 정보를 복사해두세요 (나중에 환경 변수로 사용)

### 2단계: 백엔드 서버 배포

1. **GitHub 저장소 준비**
   - 프로젝트를 GitHub에 푸시
   - 저장소가 Private이면 Render.com과 연결 필요

2. **Render.com에서 새 Web Service 생성**
   - "New +" 버튼 클릭
   - "Web Service" 선택
   - GitHub 저장소 연결

3. **백엔드 서버 설정**
   - **Name**: `order-app-backend` (또는 원하는 이름)
   - **Region**: 데이터베이스와 같은 지역 선택
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free 또는 원하는 플랜 선택

4. **환경 변수 설정**
   - "Environment" 섹션에서 다음 변수 추가:
     ```
     NODE_ENV=production
     PORT=10000
     DB_HOST=<데이터베이스 호스트>
     DB_PORT=5432
     DB_NAME=order_app
     DB_USER=<데이터베이스 사용자>
     DB_PASSWORD=<데이터베이스 비밀번호>
     FRONTEND_URL=<프런트엔드 URL (3단계에서 생성)>
     ```
   - **참고**: 데이터베이스 연결 정보는 PostgreSQL 서비스의 "Connections" 탭에서 확인
   - Internal Database URL을 파싱하여 각 필드 추출:
     - 형식: `postgresql://user:password@host:port/database`
     - 또는 Render.com의 "Environment" 탭에서 자동으로 제공되는 변수 사용

5. **배포**
   - "Create Web Service" 클릭
   - 배포 완료 후 URL 확인 (예: `https://order-app-backend.onrender.com`)

### 3단계: 프런트엔드 배포

1. **Static Site 생성**
   - "New +" 버튼 클릭
   - "Static Site" 선택
   - GitHub 저장소 연결

2. **프런트엔드 설정**
   - **Name**: `order-app-frontend` (또는 원하는 이름)
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `ui`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://order-app-backend.onrender.com/api
     ```
   - **참고**: `order-app-backend.onrender.com`은 2단계에서 생성한 백엔드 URL

3. **배포**
   - "Create Static Site" 클릭
   - 배포 완료 후 URL 확인 (예: `https://order-app-frontend.onrender.com`)

### 4단계: 환경 변수 업데이트

1. **백엔드 환경 변수 업데이트**
   - 백엔드 서비스의 "Environment" 탭으로 이동
   - `FRONTEND_URL`을 프런트엔드 URL로 업데이트:
     ```
     FRONTEND_URL=https://order-app-frontend.onrender.com
     ```
   - 서비스 재시작 (자동으로 재배포됨)

2. **프런트엔드 환경 변수 확인**
   - 프런트엔드 서비스의 "Environment" 탭 확인
   - `VITE_API_URL`이 올바른지 확인

## 배포 후 확인 사항

### 1. 데이터베이스 초기화 확인
- 백엔드 서버 로그에서 데이터베이스 초기화 메시지 확인
- 테이블 생성 및 초기 데이터 삽입 확인

### 2. API 엔드포인트 테스트
- 백엔드 URL: `https://order-app-backend.onrender.com/health`
- 메뉴 API: `https://order-app-backend.onrender.com/api/menus`
- 주문 API: `https://order-app-backend.onrender.com/api/orders`

### 3. 프런트엔드 연결 확인
- 프런트엔드 URL 접속
- 메뉴가 정상적으로 표시되는지 확인
- 주문 기능 테스트

## 문제 해결

### 데이터베이스 연결 오류
- 환경 변수가 올바르게 설정되었는지 확인
- Internal Database URL 사용 확인 (External URL 아님)
- 데이터베이스가 실행 중인지 확인

### CORS 오류
- 백엔드의 `FRONTEND_URL` 환경 변수가 올바른지 확인
- 프런트엔드 URL과 일치하는지 확인

### 빌드 오류
- `package.json`의 스크립트 확인
- Node.js 버전 확인 (Render.com은 기본적으로 최신 LTS 사용)
- 빌드 로그 확인

## 참고 사항

- **Free 플랜 제한사항**:
  - 서비스가 15분간 비활성화되면 자동으로 sleep 상태로 전환
  - 첫 요청 시 약 30초 정도의 cold start 시간 소요
  - 월 750시간 무료 (한 달 내내 실행 가능)

- **프로덕션 환경 권장사항**:
  - Paid 플랜 사용 시 항상 실행 상태 유지
  - 환경 변수는 민감한 정보이므로 안전하게 관리
  - 정기적인 백업 설정

## 배포 체크리스트

- [ ] PostgreSQL 데이터베이스 생성 완료
- [ ] 데이터베이스 연결 정보 확인
- [ ] 백엔드 서버 배포 완료
- [ ] 백엔드 환경 변수 설정 완료
- [ ] 프런트엔드 배포 완료
- [ ] 프런트엔드 환경 변수 설정 완료
- [ ] 백엔드 FRONTEND_URL 업데이트
- [ ] 헬스 체크 통과
- [ ] API 엔드포인트 테스트 통과
- [ ] 프런트엔드 기능 테스트 통과

