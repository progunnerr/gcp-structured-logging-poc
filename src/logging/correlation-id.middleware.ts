import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Use existing correlation ID from headers or generate a new one
    const correlationId = 
      req.headers['x-correlation-id'] as string || 
      req.headers['x-request-id'] as string || 
      uuidv4();
    
    // Add to request object for use in application code
    req['correlationId'] = correlationId;
    
    // Add to response headers
    res.setHeader('x-correlation-id', correlationId);
    
    next();
  }
}
