import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { processImage } from '../src/middleware/processImage';

describe('processImage middleware', () => {
  const uploadDir = path.join(__dirname, '..', 'test-uploads');

  beforeAll(() => {
    fs.mkdirSync(uploadDir, { recursive: true });
  });

  afterAll(() => {
    try {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    } catch {
      // Windows may hold file handles; ignore cleanup errors
    }
  });

  it('should skip non-image files', async () => {
    const filePath = path.join(uploadDir, 'test.txt');
    fs.writeFileSync(filePath, 'not an image');

    const req = { file: { path: filePath, filename: 'test.txt', mimetype: 'text/plain' } } as any;

    const next = jest.fn();

    await processImage(req, {} as any, next);

    expect(next).toHaveBeenCalledWith();
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should resize image to webp', async () => {
    const inputPath = path.join(uploadDir, 'test-input.png');

    const testImage = sharp({
      create: {
        width: 3000,
        height: 2000,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    }).png();

    await testImage.toFile(inputPath);

    const req = { file: { path: inputPath, filename: 'test-input.png', mimetype: 'image/png' } } as any;

    const next = jest.fn();

    await processImage(req, {} as any, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.file.mimetype).toBe('image/webp');
    expect(req.file.filename).toBe('test-input.webp');

    const metadata = await sharp(req.file.path).metadata();
    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBeLessThanOrEqual(1920);
    expect(metadata.height).toBeLessThanOrEqual(1920);
  });

  it('should handle missing file gracefully', async () => {
    const req = {} as any;
    const next = jest.fn();

    await processImage(req, {} as any, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should clean up temp file when sharp fails', async () => {
    const filePath = path.join(uploadDir, 'corrupt.png');
    fs.writeFileSync(filePath, 'not a real image data');

    const req = { file: { path: filePath, filename: 'corrupt.png', mimetype: 'image/png' } } as any;

    const next = jest.fn();

    await processImage(req, {} as any, next);

    expect(next).toHaveBeenCalled();
    expect(fs.existsSync(filePath)).toBe(false);
  });
});
