import pg from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 데이터베이스 연결 설정
let poolConfig

if (process.env.DATABASE_URL) {
  // Render.com의 DATABASE_URL 사용
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
} else {
  // 개별 환경 변수 사용
  poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false } // Render.com은 SSL 필요
  }
}

const pool = new Pool(poolConfig)

async function setupDatabase() {
  try {
    console.log('='.repeat(60))
    console.log('Render.com 데이터베이스 스키마 생성 시작')
    console.log('='.repeat(60))
    
    // 연결 테스트
    console.log('데이터베이스 연결 테스트 중...')
    const testResult = await pool.query('SELECT NOW()')
    console.log(`✅ 데이터베이스 연결 성공: ${testResult.rows[0].now}`)
    console.log(`데이터베이스: ${process.env.DB_NAME || 'order_app'}`)
    
    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    
    // 스키마 실행
    console.log('\n데이터베이스 스키마 생성 중...')
    await pool.query(schemaSQL)
    console.log('✅ 데이터베이스 스키마 생성 완료')
    
    // 초기 데이터 삽입
    const seedPath = path.join(__dirname, 'seed.sql')
    if (fs.existsSync(seedPath)) {
      const seedSQL = fs.readFileSync(seedPath, 'utf8')
      console.log('\n초기 데이터 삽입 중...')
      await pool.query(seedSQL)
      console.log('✅ 초기 데이터 삽입 완료')
    }
    
    // 생성된 테이블 확인
    console.log('\n생성된 테이블 확인 중...')
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    console.log('생성된 테이블:')
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })
    
    // 메뉴 데이터 확인
    const menusResult = await pool.query('SELECT COUNT(*) as count FROM menus')
    console.log(`\n메뉴 개수: ${menusResult.rows[0].count}개`)
    
    // 옵션 데이터 확인
    const optionsResult = await pool.query('SELECT COUNT(*) as count FROM options')
    console.log(`옵션 개수: ${optionsResult.rows[0].count}개`)
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ 데이터베이스 스키마 생성 완료!')
    console.log('='.repeat(60))
    
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    console.error('상세 정보:', error)
    await pool.end()
    process.exit(1)
  }
}

setupDatabase()

