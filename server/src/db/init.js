import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from './connection.js'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 데이터베이스 초기화 함수
 */
export const initDatabase = async () => {
  try {
    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    
    // 스키마 실행
    logger.info('데이터베이스 스키마 생성 중...')
    await pool.query(schemaSQL)
    logger.info('✅ 데이터베이스 스키마 생성 완료')
    
    // 초기 데이터 삽입
    const seedPath = path.join(__dirname, 'seed.sql')
    if (fs.existsSync(seedPath)) {
      const seedSQL = fs.readFileSync(seedPath, 'utf8')
      logger.info('초기 데이터 삽입 중...')
      await pool.query(seedSQL)
      logger.info('✅ 초기 데이터 삽입 완료')
    }
    
    return true
  } catch (error) {
    logger.error('데이터베이스 초기화 실패:', error.message)
    throw error
  }
}

/**
 * 데이터베이스 연결 테스트 및 초기화
 */
export const setupDatabase = async () => {
  try {
    // 연결 테스트
    await pool.query('SELECT NOW()')
    logger.info('✅ 데이터베이스 연결 확인')
    
    // 데이터베이스 초기화
    await initDatabase()
    
    return true
  } catch (error) {
    logger.error('데이터베이스 설정 실패:', error.message)
    return false
  }
}

