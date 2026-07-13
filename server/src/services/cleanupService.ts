import fs from 'fs';
import path from 'path';
import { config } from '../config/app';
import { logger } from '../utils/logger';

const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

export function cleanupOldFiles(dir?: string): number {
  const targetDir = dir || config.uploadDir;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    return 0;
  }
  const now = Date.now();
  let removed = 0;
  const entries = fs.readdirSync(targetDir);
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isFile() && now - stat.mtimeMs > MAX_AGE_MS) {
        fs.unlinkSync(fullPath);
        removed++;
      }
    } catch {
      // skip files that can't be accessed
    }
  }
  return removed;
}

let cleanupTimer: NodeJS.Timeout | null = null;

export function startCleanupScheduler(): void {
  const run = () => {
    try {
      const count = cleanupOldFiles();
      if (count > 0) logger(`Cleanup: removed ${count} old file(s) from ${config.uploadDir}`);
    } catch (err: unknown) {
      logger(`Cleanup error: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };
  run();
  cleanupTimer = setInterval(run, CLEANUP_INTERVAL_MS);
}

export function stopCleanupScheduler(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
