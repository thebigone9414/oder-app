# Order App Server

커피 주문 앱 백엔드 서버

## 기술 스택

- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL 클라이언트)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 데이터베이스 정보를 입력하세요.

```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env
# 또는 Windows에서
copy .env.example .env
```

**Windows:**
```bash
notepad .env
```

**Mac/Linux:**
```bash
nano .env
```

`.env` 파일의 내용:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_app
DB_USER=postgres
DB_PASSWORD=your_password_here
NODE_ENV=development
```

### 3. 데이터베이스 설정

**PostgreSQL 설치 및 데이터베이스 생성:**

1. **PostgreSQL이 설치되어 있어야 합니다.**

2. **데이터베이스 생성:**
   
   PostgreSQL에 접속하여 데이터베이스를 생성합니다:
   
   ```bash
   # psql 명령어로 접속
   psql -U postgres
   ```
   
   ```sql
   -- 데이터베이스 생성
   CREATE DATABASE order_app;
   
   -- 데이터베이스 확인
   \l
   
   -- 종료
   \q
   ```
   
   또는 SQL 파일 사용:
   ```bash
   psql -U postgres -f src/db/create-db.sql
   ```

3. **`.env` 파일 설정:**
   
   `server` 폴더의 `.env` 파일을 열어서 데이터베이스 연결 정보를 입력합니다:
   
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=order_app
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   NODE_ENV=development
   ```
   
   - `DB_PASSWORD`: PostgreSQL 사용자 비밀번호 (설치 시 설정한 비밀번호)
   - `DB_USER`: PostgreSQL 사용자명 (기본값: postgres)
   - `DB_NAME`: 생성한 데이터베이스 이름 (기본값: order_app)

4. **데이터베이스 스키마 자동 생성:**
   
   서버를 실행하면 자동으로 다음 작업이 수행됩니다:
   - 데이터베이스 연결 테스트
   - 테이블 생성 (Menus, Options, Orders, OrderItems)
   - 초기 데이터 삽입 (메뉴 3개, 옵션 6개)

**참고:** 
- 데이터베이스가 연결되지 않아도 서버는 실행되지만, API 기능은 사용할 수 없습니다.
- 서버 시작 시 데이터베이스 연결 상태가 콘솔에 표시됩니다.
- 데이터베이스가 존재하지 않으면 안내 메시지가 표시됩니다.

### 4. 서버 실행

**개발 모드 (자동 재시작):**
```bash
npm run dev
```

**프로덕션 모드:**
```bash
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회
- `GET /api/menus/:id` - 메뉴 상세 조회
- `PATCH /api/menus/:id/stock` - 재고 수정

### 주문 관련
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:id` - 주문 상세 조회
- `PATCH /api/orders/:id` - 주문 상태 변경

## 프로젝트 구조

```
server/
├── src/
│   ├── index.js              # 서버 진입점
│   ├── db/
│   │   └── connection.js     # 데이터베이스 연결
│   ├── middleware/
│   │   ├── errorHandler.js   # 에러 핸들링 미들웨어
│   │   └── requestLogger.js  # 요청 로깅 미들웨어
│   ├── utils/
│   │   ├── logger.js         # 로거 유틸리티
│   │   └── validateEnv.js    # 환경 변수 검증
│   ├── routes/               # API 라우트 (추후 추가)
│   ├── controllers/          # 컨트롤러 (추후 추가)
│   └── models/               # 데이터 모델 (추후 추가)
├── .env                      # 환경 변수 (로컬)
├── .gitignore
├── nodemon.json              # nodemon 설정
├── package.json
└── README.md
```

## 개발 환경 기능

### 로깅
- **morgan**: HTTP 요청 로깅 (개발/프로덕션 모드별 설정)
- **커스텀 로거**: 구조화된 로깅 (info, error, warn, debug)
- **요청 로깅**: 개발 모드에서 요청/응답 상세 정보 표시

### 에러 핸들링
- 중앙화된 에러 핸들링 미들웨어
- 개발 모드에서 상세한 에러 정보 제공
- 404 핸들러 포함

### 환경 변수
- 자동 환경 변수 검증
- 개발 모드에서 환경 변수 정보 출력
- 필수 변수 누락 시 경고

### 개발 도구
- **nodemon**: 파일 변경 시 자동 재시작
- **--watch 모드**: Node.js 내장 watch 기능 지원
- Graceful shutdown 지원 (SIGTERM, SIGINT)

