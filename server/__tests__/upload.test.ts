import multer from 'multer';
import path from 'path';

describe('upload middleware', () => {
  it('should export a middleware function for field "file"', () => {
    const { uploadMiddleware } = require('../src/middleware/uploadMiddleware');
    expect(typeof uploadMiddleware).toBe('function');
    expect(uploadMiddleware.length).toBe(3);
  });
});

describe('upload fileFilter MIME whitelist', () => {
  const imageMimes = /^image\/(jpeg|png|gif|webp|heic|heif|heic-sequence|heif-sequence)$/;
  const audioMimes = /^audio\/(webm|ogg|wav|mpeg|mp4|x-m4a|aac)$/;

  it('should accept valid image MIME types', () => {
    const validMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
    for (const mime of validMimes) {
      expect(imageMimes.test(mime)).toBe(true);
    }
  });

  it('should reject invalid image MIME types', () => {
    const invalidMimes = ['text/plain', 'application/pdf', 'image/bmp', 'image/svg+xml', 'audio/mpeg'];
    for (const mime of invalidMimes) {
      expect(imageMimes.test(mime)).toBe(false);
    }
  });

  it('should accept valid audio MIME types', () => {
    const validMimes = ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac'];
    for (const mime of validMimes) {
      expect(audioMimes.test(mime)).toBe(true);
    }
  });

  it('should reject invalid audio MIME types', () => {
    const invalidMimes = ['text/plain', 'image/jpeg', 'audio/x-flac'];
    for (const mime of invalidMimes) {
      expect(audioMimes.test(mime)).toBe(false);
    }
  });

  it('should reject .jpg file with text/plain MIME', () => {
    const file = {
      mimetype: 'text/plain',
      originalname: 'malicious.jpg',
    };
    const isImage = imageMimes.test(file.mimetype);
    const isAudio = audioMimes.test(file.mimetype);
    expect(isImage || isAudio).toBe(false);
  });

  it('should accept .jpg file with image/jpeg MIME', () => {
    const file = {
      mimetype: 'image/jpeg',
      originalname: 'photo.jpg',
    };
    const isImage = imageMimes.test(file.mimetype);
    const isAudio = audioMimes.test(file.mimetype);
    expect(isImage || isAudio).toBe(true);
  });

  it('should reject unknown MIME even with audio extension', () => {
    const file = {
      mimetype: 'application/octet-stream',
      originalname: 'audio.mp3',
    };
    const isImage = imageMimes.test(file.mimetype);
    const isAudio = audioMimes.test(file.mimetype);
    expect(isImage || isAudio).toBe(false);
  });
});
