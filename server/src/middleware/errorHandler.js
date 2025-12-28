import logger from '../utils/logger.js'

/**
 * 에러 핸들링 미들웨어
 */
export const errorHandler = (err, req, res, next) => {
  // 에러 로깅
  logger.error('에러 발생:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    method: req.method,
    url: req.url,
    body: req.body
  })

  // 응답
  const statusCode = err.statusCode || 500
  const message = err.message || '서버 오류가 발생했습니다.'

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      details: err.stack,
      path: req.path,
      method: req.method
    })
  })
}

/**
 * 404 핸들러
 */
export const notFoundHandler = (req, res) => {
  logger.warn(`404 - 경로를 찾을 수 없음: ${req.method} ${req.url}`)
  res.status(404).json({
    error: '요청한 리소스를 찾을 수 없습니다.',
    path: req.path,
    method: req.method
  })
}

