import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// File logs need a writable `logs/` dir. Production on Railway etc.: console only unless ENABLE_FILE_LOGS=true
const wantFileLogs =
  process.env.ENABLE_FILE_LOGS === 'true' ||
  (process.env.NODE_ENV !== 'production' && process.env.ENABLE_FILE_LOGS !== 'false');

function createConsoleTransport() {
  return new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
  });
}

const transports = [createConsoleTransport()];

if (wantFileLogs) {
  transports.unshift(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat,
  ),
  transports,
  exceptionHandlers: wantFileLogs
    ? [new winston.transports.File({ filename: 'logs/exceptions.log' })]
    : [createConsoleTransport()],
  rejectionHandlers: wantFileLogs
    ? [new winston.transports.File({ filename: 'logs/rejections.log' })]
    : [createConsoleTransport()],
});

export default logger;
