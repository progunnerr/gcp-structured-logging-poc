import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

@Injectable()
export class LoggingService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const loggingWinston = new LoggingWinston({
      projectId: process.env.GCP_PROJECT_ID,
      // When running in GCP, credentials are automatically detected
      // For local development, set GOOGLE_APPLICATION_CREDENTIALS env var
    });

    const isProduction = process.env.NODE_ENV === 'production';
    
    // Create a Winston logger that streams to Stackdriver Logging in production
    // or to the console for local development
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'gcp-structured-logging-poc' },
      transports: [
        // Console transport for local development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        // Only add GCP logging in production
        ...(isProduction ? [loggingWinston] : []),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
