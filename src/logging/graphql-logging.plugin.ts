import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { LoggingService } from './logging.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

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

    // Extract correlation ID from various possible sources
    const correlationId =
      (request.http?.headers.get('x-correlation-id') as string) ||
      (request.http?.headers.get('x-request-id') as string) ||
      (context?.req?.headers?.['x-correlation-id']) ||
      (context?.req?.headers?.['x-request-id']) ||
      uuidv4();

    // Set the correlation ID on the request object for other middleware/handlers
    if (context?.req) {
      context.req.correlationId = correlationId;
    }
    
    // Use the injected logging service instead of creating a new one
    this.loggingService.setCorrelationId(correlationId);
    this.loggingService.debug(`GraphQL operation with correlation ID: ${correlationId}`, 'GraphQLPlugin');
    
    const operationName = request.operationName || 'anonymous';
    const startTime = Date.now();
    
    this.loggingService.log(`GraphQL operation started: ${operationName}`, 'GraphQL');
    
    return {
      async didEncounterErrors({ errors }) {
        this.loggingService.error(
          `GraphQL operation failed: ${operationName}`,
          '',
          'GraphQL',
          { errors: errors.map(e => e.message).join(', ') }
        );
      },
      async willSendResponse() {
        const duration = Date.now() - startTime;
        this.loggingService.log(
          `GraphQL operation completed: ${operationName} (${duration}ms)`,
          'GraphQL'
        );
      }
    };
  }
}
