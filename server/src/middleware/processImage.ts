import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const imageMimes = /^image\/(jpeg|png|gif|webp|heic|heif|heic-sequence|heif-sequence)$/;

export async function processAvatar(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const file = req.file;
  if (!file || !imageMimes.test(file.mimetype)) {
    return next();
  }

  try {
    const metadata = await sharp(file.path).metadata();
    if (!metadata.format) {
      fs.unlinkSync(file.path);
      return next(new Error('Invalid image file'));
    }

    const ext = path.extname(file.path);
    const webpPath = file.path.replace(ext, '.webp');
    const webpFilename = file.filename.replace(ext, '.webp');

    await sharp(file.path)
      .resize(256, 256, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(webpPath);

    fs.unlinkSync(file.path);

    file.path = webpPath;
    file.filename = webpFilename;
    file.mimetype = 'image/webp';
    req.file = file;

    next();
  } catch (err) {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    next(err);
  }
}

export async function processImage(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const file = req.file;
  if (!file || !imageMimes.test(file.mimetype)) {
    return next();
  }

  try {
    const metadata = await sharp(file.path).metadata();
    if (!metadata.format) {
      fs.unlinkSync(file.path);
      return next(new Error('Invalid image file'));
    }

    const ext = path.extname(file.path);
    const webpPath = file.path.replace(ext, '.webp');
    const webpFilename = file.filename.replace(ext, '.webp');

    await sharp(file.path)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(webpPath);

    fs.unlinkSync(file.path);

    file.path = webpPath;
    file.filename = webpFilename;
    file.mimetype = 'image/webp';
    req.file = file;

    next();
  } catch (err) {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    next(err);
  }
}
