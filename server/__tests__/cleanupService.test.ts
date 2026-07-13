import fs from 'fs';
import path from 'path';
import os from 'os';
import { cleanupOldFiles } from '../src/services/cleanupService';

describe('cleanupService', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-test-'));

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should remove files older than 3 days', () => {
    const oldFile = path.join(tmpDir, 'old.txt');
    const oldTime = Date.now() - 4 * 24 * 60 * 60 * 1000;
    fs.writeFileSync(oldFile, 'old');
    fs.utimesSync(oldFile, new Date(oldTime / 1000), new Date(oldTime / 1000));

    const newFile = path.join(tmpDir, 'new.txt');
    fs.writeFileSync(newFile, 'new');

    const removed = cleanupOldFiles(tmpDir);
    expect(removed).toBe(1);
    expect(fs.existsSync(oldFile)).toBe(false);
    expect(fs.existsSync(newFile)).toBe(true);
  });

  it('should not fail on empty directory', () => {
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-empty-'));
    const removed = cleanupOldFiles(emptyDir);
    expect(removed).toBe(0);
    fs.rmSync(emptyDir, { recursive: true, force: true });
  });

  it('should create directory if missing', () => {
    const missingDir = path.join(os.tmpdir(), 'cleanup-missing-' + Date.now());
    const removed = cleanupOldFiles(missingDir);
    expect(removed).toBe(0);
    expect(fs.existsSync(missingDir)).toBe(true);
    fs.rmSync(missingDir, { recursive: true, force: true });
  });
});
