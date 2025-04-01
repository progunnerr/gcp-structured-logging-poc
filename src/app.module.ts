import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { LoggingModule } from './logging/logging.module';
import { LoggingService } from './logging/logging.service';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // Add these configurations to fix the CSRF issue
      playground: {
        settings: {
          'request.credentials': 'same-origin',
        },
      },
      // Disable CSRF protection for the GraphQL endpoint
      csrfPrevention: false,
      // Add this plugin to log all GraphQL operations
      plugins: [
        {
          async requestDidStart(requestContext) {
            const logger = new LoggingService();
            const { request, context } = requestContext;
            
            // Skip introspection queries completely
            if (request.operationName === 'IntrospectionQuery' || 
                (request.query && request.query.includes('__schema'))) {
              return {
                didEncounterErrors() {},
                willSendResponse() {}
              };
            }
            
            // Get request ID from header or generate a new UUID
            const requestId = 
              (context?.req?.headers['x-request-id'] as string) || 
              uuidv4();
            
            const startTime = Date.now();
            const operationName = request.operationName || 'anonymous';
            
            // Log operation start with request ID
            logger.log(
              `GraphQL operation started: ${operationName}`,
              `GraphQL [${requestId}]`
            );
            
            return {
              // Log any errors with request ID
              async didEncounterErrors(ctx) {
                const errorCount = ctx.errors?.length || 0;
                logger.error(
                  `GraphQL operation failed: ${operationName} (${errorCount} errors)`,
                  '', 
                  `GraphQL [${requestId}]`
                );
                
                // Log detailed errors at debug level
                if (ctx.errors && ctx.errors.length > 0) {
                  ctx.errors.forEach((err, index) => {
                    logger.debug(
                      `Error ${index + 1}: ${err.message}`,
                      `GraphQL [${requestId}]`
                    );
                  });
                }
              },
              // Log operation completion with request ID
              async willSendResponse() {
                const duration = Date.now() - startTime;
                logger.log(
                  `GraphQL operation completed: ${operationName} (${duration}ms)`,
                  `GraphQL [${requestId}]`
                );
              },
            };
          },
        },
      ],
    }),
    ItemsModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
