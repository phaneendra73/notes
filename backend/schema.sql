-- Notes Platform Database Schema v3.0
-- Single-author interactive note & visual learning platform
-- Run this on a Cloudflare D1 database

CREATE TABLE IF NOT EXISTS userprofiles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    UNIQUE NOT NULL,
  password   TEXT    NOT NULL,
  name       TEXT    DEFAULT '',
  profileUrl TEXT    DEFAULT '',
  bio        TEXT    DEFAULT '',
  githubUrl  TEXT    DEFAULT '',
  twitterUrl TEXT    DEFAULT '',
  role       TEXT    DEFAULT 'author',
  status     TEXT    DEFAULT 'ACTIVE',
  createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  slug        TEXT    UNIQUE NOT NULL,
  excerpt     TEXT    DEFAULT '',
  imageUrl    TEXT    DEFAULT '',
  readingTime INTEGER DEFAULT 1,
  pagesCount  INTEGER DEFAULT 1,
  isPublished INTEGER DEFAULT 1,
  viewsCount  INTEGER DEFAULT 0,
  authorId    INTEGER NOT NULL DEFAULT 1,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES userprofiles(id)
);

CREATE TABLE IF NOT EXISTS pages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  noteId      INTEGER NOT NULL,
  orderNumber INTEGER NOT NULL,
  title       TEXT    DEFAULT '',
  blocksJson  TEXT    NOT NULL DEFAULT '[]',
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE,
  UNIQUE (noteId, orderNumber)
);

CREATE TABLE IF NOT EXISTS media (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  filename   TEXT    NOT NULL,
  base64Data TEXT    NOT NULL,
  hash       TEXT    UNIQUE NOT NULL,
  mimeType   TEXT    DEFAULT 'image/webp',
  size       INTEGER DEFAULT 0,
  width      INTEGER DEFAULT 0,
  height     INTEGER DEFAULT 0,
  authorId   INTEGER DEFAULT 1,
  createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tagsonnotes (
  noteId INTEGER NOT NULL,
  tagId  INTEGER NOT NULL,
  PRIMARY KEY (noteId, tagId),
  FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId)  REFERENCES tags(id)  ON DELETE CASCADE
);

-- Rate limiting table (for persistent edge rate limiting across Cloudflare Worker isolates)
CREATE TABLE IF NOT EXISTS rate_limits (
  key      TEXT PRIMARY KEY,
  count    INTEGER NOT NULL DEFAULT 1,
  resetAt  INTEGER NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_notes_published ON notes(isPublished, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_notes_slug      ON notes(slug);
CREATE INDEX IF NOT EXISTS idx_pages_order      ON pages(noteId, orderNumber ASC);
CREATE INDEX IF NOT EXISTS idx_media_hash       ON media(hash);
CREATE INDEX IF NOT EXISTS idx_tags_notes       ON tagsonnotes(noteId);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(resetAt);
