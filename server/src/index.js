import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { testConnection } from './db/connection.js'
import { setupDatabase } from './db/init.js'
import { validateEnv, printEnvInfo } from './utils/validateEnv.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import logger from './utils/logger.js'

// 환경 변수 로드
dotenv.config()

// 환경 변수 검증
validateEnv()

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// 미들웨어 설정
app.use(cors({
  origin: NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'http://localhost:3000'] 
    : process.env.FRONTEND_URL,
  credentials: true
}))

// Body 파서
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 로깅 미들웨어
if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
  app.use(requestLogger)
} else {
  app.use(morgan('combined'))
}

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '커피 주문 앱 API 서버',
    version: '1.0.0',
    status: 'running',
    environment: NODE_ENV
  })
})

// 헬스 체크 엔드포인트
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection()
    res.json({
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    })
  }
})

// API 라우트
import menuRoutes from './routes/menuRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

app.use('/api/menus', menuRoutes)
app.use('/api/orders', orderRoutes)

// 404 핸들러 (라우트 등록 후)
app.use(notFoundHandler)

// 에러 핸들링 미들웨어 (마지막에 등록)
app.use(errorHandler)

// 서버 시작
const server = app.listen(PORT, async () => {
  console.log('='.repeat(60))
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`📝 환경: ${NODE_ENV}`)
  console.log('='.repeat(60))
  
  // 환경 변수 정보 출력 (개발 모드)
  printEnvInfo()
  
  // 데이터베이스 연결 및 초기화
  const dbConnected = await testConnection()
  if (dbConnected) {
    // 데이터베이스 스키마 생성 및 초기 데이터 삽입
    await setupDatabase()
  } else {
    logger.warn('데이터베이스가 연결되지 않았습니다. API 기능이 제한될 수 있습니다.')
  }
  
  console.log('='.repeat(60))
  console.log(`✅ API 서버 준비 완료: http://localhost:${PORT}`)
  console.log(`📊 헬스 체크: http://localhost:${PORT}/health`)
  console.log('='.repeat(60))
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM 신호 수신, 서버 종료 중...')
  server.close(() => {
    logger.info('서버가 종료되었습니다.')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT 신호 수신, 서버 종료 중...')
  server.close(() => {
    logger.info('서버가 종료되었습니다.')
    process.exit(0)
  })
})

export default app

