import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { LoggingModule } from './logging/logging.module';

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
      context: ({ req }) => {
        // Just pass the request object
        // The GraphQLLoggingPlugin will handle setting the correlationId
        return { req };
      },
    }),
    ItemsModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
