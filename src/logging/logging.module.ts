import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { GraphQLLoggingPlugin } from './graphql-logging.plugin';
import { CorrelationIdService } from './correlation-id.service';

@Global()
@Module({
  providers: [LoggingService, GraphQLLoggingPlugin, CorrelationIdService],
  exports: [LoggingService, GraphQLLoggingPlugin, CorrelationIdService],
})
export class LoggingModule {}
