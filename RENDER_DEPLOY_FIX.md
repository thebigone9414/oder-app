# Render.com 배포 오류 해결 가이드

## 문제
```
Error: Cannot find module '/opt/render/project/src/server/index.js'
```

## 원인
Render.com이 기본적으로 `node index.js`를 실행하려고 하지만, 실제 진입점은 `src/index.js`에 있습니다.

## 해결 방법

### 방법 1: Start Command를 `npm start`로 설정 (권장)

Render.com 대시보드에서:
1. 백엔드 서비스 → "Settings" 탭
2. "Start Command" 필드 확인
3. 다음 중 하나로 설정:
   - `npm start` (권장)
   - 또는 `node src/index.js`

### 방법 2: Render.com 대시보드에서 직접 수정

1. **백엔드 서비스 설정 확인**
   - Render.com 대시보드 → 백엔드 서비스 클릭
   - "Settings" 탭으로 이동

2. **Start Command 수정**
   - "Start Command" 필드를 찾아서
   - 기존: `node index.js` (또는 비어있음)
   - 변경: `npm start`
   - 또는: `node src/index.js`

3. **Root Directory 확인**
   - "Root Directory" 필드가 `server`로 설정되어 있는지 확인

4. **저장 및 재배포**
   - "Save Changes" 클릭
   - 자동으로 재배포됩니다

### 방법 3: render.yaml 파일 사용 (자동 배포)

프로젝트 루트에 `render.yaml` 파일이 있으면:
- Render.com이 자동으로 설정을 읽어옵니다
- Start Command가 올바르게 설정되어 있는지 확인

## 확인 사항

### ✅ 올바른 설정
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start` 또는 `node src/index.js`
- **Environment**: `Node`

### ❌ 잘못된 설정
- **Start Command**: `node index.js` (잘못됨)
- **Start Command**: 비어있음 (기본값 사용 시 오류)

## package.json 확인

`server/package.json`의 start 스크립트:
```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

이미 올바르게 설정되어 있으므로, Render.com의 Start Command를 `npm start`로 설정하면 됩니다.

## 배포 후 확인

배포가 성공하면 로그에서 다음 메시지를 확인할 수 있습니다:
```
✅ 데이터베이스 연결 확인
✅ 데이터베이스 스키마 생성 완료
✅ 초기 데이터 삽입 완료
✅ API 서버 준비 완료: http://localhost:10000
```

## 추가 문제 해결

### 환경 변수 확인
다음 환경 변수가 설정되어 있는지 확인:
- `NODE_ENV=production`
- `PORT=10000`
- 데이터베이스 연결 정보 (DATABASE_URL 또는 개별 변수)

### 데이터베이스 연결 오류
- DATABASE_URL이 올바른지 확인
- 또는 DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD 확인

