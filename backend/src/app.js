import express from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.set('etag', false); // Never generate ETags for dynamic API responses, eliminating 304 on auth checks
app.use(helmet());

// Ensure all authentication and dynamic API responses are never cached by browsers or edge proxies
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  });
  next();
});

const allowedOrigins = [
  env.frontendUrl,
  'https://panther-ev.vercel.app',
].filter(Boolean);

const origins = [...new Set(allowedOrigins)];
app.use(cors({ origin: origins.length === 1 ? origins[0] : origins, credentials: true }));
app.use(morgan(env.isProd ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve local media uploads (avatars, banners, product pictures)
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
