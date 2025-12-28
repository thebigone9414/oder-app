import logger from '../utils/logger.js'

/**
 * 요청 로깅 미들웨어 (개발 모드)
 */
export const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const start = Date.now()
    
    res.on('finish', () => {
      const duration = Date.now() - start
      const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢'
      
      logger.info(
        `${statusColor} ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`
      )
    })
  }
  
  next()
}

