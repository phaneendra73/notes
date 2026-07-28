import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { userprofilesRoutes } from './routes/user.js';
import { lessonRoutes } from './routes/lessons.js';
import { mediaRoutes } from './routes/media.js';

const app = new Hono();

// Restrict CORS to allowed origins
app.use('/*', cors({
  origin: (origin) => {
    const allowed = [
      'https://phaneendra73.github.io',
      'http://localhost:3000',
      'http://localhost:5173',
    ];
    if (!origin) return origin;
    return allowed.includes(origin) ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Route mounts on lessons table architecture
app.route('/user', userprofilesRoutes);
app.route('/api/v2/lessons', lessonRoutes);
app.route('/lessons', lessonRoutes);
app.route('/blog', lessonRoutes); // Backward compatibility alias mapping /blog -> lessons table
app.route('/media', mediaRoutes);

app.get('/', (c) => {
  return c.json({
    message: 'Welcome to Kadha Tech Notes Learning Platform API powered by Cloudflare D1!',
    status: 'ONLINE',
    version: '2.2.0',
  }, 200);
});

app.notFound((c) => {
  return c.json({ error: 'Endpoint Not Found' }, 404);
});

app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
