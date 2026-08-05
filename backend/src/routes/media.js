import { Hono } from "hono";
import { authenticateUser } from "./middleware.js";

export const mediaRoutes = new Hono();

// Helper to ensure media table exists in D1
async function ensureMediaTable(db) {
  await db
    .prepare(
      `
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      hash TEXT UNIQUE NOT NULL,
      mimeType TEXT DEFAULT 'image/webp',
      size INTEGER DEFAULT 0,
      width INTEGER,
      height INTEGER,
      authorId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    )
    .run();
}

// ── Upload Image (with SHA-256 deduplication hash check) ──
mediaRoutes.post("/upload", authenticateUser, async (c) => {
  try {
    await ensureMediaTable(c.env.DB);

    const body = await c.req.json();
    const { filename, dataUrl, hash, size = 0, width = 0, height = 0 } = body;
    const authorId = c.get("UserId") || 1;

    if (!dataUrl || !filename) {
      return c.json({ error: "Image data and filename are required" }, 400);
    }

    // 1. Deduplication check via SHA-256 hash
    if (hash) {
      try {
        const existing = await c.env.DB.prepare(
          "SELECT * FROM media WHERE hash = ?",
        )
          .bind(hash)
          .first();
        if (existing) {
          // Always return a clean /media/file/:id URL to the client
          // (DB may store base64 internally — that's fine, don't change it)
          const origin = new URL(c.req.url).origin;
          const clientUrl = `${origin}/media/file/${existing.id}`;
          return c.json(
            {
              message: "Image already exists in Media Library (deduplicated)",
              image: { ...existing, url: clientUrl },
              deduplicated: true,
            },
            200,
          );
        }
      } catch (hashErr) {
        console.error("Hash check warning:", hashErr);
      }
    }

    // 2. Insert base64 directly into D1 — this IS the storage (no R2)
    const fileHash =
      hash || `hash_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const result = await c.env.DB.prepare(
      "INSERT INTO media (filename, url, hash, mimeType, size, width, height, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        filename,
        dataUrl,          // ← base64 stays in DB permanently — serve route reads it
        fileHash,
        "image/webp",
        parseInt(size) || 0,
        parseInt(width) || 0,
        parseInt(height) || 0,
        parseInt(authorId),
      )
      .run();

    const mediaId = result.meta.last_row_id;

    // 3. Return a clean public URL to the client (DO NOT overwrite DB url)
    const origin = new URL(c.req.url).origin;
    const clientUrl = `${origin}/media/file/${mediaId}`;

    return c.json(
      {
        message: "Image uploaded successfully to Media Library",
        image: {
          id: mediaId,
          filename,
          url: clientUrl,   // ← client gets the clean serve URL
          hash: fileHash,
          mimeType: "image/webp",
          size: parseInt(size) || 0,
          width: parseInt(width) || 0,
          height: parseInt(height) || 0,
        },
        deduplicated: false,
      },
      201,
    );
  } catch (error) {
    console.error("Media upload error:", error);
    return c.json(
      { error: "Failed to upload media", details: error.message },
      500,
    );
  }
});

// ── Serve Binary Media File by ID ──
// DB stores base64 data URLs — this route decodes and serves the binary.
mediaRoutes.get("/file/:id", async (c) => {
  try {
    await ensureMediaTable(c.env.DB);
    const id = parseInt(c.req.param("id"));
    if (!id || isNaN(id)) return c.text("Not Found", 404);

    const media = await c.env.DB.prepare(
      "SELECT url, mimeType FROM media WHERE id = ?",
    )
      .bind(id)
      .first();
    if (!media || !media.url) return c.text("Not Found", 404);

    // Base64 stored in D1 — decode and serve binary
    if (media.url.startsWith("data:image/")) {
      const parts = media.url.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || "image/webp";
      const base64Data = parts[1];
      const buffer = Uint8Array.from(atob(base64Data), (char) =>
        char.charCodeAt(0),
      );
      return c.body(buffer, 200, {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      });
    }

    // Fallback: external URL stored — redirect
    if (media.url.startsWith("http://") || media.url.startsWith("https://")) {
      return c.redirect(media.url);
    }

    return c.text("Not Found", 404);
  } catch (err) {
    console.error("Error serving media file:", err);
    return c.text("Error serving file", 500);
  }
});

// ── List & Search Media Library Items ──
mediaRoutes.get("/list", authenticateUser, async (c) => {
  try {
    await ensureMediaTable(c.env.DB);

    const query = (c.req.query("query") || "").trim();
    const page = parseInt(c.req.query("page")) || 1;
    const limit = Math.min(parseInt(c.req.query("limit")) || 24, 60);
    const skip = (page - 1) * limit;

    let whereSql = "";
    let bindArgs = [];

    if (query) {
      whereSql = "WHERE filename LIKE ? OR hash LIKE ?";
      bindArgs.push(`%${query}%`, `%${query}%`);
    }

    const countRow = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM media ${whereSql}`,
    )
      .bind(...bindArgs)
      .first();
    const totalCount = countRow?.total || 0;

    const selectSql = `
      SELECT id, filename, url, hash, mimeType, size, width, height, createdAt
      FROM media
      ${whereSql}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const result = await c.env.DB.prepare(selectSql)
      .bind(...bindArgs, limit, skip)
      .all();
    const rawMedia = result.results || [];
    const origin = new URL(c.req.url).origin;

    // Always return /media/file/:id URLs to the client.
    // NEVER overwrite the base64 in DB — the serve route needs it to decode images.
    const mediaList = rawMedia.map((img) => {
      if (img.url && img.url.startsWith("data:image/")) {
        return { ...img, url: `${origin}/media/file/${img.id}` };
      }
      return img;
    });

    return c.json(
      {
        media: mediaList,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit) || 1,
          totalCount,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching media library:", error);
    return c.json(
      { error: "Failed to fetch media", details: error.message },
      500,
    );
  }
});

// ── Delete Image from Media Library ──
mediaRoutes.delete("/:id", authenticateUser, async (c) => {
  try {
    await ensureMediaTable(c.env.DB);
    const id = parseInt(c.req.param("id"));
    if (!id || isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

    await c.env.DB.prepare("DELETE FROM media WHERE id = ?").bind(id).run();
    return c.json({ message: "Image deleted from Media Library" }, 200);
  } catch (error) {
    console.error("Error deleting media:", error);
    return c.json({ error: "Failed to delete media" }, 500);
  }
});
