import { getRedis } from '../config/redis';

const ONLINE_TTL = 30;
const PRESENCE_PREFIX = 'online:';

export async function setOnline(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.set(`${PRESENCE_PREFIX}${userId}`, 'true', 'EX', ONLINE_TTL);
}

export async function setOffline(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`${PRESENCE_PREFIX}${userId}`);
}

export async function isOnline(userId: string): Promise<boolean> {
  const redis = getRedis();
  const val = await redis.get(`${PRESENCE_PREFIX}${userId}`);
  return val === 'true';
}

export async function getOnlineUsers(userIds: string[]): Promise<Map<string, boolean>> {
  const redis = getRedis();
  const keys = userIds.map((id) => `${PRESENCE_PREFIX}${id}`);
  const values = await redis.mget(...keys);
  const map = new Map<string, boolean>();
  for (let i = 0; i < userIds.length; i++) {
    map.set(userIds[i], values[i] === 'true');
  }
  return map;
}

export async function getAllOnlineUserIds(): Promise<string[]> {
  const redis = getRedis();
  const ids: string[] = [];
  let cursor = '0';
  do {
    const result = await redis.scan(cursor, 'MATCH', `${PRESENCE_PREFIX}*`, 'COUNT', 100);
    cursor = result[0];
    const keys = result[1];
    for (const key of keys) {
      ids.push(key.replace(PRESENCE_PREFIX, ''));
    }
  } while (cursor !== '0');
  return ids;
}
