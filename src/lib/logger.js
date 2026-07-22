/**
 * 2026-07-22 1:1 迁移自 V1.1 lib/logger.ts
 * 应用日志工具
 */

/**
 * 格式化日志输出
 */
function formatLog(level, message, data) {
  const timestamp = new Date().toISOString()
  const dataStr = data ? ` | ${JSON.stringify(data)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`
}

/**
 * 日志记录器
 * 生产环境可扩展为发送到日志服务
 */
export const logger = {
  info: (message, data) => {
    if (import.meta.env.DEV) {
      console.info(formatLog('info', message, data))
    }
  },
  warn: (message, data) => {
    if (import.meta.env.DEV || import.meta.env.PROD) {
      console.warn(formatLog('warn', message, data))
    }
  },
  error: (message, data) => {
    if (import.meta.env.DEV || import.meta.env.PROD) {
      console.error(formatLog('error', message, data))
    }
  },
  debug: (message, data) => {
    if (import.meta.env.DEV) {
      console.debug(formatLog('debug', message, data))
    }
  }
}

export default logger
