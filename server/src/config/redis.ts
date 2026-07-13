import Redis from 'ioredis';
import { config } from './app';
import { logger } from '../utils/logger';

let client: Redis | null = null;
let pubClient: Redis | null = null;
let subClient: Redis | null = null;

function createClient(name: string): Redis {
  const c = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(Math.exp(times) * 100, 30000);
      logger(`Redis ${name} reconnecting (attempt ${times}, delay ${Math.round(delay)}ms)`, 'warn');
      return delay;
    },
  });
  c.on('error', (err) => {
    logger(`Redis ${name} error: ${err.message}`, 'error');
  });
  return c;
}

export function getRedis(): Redis {
  if (!client) {
    client = createClient('client');
  }
  return client;
}

export function getRedisPubSub(): { pubClient: Redis; subClient: Redis } {
  if (!pubClient) pubClient = createClient('pub');
  if (!subClient) subClient = createClient('sub');
  return { pubClient, subClient };
}

export async function closeRedis(): Promise<void> {
  if (pubClient) { await pubClient.quit(); pubClient = null; }
  if (subClient) { await subClient.quit(); subClient = null; }
  if (client) { await client.quit(); client = null; }
}
