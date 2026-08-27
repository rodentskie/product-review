import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../handlers/uploads.handler';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadsRouter = Router();

uploadsRouter.post('/', upload.single('image'), uploadImage);
