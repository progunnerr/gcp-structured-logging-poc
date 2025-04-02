import { Injectable, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable({ scope: Scope.DEFAULT })
export class CorrelationIdService {
  private readonly storage = new AsyncLocalStorage<Map<string, string>>();

  /**
   * Get the current correlation ID from the async local storage
   */
  getCurrentCorrelationId(): string | undefined {
    const store = this.storage.getStore();
    return store?.get('correlationId');
  }

  /**
   * Set the correlation ID in the async local storage
   */
  setCorrelationId(correlationId: string): void {
    const store = this.storage.getStore() || new Map<string, string>();
    store.set('correlationId', correlationId);
    
    // If there's no store yet, create one
    if (!this.storage.getStore()) {
      this.storage.enterWith(store);
    }
  }

  /**
   * Run a function with the given correlation ID in context
   */
  runWithCorrelationId<T>(correlationId: string, fn: () => T): T {
    const store = new Map<string, string>();
    store.set('correlationId', correlationId);
    return this.storage.run(store, fn);
  }
}
