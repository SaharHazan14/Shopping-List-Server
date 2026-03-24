/*import { createLogger, format, transports } from 'winston';

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

export default logger;*/

import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

const customFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length
    ? " | " + Object.entries(meta).map(([key, value]) => `${key}=${value}`).join(" ")
    : "";

  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
});

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",

  format: winston.format.combine(
    winston.format.timestamp(),
    isProduction
      ? winston.format.json()
      : customFormat
  ),

  transports: [
    new winston.transports.Console()
  ],
});

export default logger;