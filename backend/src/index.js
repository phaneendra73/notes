import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth.js";
import { noteRoutes } from "./routes/notes.js";
import { tagRoutes } from "./routes/tags.js";
import { mediaRoutes } from "./routes/media.js";
import { createRateLimiter } from "./middleware/rateLimit.js";

const app = new Hono();

// ── CORS ──────────────────────────────────────────────────────────────────────
// CORS_ORIGINS is a comma-separated list of allowed origins set via env config.
function getAllowedOrigins(env) {
  const raw = env?.CORS_ORIGINS || '';
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

app.use(
  "*",
  async (c, next) => {
    const allowedOrigins = getAllowedOrigins(c.env);
    return cors({
      origin: (origin) => {
        if (!origin) return '*';
        if (allowedOrigins.length === 0) return origin;
        return allowedOrigins.includes(origin) ? origin : (allowedOrigins[0] || null);
      },
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    })(c, next);
  },
);

// ── RATE LIMITING ─────────────────────────────────────────────────────────────
const authLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
  keyPrefix: "auth",
});
const globalLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 100,
  keyPrefix: "global",
});

app.use("/api/auth/*", authLimiter);
app.use("/api/*", globalLimiter);

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.route("/api/auth", authRoutes);
app.route("/api/notes", noteRoutes);
app.route("/api/lessons", noteRoutes); // backward compatibility
app.route("/api/tags", tagRoutes);
app.route("/api/media", mediaRoutes);

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get("/", (c) =>
  c.json({
    name: "Notes API",
    status: "online",
    version: "3.0.0",
  }),
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: "Endpoint not found" }, 404));

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error("Unhandled API error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
