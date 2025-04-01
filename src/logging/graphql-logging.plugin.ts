import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { LoggingService } from './logging.service';
import { Injectable } from '@nestjs/common';

@Injectable()
@Plugin()
export class GraphQLLoggingPlugin implements ApolloServerPlugin {
  constructor(private readonly loggingService: LoggingService) {}

  async requestDidStart({ request, context }): Promise<GraphQLRequestListener> {
    // Skip introspection queries
    if (request.operationName === 'IntrospectionQuery' || 
        (request.query && request.query.includes('__schema'))) {
      return {};
    }

    // Get correlation ID from context
    const correlationId = context.correlationId;
    const logger = new LoggingService();
    
    if (correlationId) {
      logger.setCorrelationId(correlationId);
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
