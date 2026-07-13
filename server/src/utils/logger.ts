import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const pinoLogger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  base: { service: 'zokul-server' },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function logger(message: string, level?: 'info' | 'error' | 'warn', requestId?: string): void {
  const logFn = (msg: string) => {
    switch (level) {
      case 'error': pinoLogger.error({ requestId }, msg); return;
      case 'warn': pinoLogger.warn({ requestId }, msg); return;
      default: pinoLogger.info({ requestId }, msg);
    }
  };
  logFn(message);
}
