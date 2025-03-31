import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { LoggingModule } from './logging/logging.module';
import { LoggingService } from './logging/logging.service';

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
            const { request } = requestContext;
            
            // Log the operation when it starts
            logger.log(
              `GraphQL ${request.operationName || 'anonymous'} operation started: ${
                request.query?.substring(0, 200)
              }${request.query?.length > 200 ? '...' : ''}`,
              'GraphQL'
            );
            
            if (request.variables && Object.keys(request.variables).length > 0) {
              logger.debug(
                `Variables: ${JSON.stringify(request.variables)}`,
                'GraphQL'
              );
            }
            
            return {
              // Log any errors
              async didEncounterErrors(ctx) {
                logger.error(
                  `GraphQL errors in ${request.operationName || 'anonymous'}: ${
                    JSON.stringify(ctx.errors)
                  }`,
                  null,
                  'GraphQL'
                );
              },
              // Log when the operation completes
              async willSendResponse(ctx) {
                const duration = Date.now() - requestContext.context.startTime;
                logger.log(
                  `GraphQL ${request.operationName || 'anonymous'} completed in ${duration}ms`,
                  'GraphQL'
                );
              },
            };
          },
        },
      ],
      context: () => ({
        startTime: Date.now(), // Track when the request started
      }),
    }),
    ItemsModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
