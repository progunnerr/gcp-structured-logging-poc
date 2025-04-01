import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

@Injectable()
export class LoggingService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Create a Winston-GCP transport
    const loggingWinston = new LoggingWinston({
      // When running in GCP, credentials are automatically detected
    });

    const logLevel = process.env.LOG_LEVEL || 'info';

    // Create a Winston logger that streams to Stackdriver Logging
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'gcp-structured-logging-poc' },
      transports: [
        // Console transport for local viewing
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        // Add the GCP logging transport
        loggingWinston,
      ],
    });

    // Log the current logging level on startup
    this.logger.info(`Logging initialized at level: ${logLevel}`);
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
  
  // Helper method to generate a request ID
  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
}
