import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { testConnection, initializeDatabase, getDbConfigSummary, pool } from './config/database.js';
import seedDatabase from './config/seed.js';
import { validateEnvironment } from './config/validateEnv.js';
import logger from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { suspiciousActivityDetector, requestSizeGuard } from './middleware/security.js';
import { webpHandler } from './middleware/webpHandler.js';

import authRoutes from './routes/authRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adsRoutes from './routes/adsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import pagesRoutes from './routes/pagesRoutes.js';
import footerRoutes from './routes/footerRoutes.js';
import { generateSitemap, generateRobotsTxt } from './controllers/seoController.js';

dotenv.config();

// Crash diagnostics on PaaS (shows real error in Railway logs)
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

// ── Validate environment on startup ──────────────────────
validateEnvironment();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Headers (Helmet) ────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",               // required by some ad networks
        'https://www.google.com',
        'https://www.gstatic.com',
        'https://pagead2.googlesyndication.com',
        'https://adservice.google.com',
        'https://*.googlesyndication.com',
        'https://*.doubleclick.net',
        'https://*.adsterra.com',
        'https://*.acscdn.com',
        'https://*.trafficjunky.net',
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL, 'https://*.googlesyndication.com', 'https://*.adsterra.com'],
      frameSrc: [
        "'self'",
        'https://www.google.com',
        'https://*.googlesyndication.com',
        'https://*.doubleclick.net',
        'https://*.adsterra.com',
      ],
    },
  } : false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ── CORS ─────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  // Production domain
  'https://aipromptloops.me',
  'https://www.aipromptloops.me',
  // Explicit env override
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = ALLOWED_ORIGINS.some((o) =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    if (allowed) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Global Rate Limiting ─────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// ── IP Throttling for Repeated Requests ──────────────────
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 30 : 10000,
  message: { error: 'Too many requests from this IP, slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', strictLimiter);

// ── Body Parsing & Cookies ───────────────────────────────
app.use(requestSizeGuard);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Compression ──────────────────────────────────────────
app.use(compression());

// ── Logging ──────────────────────────────────────────────
// Use Winston stream for production logging
const morganStream = {
  write: (message) => logger.info(message.trim()),
};

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: morganStream }));
} else {
  app.use(morgan('dev'));
}

// ── Suspicious Activity Detection ────────────────────────
app.use('/api/', suspiciousActivityDetector);

// ── WebP Image Content Negotiation ───────────────────────
app.use(webpHandler);

// ── Static Files ─────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'), {
  maxAge: '7d',
  etag: true,
}));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images'), {
  maxAge: '30d',
  etag: true,
}));

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/footer', footerRoutes);

// ── Health Check (includes DB ping — check `db.ok` if About/API fails) ──
app.get('/api/health', async (req, res) => {
  const summary = getDbConfigSummary();
  let dbOk = false;
  let mysqlCode = null;
  try {
    await pool.query('SELECT 1 AS ok');
    dbOk = true;
  } catch (e) {
    mysqlCode = e.code || null;
    console.error('[health] DB ping failed:', e.code, e.message);
  }

  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    db: {
      ok: dbOk,
      ...(mysqlCode ? { mysqlCode } : {}),
      target: summary,
    },
  });
});

// ── Root Level SEO Files ─────────────────────────────────
app.get('/sitemap.xml', generateSitemap);
app.get('/robots.txt', generateRobotsTxt);

// ── Error Handling ───────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Graceful Shutdown ────────────────────────────────────
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// ── Start Server ─────────────────────────────────────────
let server;

const start = async () => {
  try {
    const connected = await testConnection();
    if (connected) {
      if (process.env.NODE_ENV !== 'production') {
        await initializeDatabase();
        await seedDatabase();
      }
    } else {
      logger.warn('⚠️  Starting without database - some features will be unavailable');
    }

    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 AI Prompt Hub API running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n🚀 AI Prompt Hub API running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

export default app;
