import dotenv from 'dotenv'

dotenv.config()

/**
 * 필수 환경 변수 검증
 */
export const validateEnv = () => {
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER']
  const missing = []

  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    console.warn('⚠️  다음 환경 변수가 설정되지 않았습니다:', missing.join(', '))
    console.warn('   기본값이 사용됩니다.')
  }

  return missing.length === 0
}

/**
 * 환경 변수 정보 출력 (개발 모드에서만)
 */
export const printEnvInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📋 환경 변수 설정:')
    console.log(`   PORT: ${process.env.PORT || 3000}`)
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`)
    console.log(`   DB_PORT: ${process.env.DB_PORT || 5432}`)
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'order_app'}`)
    console.log(`   DB_USER: ${process.env.DB_USER || 'postgres'}`)
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
    console.log('')
  }
}

