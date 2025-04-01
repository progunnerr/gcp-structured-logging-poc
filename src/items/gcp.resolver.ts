import { Resolver, Query, Args } from '@nestjs/graphql';
import { LoggingService } from '../logging/logging.service';

@Resolver()
export class GraphqlResolver {
  constructor(private readonly logger: LoggingService) {}

  @Query(() => String)
  hello(): string {
    // Simple string log
    this.logger.log('Hello query executed', 'GraphqlResolver');
    return 'Hello World!';
  }

  @Query(() => String)
  greet(@Args('name', { type: () => String }) name: string): string {
    // Object log - will be properly structured
    this.logger.log({
      message: 'Greet query executed',
      name,
      timestamp: new Date().toISOString()
    }, 'GraphqlResolver');

    // Alternative approach with metadata
    this.logger.log('Greet query with metadata', 'GraphqlResolver', {
      name,
      timestamp: new Date().toISOString()
    });

    return `Hello, ${name}!`;
  }

  @Query(() => String)
  testError(): string {
    try {
      throw new Error('Test GraphQL error for logging');
    } catch (error) {
      this.logger.error(
        'Error occurred in testError query',
        error.stack,
        'GraphqlResolver',
        { additionalData: 'test-error' }
      );
      return 'Error logged (check logs)';
    }
  }
}
