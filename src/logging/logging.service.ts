import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

@Injectable()
export class LoggingService implements LoggerService {
  private logger: winston.Logger;

  constructor() {

    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format.printf(
            ({ timestamp, level, message, context, ...rest }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${
                typeof message === 'object'
                  ? JSON.stringify(message)
                  : message
              } ${Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''}`;
            }
          )
        )
      })
    ];

    // Create a Winston-GCP transport
    const gcpTransport = new LoggingWinston({
      // When running in GCP, credentials are automatically detected
      // tell GCP to use the message field properly
      useMessageField: true
    });

    // Only add GCP transport if explicitly enabled
    if (process.env.ENABLE_GCP_LOGGING === 'true') {
      try {
        transports.push(gcpTransport);
        console.log('✅ GCP Logging transport enabled');
      } catch (error) {
        console.warn('⚠️ GCP Logging transport not enabled:', error.message);
      }
    } else {
      console.log('ℹ️ GCP Logging disabled. Using console logging only.');
    }

    const logLevel = process.env.LOG_LEVEL || 'info';

    // Create a Winston logger that streams to Stackdriver Logging
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(
          ({ timestamp, level, message, context, ...rest }) => {
            return `${timestamp} [${context || 'Application'}] ${level}: ${
              typeof message === 'object'
                ? JSON.stringify(message)
                : message
            } ${Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''}`;
          }
        )
      ),
      defaultMeta: { service: 'gcp-structured-logging-poc' },
      transports
    });

    // Log the current logging level on startup
    this.logger.info(`Logging initialized at level: ${logLevel}`);
  }

// Fix logging methods to properly handle objects

  log(message: any, context?: string, meta: Record<string, any> = {}) {
    if (typeof message === 'object') {
      // For objects, spread the object into metadata
      this.logger.info({ context, ...message, ...meta });
    } else {
      // For strings, use as message
      this.logger.info(message, { context, ...meta });
    }
  }

  error(message: any, trace?: string, context?: string, meta: Record<string, any> = {}) {
    const errorMeta = { context, ...(trace ? { stack: trace } : {}), ...meta };

    if (typeof message === 'object') {
      this.logger.error({ ...message, ...errorMeta });
    } else {
      this.logger.error(message, errorMeta);
    }
  }

  warn(message: any, context?: string, meta: Record<string, any> = {}) {
    if (typeof message === 'object') {
      this.logger.warn({ context, ...message, ...meta });
    } else {
      this.logger.warn(message, { context, ...meta });
    }
  }

  debug(message: any, context?: string, meta: Record<string, any> = {}) {
    if (typeof message === 'object') {
      this.logger.debug({ context, ...message, ...meta });
    } else {
      this.logger.debug(message, { context, ...meta });
    }
  }

  verbose(message: any, context?: string, meta: Record<string, any> = {}) {
    if (typeof message === 'object') {
      this.logger.verbose({ context, ...message, ...meta });
    } else {
      this.logger.verbose(message, { context, ...meta });
    }
  }
}
