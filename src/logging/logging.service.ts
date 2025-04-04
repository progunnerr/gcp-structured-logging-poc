import { Injectable, LoggerService, Scope, Inject, Optional } from '@nestjs/common';
import * as winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import { CorrelationIdService } from './correlation-id.service';

@Injectable({ scope: Scope.DEFAULT })
export class LoggingService implements LoggerService {
  private logger: winston.Logger;

  constructor(@Optional() private readonly correlationIdService?: CorrelationIdService) {

    const transports: winston.transport[] = [];
    
    // In production with GCP logging enabled, only use GCP transport
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_GCP_LOGGING === 'true') {
      try {
        // Create a Winston-GCP transport
        const gcpTransport = new LoggingWinston({
          // When running in GCP, credentials are automatically detected
          useMessageField: true
        });
        
        transports.push(gcpTransport);
        console.log('✅ GCP Logging transport enabled');
      } catch (error) {
        console.warn('⚠️ GCP Logging transport not enabled:', error.message);
        // Fallback to console if GCP transport fails
        transports.push(new winston.transports.Console({
          format: winston.format.simple()
        }));
      }
    } else {
      // For development or when GCP logging is disabled, use console transport
      transports.push(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, context, ...rest }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${
                typeof message === 'object'
                  ? JSON.stringify(message)
                  : message
              } ${Object.keys(rest).length ? JSON.stringify(rest, null, 0) : ''}`;
            }
          )
        )
      }));
      console.log('ℹ️ Using console logging only.');
    }

    const logLevel = process.env.LOG_LEVEL || 'info';

    // Create a Winston logger
    this.logger = winston.createLogger({
      level: logLevel,
      // For GCP, use a simpler format that won't get split into multiple log entries
      format: process.env.ENABLE_GCP_LOGGING === 'true' && process.env.NODE_ENV === 'production'
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
      defaultMeta: { service: 'gcp-structured-logging-poc' },
      transports
    });

    // Log the current logging level on startup
    this.logger.info(`Logging initialized at level: ${logLevel}`);
  }

// Fix logging methods to properly handle objects

  // Set correlation ID for this logger instance
  setCorrelationId(correlationId: string): this {
    if (correlationId && this.correlationIdService) {
      this.correlationIdService.setCorrelationId(correlationId);
      console.log(`[LoggingService] Set correlationId: ${correlationId}`);
    }
    return this;
  }

  log(message: any, context?: string, meta: Record<string, any> = {}) {
    // Get correlation ID from service if available, fallback to instance property
    const correlationId = this.correlationIdService?.getCurrentCorrelationId();
    
    if (typeof message === 'object') {
      // For objects, use a single structured log entry
      this.logger.info({ context, data: message, correlationId, ...meta });
    } else {
      // For strings, use as message with metadata
      this.logger.info({ message, context, correlationId, ...meta });
    }
  }

  error(message: any, trace?: string, context?: string, meta: Record<string, any> = {}) {
    // Get correlation ID from service if available, fallback to instance property
    const correlationId = this.correlationIdService?.getCurrentCorrelationId();
    
    const errorMeta = { 
      context, 
      correlationId,
      ...(trace ? { stack: trace } : {}), 
      ...meta 
    };

    if (typeof message === 'object') {
      this.logger.error({ data: message, ...errorMeta });
    } else {
      this.logger.error({ message, ...errorMeta });
    }
  }

  warn(message: any, context?: string, meta: Record<string, any> = {}) {
    // Get correlation ID from service if available, fallback to instance property
    const correlationId = this.correlationIdService?.getCurrentCorrelationId();
    
    if (typeof message === 'object') {
      this.logger.warn({ context, data: message, correlationId, ...meta });
    } else {
      this.logger.warn({ message, context, correlationId, ...meta });
    }
  }

  debug(message: any, context?: string, meta: Record<string, any> = {}) {
    // Get correlation ID from service if available, fallback to instance property
    const correlationId = this.correlationIdService?.getCurrentCorrelationId();
    
    if (typeof message === 'object') {
      this.logger.debug({ context, data: message, correlationId, ...meta });
    } else {
      this.logger.debug({ message, context, correlationId, ...meta });
    }
  }

  verbose(message: any, context?: string, meta: Record<string, any> = {}) {
    // Get correlation ID from service if available, fallback to instance property
    const correlationId = this.correlationIdService?.getCurrentCorrelationId();
    
    if (typeof message === 'object') {
      this.logger.verbose({ context, data: message, correlationId, ...meta });
    } else {
      this.logger.verbose({ message, context, correlationId, ...meta });
    }
  }
}
