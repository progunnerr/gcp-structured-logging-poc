import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { LoggingService } from './logging.service';
import { Injectable } from '@nestjs/common';

@Injectable()
@Plugin()
export class GraphQLLoggingPlugin implements ApolloServerPlugin {
  constructor(private readonly loggingService: LoggingService) {}

  async requestDidStart({ request, context }): Promise<GraphQLRequestListener> {
    // Skip if no request or introspection queries
    if (!request || 
        request.operationName === 'IntrospectionQuery' || 
        (request.query && request.query.includes('__schema'))) {
      return {};
    }

    // Get correlation ID from context if available
    const correlationId = context?.correlationId || context?.req?.correlationId;
    console.log('GraphQL plugin correlationId:', correlationId); // Debug log
    
    const logger = new LoggingService();
    
    if (correlationId) {
      logger.setCorrelationId(correlationId);
      logger.debug(`Using correlation ID in GraphQL plugin: ${correlationId}`, 'GraphQLPlugin');
    } else {
      logger.warn('No correlation ID found in GraphQL context', 'GraphQLPlugin');
      
      // Fallback: try to get it from the request headers directly
      const reqHeaders = context?.req?.headers;
      if (reqHeaders) {
        const fallbackId = 
          reqHeaders['x-correlation-id'] || 
          reqHeaders['x-request-id'] || 
          `fallback-${Date.now()}`;
        
        logger.setCorrelationId(fallbackId);
        logger.debug(`Using fallback correlation ID: ${fallbackId}`, 'GraphQLPlugin');
      }
    }
    
    const operationName = request.operationName || 'anonymous';
    const startTime = Date.now();
    
    logger.log(`GraphQL operation started: ${operationName}`, 'GraphQL');
    
    return {
      async didEncounterErrors({ errors }) {
        logger.error(
          `GraphQL operation failed: ${operationName}`,
          '',
          'GraphQL',
          { errors: errors.map(e => e.message).join(', ') }
        );
      },
      async willSendResponse() {
        const duration = Date.now() - startTime;
        logger.log(
          `GraphQL operation completed: ${operationName} (${duration}ms)`,
          'GraphQL'
        );
      }
    };
  }
}
