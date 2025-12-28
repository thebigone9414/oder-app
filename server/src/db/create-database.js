import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

async function createDatabase() {
  // postgres 데이터베이스에 연결 (기본 데이터베이스)
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'postgres', // 기본 데이터베이스
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  })

  try {
    await adminClient.connect()
    console.log('PostgreSQL에 연결되었습니다.')

    // 데이터베이스 존재 여부 확인
    const checkQuery = "SELECT 1 FROM pg_database WHERE datname = $1"
    const checkResult = await adminClient.query(checkQuery, [process.env.DB_NAME || 'order_app'])

    if (checkResult.rows.length === 0) {
      // 데이터베이스 생성
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME || 'order_app'}`)
      console.log(`✅ 데이터베이스 '${process.env.DB_NAME || 'order_app'}' 생성 완료`)
    } else {
      console.log(`✅ 데이터베이스 '${process.env.DB_NAME || 'order_app'}' 이미 존재합니다.`)
    }

    await adminClient.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ 데이터베이스 생성 실패:', error.message)
    await adminClient.end()
    process.exit(1)
  }
}

createDatabase()

