import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { LoggingService } from './logging.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CorrelationIdService } from './correlation-id.service';

@Injectable()
@Plugin()
export class GraphQLLoggingPlugin implements ApolloServerPlugin {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly correlationIdService: CorrelationIdService
  ) {}

  async requestDidStart({ request, context }): Promise<GraphQLRequestListener> {
    // Store a reference to this for use in callbacks
    const self = this;

    // Skip if no request or introspection queries
    if (!request ||
        request.operationName === 'IntrospectionQuery' || 
        (request.query && request.query.includes('__schema'))) {
      return {};
    }

    // Generate a correlation ID if not already present
    const correlationId = 
      (request?.http?.headers?.get('x-correlation-id') as string) ||
      (request?.http?.headers?.get('x-request-id') as string) ||
      uuidv4();

    // Set correlation ID in both services
    this.correlationIdService.setCorrelationId(correlationId);
    
    // Set the correlation ID on the context if available
    if (context) {
      context.correlationId = correlationId;
      
      // Also set on req object if it exists
      if (context.req) {
        context.req.correlationId = correlationId;
      }
    }
    
    this.loggingService.debug(`GraphQL operation with correlation ID: ${correlationId}`, 'GraphQLPlugin');
    
    const operationName = request.operationName || 'anonymous';
    const startTime = Date.now();
    
    // Check if logging service is available before using it
    if (this.loggingService) {
      this.loggingService.log(`GraphQL operation started: ${operationName}`, 'GraphQL');
    } else {
      console.log(`GraphQL operation started: ${operationName}`);
    }
    
    return {
      async didEncounterErrors({ errors }) {
        if (self.loggingService) {
          self.loggingService.error(
            `GraphQL operation failed: ${operationName}`,
            '',
            'GraphQL',
            { errors: errors.map(e => e.message).join(', ') }
          );
        } else {
          console.error(`GraphQL operation failed: ${operationName}`, errors.map(e => e.message).join(', '));
        }
      },
      async willSendResponse() {
        const duration = Date.now() - startTime;
        if (self.loggingService) {
          self.loggingService.log(
            `GraphQL operation completed: ${operationName} (${duration}ms)`,
            'GraphQL'
          );
        } else {
          console.log(`GraphQL operation completed: ${operationName} (${duration}ms)`);
        }
      }
    };
  }
}
