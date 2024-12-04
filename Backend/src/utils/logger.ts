import { createLogger, transports, format } from 'winston';
const date = new Date().toISOString().split('T')[0];
let filename = 'applogs';
filename = filename.concat(date, '.log');

export const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
    )
  ),
  transports: [
    new transports.File({
      filename: `./logs/${filename}`,
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new transports.Console(),
  ],
});
