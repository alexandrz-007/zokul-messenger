import multer from 'multer';
import path from 'path';
import { config } from '../config/app';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const imageExts = /\.(jpg|jpeg|png|gif|webp)$/i;
const audioExts = /\.(webm|ogg|wav|mp3|mp4|m4a|aac)$/i;
const audioMimes = /^audio\//;

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname);
  if (imageExts.test(ext) || audioExts.test(ext) || audioMimes.test(file.mimetype)) {
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
export const uploadImagesMiddleware = upload.array('files', 4);
