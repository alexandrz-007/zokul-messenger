import Redis from 'ioredis';
import { config } from './app';
import { logger } from '../utils/logger';

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logger('Redis connection failed after 3 retries', 'error');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });
    client.on('error', (err) => {
      logger(`Redis error: ${err.message}`, 'error');
    });
  }
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
