import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { env } from './config/env';

const app = express();

// 1. CORS & Security Headers (Explicit trusted frontend origins with credentials)
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://stroitx.com',
  'https://www.stroitx.com',
].filter(Boolean);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      if (
        allowedOrigins.includes(requestOrigin) ||
        (env.NODE_ENV === 'development' && /^http:\/\/localhost(:\d+)?$/.test(requestOrigin))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${requestOrigin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));

// 2. Sensitive KYC Storage Protection: Block unauthenticated static access to /uploads/kyc
app.use('/uploads/kyc', (_req, res) => {
  res.status(403).json({
    success: false,
    message: 'Access Denied: KYC identity documents cannot be accessed via public static URLs. Please access through authenticated route /api/verification/document/:id.',
  });
});

// 2.1 Serve non-sensitive public uploads statically (Docker Root Volume /app/uploads)
const uploadsDirectory = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDirectory)) {
  try {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
  } catch (e) {}
}
app.use('/uploads', express.static(uploadsDirectory));

// 3. Body Parsers & Cookie Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use('/api', apiLimiter);

// 5. System Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'StroitX Construction Marketplace',
    timestamp: new Date().toISOString(),
  });
});

// 6. API Routes
app.use('/api', apiRoutes);

// 7. Centralized Error Handler
app.use(errorHandler);

export default app;
