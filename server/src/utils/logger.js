/**
 * 간단한 로거 유틸리티
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  info: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args)
    }
  },
  
  error: (message, ...args) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args)
  },
  
  warn: (message, ...args) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args)
  },
  
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args)
    }
  }
}

export default logger

