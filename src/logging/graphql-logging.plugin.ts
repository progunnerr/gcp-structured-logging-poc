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

    // Extract correlation ID from request headers
    let correlationId: string;
    
    if (request?.http?.headers) {
      correlationId = 
        (request.http.headers.get('x-correlation-id') as string) ||
        (request.http.headers.get('x-request-id') as string) ||
        uuidv4();
    } else {
      correlationId = uuidv4();
      this.loggingService.warn('No request headers available for correlation ID', 'GraphQLPlugin');
    }

    // Set the correlation ID on the context if available
    if (context) {
      if (!context.correlationId) {
        context.correlationId = correlationId;
      }
      
      // Also set on req object if it exists
      if (context.req) {
        context.req.correlationId = correlationId;
      }
    } else {
      this.loggingService.warn('GraphQL context is undefined', 'GraphQLPlugin');
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
