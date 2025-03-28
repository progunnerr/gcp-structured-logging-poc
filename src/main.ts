import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './logging/logging.service';

async function bootstrap() {
  // Create a new instance of our custom logger
  const logger = new LoggingService();
  
  // Pass the logger to the NestJS application
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  
  // Use the logger as a global logger
  app.useLogger(logger);
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`GraphQL Playground is available at: http://localhost:${port}/graphql`, 'Bootstrap');
}
bootstrap();
