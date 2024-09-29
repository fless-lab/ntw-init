import { createLogger, format, transports, Logger } from 'winston';
import { Format } from 'logform';
import path from 'path';
import fs from 'fs';

export class LoggerService {
  private static instance: LoggerService;
  private logger: Logger;

  private constructor() {
    const logFormat: Format = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
      format.printf((info) => {
        const { timestamp, level, message, ...rest } = info;
        return `[${timestamp}] (${level}): ${message} ${Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''}`;
      }),
    );

    this.logger = createLogger({
      level: 'info',
      format: logFormat,
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), logFormat),
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
      ],
      exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' }),
      ],
    });
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  log(level: string, message: string, metadata?: Record<string, any>): void {
    this.logger.log({ level, message, ...metadata });
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.logger.info(message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.logger.warn(message, metadata);
  }

  error(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      this.logger.error(`${message} ${error.message}`, {
        stack: error.stack,
        ...error,
      });
    } else if (error !== undefined) {
      this.logger.error(`${message} ${JSON.stringify(error)}`);
    } else {
      this.logger.error(message);
    }
  }

  file(filename: string, content: string): void {
    const logsDir = path.resolve('logs', 'browser');
    const filePath = path.join(logsDir, filename);

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    fs.appendFileSync(
      filePath,
      `${new Date().toISOString()} - ${content}\n`,
      'utf8',
    );
  }
}
