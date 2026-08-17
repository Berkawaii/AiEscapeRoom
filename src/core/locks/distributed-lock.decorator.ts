import { SetMetadata } from '@nestjs/common';

export const DISTRIBUTED_LOCK_KEY = 'DISTRIBUTED_LOCK_KEY';

export interface LockOptions {
  keyParam?: string; // e.g. 'id' or 'roomId' from req.params
  ttlMs?: number;    // default 5000ms
}

/**
 * Decorator to enforce Atomic Distributed Locking on NestJS Controller routes.
 */
export const DistributedLock = (options?: LockOptions) =>
  SetMetadata(DISTRIBUTED_LOCK_KEY, options || {});
