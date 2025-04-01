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
    this.logger.info(this.formatMessage(message), { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(this.formatMessage(message), { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(this.formatMessage(message), { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(this.formatMessage(message), { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(this.formatMessage(message), { context });
  }

  private formatMessage(message: any): any {
    if (typeof message === 'object') {
      return message;
    }
    return { message };
  }
}
