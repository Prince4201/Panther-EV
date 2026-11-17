import { ZodError } from 'zod';
import multer from 'multer';
import { env } from '../config/env.js';

export const notFound = (_req, res) => res.status(404).json({ message: 'Not found' });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const errors = Object.fromEntries(err.issues.map((i) => [i.path.join('.') || 'form', i.message]));
    return res.status(422).json({ message: 'Please check the highlighted fields.', errors });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'That image is too large. Use one under 8 MB.' : 'Upload failed.' });
  }
  if (err.name === 'CastError' || err.code === '22P02') return res.status(400).json({ message: 'Invalid id.' });
  if (err.code === 'INVALID_FILE') return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: env.isProd ? 'Something went wrong.' : err.message });
}
