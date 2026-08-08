import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth.js';
import { lessonRoutes } from './routes/lessons.js';
import { tagRoutes } from './routes/tags.js';
import { mediaRoutes } from './routes/media.js';
import { createRateLimiter } from './middleware/rateLimit.js';

const app = new Hono();

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://phaneendra73.github.io',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8787',
];

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// ── RATE LIMITING ─────────────────────────────────────────────────────────────
const authLimiter = createRateLimiter({ windowMs: 60_000, max: 10, keyPrefix: 'auth' });
const globalLimiter = createRateLimiter({ windowMs: 60_000, max: 100, keyPrefix: 'global' });

app.use('/api/auth/*', authLimiter);
app.use('/api/*', globalLimiter);

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.route('/api/auth', authRoutes);
app.route('/api/lessons', lessonRoutes);
app.route('/api/tags', tagRoutes);
app.route('/api/media', mediaRoutes);

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/', (c) =>
  c.json({
    name: 'Kadha API',
    status: 'online',
    version: '3.0.0',
  })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'Endpoint not found' }, 404));

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error('Unhandled API error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
