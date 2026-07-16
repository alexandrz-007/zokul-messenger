import { randomUUID } from 'crypto';
import multer from 'multer';
import path from 'path';
import type { Request } from 'express';
import { config } from '../config/app';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, randomUUID() + path.extname(file.originalname));
  },
});

const imageMimes = /^image\/(jpeg|png|gif|webp)$/;
const audioMimes = /^audio\/(webm|ogg|wav|mpeg|mp4|x-m4a|aac)$/;

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (imageMimes.test(file.mimetype) || audioMimes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and audio files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadMiddleware = upload.single('file');
