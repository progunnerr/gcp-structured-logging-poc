import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { GraphQLLoggingPlugin } from './graphql-logging.plugin';

@Global()
@Module({
  providers: [LoggingService, GraphQLLoggingPlugin],
  exports: [LoggingService, GraphQLLoggingPlugin],
})
export class LoggingModule {}
