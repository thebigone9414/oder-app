import pg from 'pg'
import dotenv from 'dotenv'
import logger from '../utils/logger.js'

dotenv.config()

const { Pool } = pg

// Render.com에서 제공하는 DATABASE_URL이 있으면 사용, 없으면 개별 환경 변수 사용
let poolConfig

if (process.env.DATABASE_URL) {
  // Render.com의 DATABASE_URL 사용
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
} else {
  // 개별 환경 변수 사용 (로컬 개발)
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'order_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
}

// PostgreSQL 연결 풀 생성
const pool = new Pool(poolConfig)

// 연결 테스트 함수
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()')
    logger.info('데이터베이스에 연결되었습니다.')
    logger.info(`데이터베이스: ${process.env.DB_NAME || 'order_app'}`)
    logger.info(`서버 시간: ${result.rows[0].now}`)
    return true
  } catch (err) {
    logger.error('데이터베이스 연결 실패:', err.message)
    logger.warn('데이터베이스 설정을 확인해주세요.')
    logger.warn('.env 파일의 DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD를 확인하세요.')
    
    // 데이터베이스가 존재하지 않는 경우 안내
    if (err.code === '3D000') {
      logger.warn(`데이터베이스 '${process.env.DB_NAME || 'order_app'}'가 존재하지 않습니다.`)
      logger.warn('다음 명령어로 데이터베이스를 생성하세요:')
      logger.warn(`  CREATE DATABASE ${process.env.DB_NAME || 'order_app'};`)
    }
    
    return false
  }
}

// 연결 이벤트 핸들러
pool.on('connect', () => {
  logger.debug('새로운 데이터베이스 연결 생성')
})

pool.on('error', (err) => {
  logger.error('데이터베이스 연결 풀 오류:', err.message)
})

export default pool

