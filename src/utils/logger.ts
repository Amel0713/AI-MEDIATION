/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  error(message: string, data?: any) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}

// Create logger instance with level based on environment
const logLevel: LogLevel = import.meta.env.MODE === 'development' ? 'debug' : 'warn';
export const logger = new Logger(logLevel);