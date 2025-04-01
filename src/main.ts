import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './logging/logging.service';

async function bootstrap() {
  const logger = new LoggingService();
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  
  // Add a middleware to extract correlation ID from HTTP requests
  app.use((req, res, next) => {
    if (req['correlationId']) {
      logger.setCorrelationId(req['correlationId']);
      logger.debug('Request correlation ID set', 'Bootstrap');
    }
    next();
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
