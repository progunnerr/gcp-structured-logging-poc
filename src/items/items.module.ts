import { Module } from '@nestjs/common';
import { ItemsResolver } from './items.resolver';
import { ItemsService } from './items.service';
import { LoggingModule } from '../logging/logging.module';
import { GraphqlResolver } from './gcp.resolver';

@Module({
  imports: [LoggingModule],
  providers: [ItemsResolver, ItemsService, GraphqlResolver],
})
export class ItemsModule {}
