-- Kadha Simplified Note-Sharing Database Schema (v3.0)
-- Single author educational note-sharing platform (Minimal & Scalable Architecture)

PRAGMA foreign_keys = OFF;

-- Drop active application tables
DROP TABLE IF EXISTS tagsonlessons;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS slides;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS courses;

PRAGMA foreign_keys = ON;

-- NOTE: userprofiles table is preserved to maintain existing admin user credentials.

CREATE TABLE IF NOT EXISTS userprofiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  profileUrl TEXT,
  bio TEXT,
  githubUrl TEXT,
  twitterUrl TEXT,
  role TEXT DEFAULT 'author',
  status TEXT DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT DEFAULT '',
  imageUrl TEXT DEFAULT '',
  readingTime INTEGER DEFAULT 3,
  slidesCount INTEGER DEFAULT 1,
  isPublished INTEGER DEFAULT 1,
  viewsCount INTEGER DEFAULT 0,
  orderIndex INTEGER DEFAULT 0,
  authorId INTEGER NOT NULL DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES userprofiles(id)
);

CREATE TABLE IF NOT EXISTS slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lessonId INTEGER NOT NULL,
  orderNumber INTEGER NOT NULL,
  title TEXT DEFAULT '',
  blocksJson TEXT NOT NULL DEFAULT '[]',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE(lessonId, orderNumber)
);

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  hash TEXT UNIQUE NOT NULL,
  mimeType TEXT DEFAULT 'image/webp',
  size INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  authorId INTEGER DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tagsonlessons (
  lessonId INTEGER NOT NULL,
  tagId INTEGER NOT NULL,
  PRIMARY KEY (lessonId, tagId),
  FOREIGN KEY (lessonId) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

-- Performance B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(isPublished, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);
CREATE INDEX IF NOT EXISTS idx_slides_order ON slides(lessonId, orderNumber ASC);
CREATE INDEX IF NOT EXISTS idx_media_hash ON media(hash);
