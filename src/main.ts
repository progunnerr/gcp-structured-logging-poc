import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './logging/logging.service';

async function bootstrap() {
  const logger = new LoggingService();
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`GraphQL Playground is available at: http://localhost:${port}/graphql`, 'Bootstrap');
}
bootstrap();
