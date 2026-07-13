import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const pinoLogger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  base: { service: 'zokul-server' },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function logger(message: string, level?: 'info' | 'error' | 'warn'): void {
  switch (level) {
    case 'error':
      pinoLogger.error(message);
      return;
    case 'warn':
      pinoLogger.warn(message);
      return;
    default:
      pinoLogger.info(message);
  }
}
