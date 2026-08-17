import Redis from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL!;
console.log('Testing Redis Cloud Connection...');
console.log('URL:', redisUrl);

const redis = new Redis(redisUrl);

redis.on('connect', async () => {
  console.log('🚀 SUCCESS: Redis Cloud Connected Successfully!');
  await redis.set('test:key', 'AI Escape Room Engine Connected', 'EX', 10);
  const val = await redis.get('test:key');
  console.log('Key Read Test:', val);
  redis.disconnect();
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
  redis.disconnect();
});
