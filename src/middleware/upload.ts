import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';

// fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, env.uploadDir);
  },
  filename: (_req, file, callback) => {
    const safeFileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    callback(null, safeFileName);
  }
});

export const upload = multer({ storage });
