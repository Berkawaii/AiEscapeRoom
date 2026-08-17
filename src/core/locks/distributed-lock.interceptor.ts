import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, throwError } from 'rxjs';
import { mergeMap, catchError, finalize } from 'rxjs/operators';
import { DISTRIBUTED_LOCK_KEY, LockOptions } from './distributed-lock.decorator';
import { RedisLockService } from './redis-lock.service';

@Injectable()
export class DistributedLockInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DistributedLockInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly redisLockService: RedisLockService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const lockOptions = this.reflector.get<LockOptions>(
      DISTRIBUTED_LOCK_KEY,
      context.getHandler(),
    );

    if (!lockOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const paramName = lockOptions.keyParam || 'id';
    const resourceId = request.params[paramName] || request.body[paramName] || 'global';
    const lockKey = `lock:room:${resourceId}`;
    const ttl = lockOptions.ttlMs || 8000;

    return from(this.redisLockService.acquireLock(lockKey, ttl)).pipe(
      mergeMap((lockToken) => {
        if (!lockToken) {
          this.logger.warn(`Race condition blocked! Lock key '${lockKey}' is currently held by an ongoing action.`);
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.TOO_MANY_REQUESTS,
                  error: 'Too Many Requests (Lock Held)',
                  message: 'Aksiyonunuz işleniyor! Bu odaya ait önceki hamle henüz tamamlanmadı. Lütfen birkaç saniye bekleyin.',
                  retryAfterMs: 3000,
                  roomId: resourceId,
                },
                HttpStatus.TOO_MANY_REQUESTS,
              ),
          );
        }

        this.logger.debug(`Atomic lock acquired: ${lockKey} [Token: ${lockToken}]`);

        // Execute controller action and guarantee lock release via Lua script in finalize
        return next.handle().pipe(
          finalize(async () => {
            const released = await this.redisLockService.releaseLock(lockKey, lockToken);
            if (released) {
              this.logger.debug(`Atomic lock safely released: ${lockKey}`);
            } else {
              this.logger.warn(`Lock release skipped or already expired: ${lockKey}`);
            }
          }),
        );
      }),
    );
  }
}
