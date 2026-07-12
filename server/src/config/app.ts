import dotenv from 'dotenv';
dotenv.config();

function safeEnv(name: string, fallback: string): string {
  if (process.env.NODE_ENV === 'production') {
    const val = process.env[name];
    if (!val) {
      throw new Error(`Missing required environment variable: ${name}. Check .env.example`);
    }
    return val;
  }
  return process.env[name] || fallback;
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: safeEnv('DATABASE_URL', 'postgresql://zokul:zokul@localhost:5433/zokul'),
  jwtSecret: safeEnv('JWT_SECRET', 'dev-secret-change-in-production'),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  vapidPublicKey: safeEnv('VAPID_PUBLIC_KEY', 'BA8jpTeZD84g2Ba73tE4lFRurLccxaPuePLZeF5BlRKIk7FmnHQXWiLdnCmvVwz2zzculinsNeLgR-ltElGx44c'),
  vapidPrivateKey: safeEnv('VAPID_PRIVATE_KEY', '7AeddO7Bv_-5xUjO5wYNX2vF7CWFzw5sWMI4iUQ5AoE'),
};
