import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = format;

const plainFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const isProd = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  format: combine(errors({ stack: true }), timestamp()),
  transports: [
    new transports.Console({
      format: isProd ? json() : combine(colorize(), plainFormat),
    }),
  ],
  exitOnError: false,
});

export default logger;
