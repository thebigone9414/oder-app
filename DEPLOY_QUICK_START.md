# Render.com 빠른 배포 가이드

## 🚀 빠른 배포 순서 (5분 안에 완료)

### 1️⃣ PostgreSQL 데이터베이스 생성 (1분)

1. Render.com 대시보드 → "New +" → "PostgreSQL"
2. 설정:
   - **Name**: `order-app-db`
   - **Database**: `order_app`
   - **Plan**: Free
3. "Create Database" 클릭
4. 생성 후 "Connections" 탭에서 **Internal Database URL** 복사

### 2️⃣ 백엔드 서버 배포 (2분)

1. Render.com 대시보드 → "New +" → "Web Service"
2. GitHub 저장소 연결
3. 설정:
   - **Name**: `order-app-backend`
   - **Root Directory**: `server` ⚠️ **중요: 반드시 설정**
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` ⚠️ **중요: `node index.js`가 아닌 `npm start` 또는 `node src/index.js`**
4. **환경 변수 추가** (Environment 섹션):
   ```
   NODE_ENV=production
   PORT=10000
   ```
5. **데이터베이스 연결**:
   - "Add Database" 버튼 클릭
   - 1단계에서 생성한 `order-app-db` 선택
   - Render가 자동으로 환경 변수 생성:
     - `DATABASE_URL` (자동 생성)
   - 또는 수동으로 추가:
     ```
     DB_HOST=<데이터베이스 호스트>
     DB_PORT=5432
     DB_NAME=order_app
     DB_USER=<사용자>
     DB_PASSWORD=<비밀번호>
     ```
6. "Create Web Service" 클릭
7. 배포 완료 후 URL 확인 (예: `https://order-app-backend.onrender.com`)

### 3️⃣ 프런트엔드 배포 (2분)

1. Render.com 대시보드 → "New +" → "Static Site"
2. GitHub 저장소 연결
3. 설정:
   - **Name**: `order-app-frontend`
   - **Root Directory**: `ui`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **환경 변수 추가**:
   ```
   VITE_API_URL=https://order-app-backend.onrender.com/api
   ```
   ⚠️ **중요**: `order-app-backend.onrender.com`을 2단계에서 생성한 실제 백엔드 URL로 변경하세요!
5. "Create Static Site" 클릭
6. 배포 완료 후 URL 확인 (예: `https://order-app-frontend.onrender.com`)

### 4️⃣ 백엔드 CORS 설정 업데이트 (30초)

1. 백엔드 서비스 → "Environment" 탭
2. 환경 변수 추가:
   ```
   FRONTEND_URL=https://order-app-frontend.onrender.com
   ```
   ⚠️ **중요**: `order-app-frontend.onrender.com`을 3단계에서 생성한 실제 프런트엔드 URL로 변경하세요!
3. 서비스가 자동으로 재배포됩니다

## ✅ 배포 확인

### 1. 데이터베이스 초기화 확인
- 백엔드 서비스 → "Logs" 탭 확인
- "✅ 데이터베이스 스키마 생성 완료" 메시지 확인
- "✅ 초기 데이터 삽입 완료" 메시지 확인

### 2. API 테스트
브라우저에서 다음 URL 접속:
- 헬스 체크: `https://order-app-backend.onrender.com/health`
- 메뉴 API: `https://order-app-backend.onrender.com/api/menus`

### 3. 프런트엔드 테스트
- 프런트엔드 URL 접속: `https://order-app-frontend.onrender.com`
- 메뉴가 표시되는지 확인
- 주문 기능 테스트

## 🔧 문제 해결

### 데이터베이스 연결 오류
- 환경 변수가 올바른지 확인
- Internal Database URL 사용 확인
- 백엔드 로그에서 오류 메시지 확인

### CORS 오류
- `FRONTEND_URL` 환경 변수가 올바른지 확인
- 프런트엔드 URL과 정확히 일치하는지 확인 (http/https, www 포함 여부)

### 빌드 실패
- `package.json` 확인
- 빌드 로그에서 오류 메시지 확인
- Node.js 버전 확인 (Render는 자동으로 최신 LTS 사용)

## 📝 참고사항

### Free 플랜 제한사항
- 15분간 비활성화 시 sleep 상태
- 첫 요청 시 약 30초 cold start
- 월 750시간 무료

### 프로덕션 권장사항
- Paid 플랜 사용 시 항상 실행 상태
- 정기적인 백업 설정
- 환경 변수 안전하게 관리

## 🎯 배포 체크리스트

- [ ] PostgreSQL 데이터베이스 생성
- [ ] 백엔드 서버 배포
- [ ] 백엔드 환경 변수 설정 (DB 연결)
- [ ] 프런트엔드 배포
- [ ] 프런트엔드 환경 변수 설정 (API URL)
- [ ] 백엔드 FRONTEND_URL 업데이트
- [ ] 헬스 체크 통과
- [ ] API 테스트 통과
- [ ] 프런트엔드 기능 테스트 통과

