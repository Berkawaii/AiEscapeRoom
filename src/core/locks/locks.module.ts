import { Module, Global } from '@nestjs/common';
import { RedisLockService } from './redis-lock.service';
import { DistributedLockInterceptor } from './distributed-lock.interceptor';

@Global()
@Module({
  providers: [RedisLockService, DistributedLockInterceptor],
  exports: [RedisLockService, DistributedLockInterceptor],
})
export class LocksModule {}
