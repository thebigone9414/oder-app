# 프런트엔드 Render.com 배포 가이드

## 📋 배포 전 확인 사항

### 1. 코드 상태 확인
- ✅ `package.json`의 `build` 스크립트 확인
- ✅ `vite.config.js` 설정 확인
- ✅ API URL 환경 변수 사용 확인

### 2. 백엔드 URL 확인
- 백엔드 서버가 Render.com에 배포되어 있어야 합니다
- 백엔드 URL을 확인하세요: `https://oder-app-backend.onrender.com`

## 🚀 Render.com 배포 과정

### 1단계: Static Site 생성

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인

2. **새 Static Site 생성**
   - "New +" 버튼 클릭
   - "Static Site" 선택

3. **GitHub 저장소 연결**
   - GitHub 계정 연결 (처음이면)
   - 저장소 선택: `thebigone9414/oder-app` (또는 실제 저장소 이름)

### 2단계: 배포 설정

**기본 설정:**
- **Name**: `order-app-frontend` (또는 원하는 이름)
- **Branch**: `main` (또는 기본 브랜치)
- **Root Directory**: `ui` ⚠️ **중요: 반드시 설정**
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist` ⚠️ **중요: Vite 빌드 출력 디렉토리**

### 3단계: 환경 변수 설정

**Environment Variables 섹션에서 추가:**

```
VITE_API_URL=https://oder-app-backend.onrender.com/api
```

⚠️ **중요 사항:**
- 실제 백엔드 URL: `https://oder-app-backend.onrender.com`
- 환경 변수 값: `https://oder-app-backend.onrender.com/api` (⚠️ `/api` 포함 필수)
- 환경 변수 이름은 반드시 `VITE_`로 시작해야 합니다 (Vite 요구사항)

### 4단계: 배포 실행

1. "Create Static Site" 버튼 클릭
2. 배포 진행 상황 확인 (약 2-3분 소요)
3. 배포 완료 후 URL 확인 (예: `https://order-app-frontend.onrender.com`)

### 5단계: 백엔드 CORS 설정 업데이트

프런트엔드 배포 후 백엔드의 CORS 설정을 업데이트해야 합니다:

1. **백엔드 서비스 설정**
   - Render.com 대시보드 → 백엔드 서비스 클릭
   - "Environment" 탭으로 이동

2. **환경 변수 추가/수정**
   ```
   FRONTEND_URL=https://order-app-frontend.onrender.com
   ```
   ⚠️ 실제 프런트엔드 URL로 변경하세요

3. **서비스 재배포**
   - 환경 변수 저장 시 자동으로 재배포됩니다
   - 또는 "Manual Deploy" → "Deploy latest commit" 클릭

## ✅ 배포 확인

### 1. 프런트엔드 접속 확인
- 프런트엔드 URL 접속: `https://order-app-frontend.onrender.com`
- 페이지가 정상적으로 로드되는지 확인

### 2. API 연결 확인
- 브라우저 개발자 도구 (F12) → Console 탭 확인
- 네트워크 탭에서 API 요청이 성공하는지 확인
- 메뉴가 정상적으로 표시되는지 확인

### 3. 기능 테스트
- 메뉴 선택 및 장바구니 추가
- 주문하기 기능
- 관리자 화면 접속 및 기능 확인

## 🔧 문제 해결

### 빌드 실패
- **원인**: `package.json`의 의존성 문제
- **해결**: 로컬에서 `npm install && npm run build` 실행하여 확인

### API 연결 오류 (CORS)
- **원인**: 백엔드의 `FRONTEND_URL` 환경 변수가 올바르지 않음
- **해결**: 백엔드 환경 변수에서 프런트엔드 URL 확인 및 수정

### 환경 변수가 적용되지 않음
- **원인**: 환경 변수 이름이 `VITE_`로 시작하지 않음
- **해결**: `VITE_API_URL`로 설정 확인

### 404 오류 (페이지 새로고침 시)
- **원인**: Static Site의 라우팅 설정 필요
- **해결**: Render.com의 "Redirects/Rewrites" 설정 필요 (현재는 SPA이므로 문제 없음)

## 📝 배포 체크리스트

- [ ] GitHub 저장소에 최신 코드 푸시
- [ ] 백엔드 서버가 정상 작동 중인지 확인
- [ ] 백엔드 URL 확인 및 기록
- [ ] Render.com에서 Static Site 생성
- [ ] Root Directory: `ui` 설정
- [ ] Build Command: `npm install && npm run build` 설정
- [ ] Publish Directory: `dist` 설정
- [ ] 환경 변수 `VITE_API_URL` 설정 (백엔드 URL 포함)
- [ ] 배포 완료 확인
- [ ] 프런트엔드 URL 접속 테스트
- [ ] API 연결 확인
- [ ] 백엔드 `FRONTEND_URL` 환경 변수 업데이트
- [ ] 전체 기능 테스트

## 🎯 최종 확인 사항

### 환경 변수 요약

**프런트엔드 (Static Site):**
```
VITE_API_URL=https://oder-app-backend.onrender.com/api
```

**백엔드 (Web Service):**
```
FRONTEND_URL=https://order-app-frontend.onrender.com
NODE_ENV=production
PORT=10000
DATABASE_URL=<자동 설정 또는 수동>
```

### URL 예시

- 프런트엔드: `https://order-app-frontend.onrender.com` (배포 후 확인)
- 백엔드 API: `https://oder-app-backend.onrender.com`
- 헬스 체크: `https://oder-app-backend.onrender.com/health`
- 메뉴 API: `https://oder-app-backend.onrender.com/api/menus`

