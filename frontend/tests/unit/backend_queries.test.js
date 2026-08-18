import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcReadingTime,
  generateSlug,
  parsePageRow,
} from '../../../backend/src/db/queries.js';
import {
  hashPassword,
  verifyPassword,
} from '../../../backend/src/middleware/auth.js';

test('generateSlug transforms title to URL-safe hyphenated slug with timestamp suffix', () => {
  const slug = generateSlug('C# Async & Await: Deep Dive!');
  assert.ok(slug.startsWith('c-async-await-deep-dive-'));
  assert.match(slug, /^[a-z0-9-]+$/);
});

test('calcReadingTime estimates reading duration based on word count across pages', () => {
  const shortPages = [
    { blocks: [{ type: 'paragraph', content: 'Short intro text here.' }] },
  ];
  assert.equal(calcReadingTime(shortPages), 1);

  // 450 words should yield ~3 minutes (200 wpm)
  const longText = Array(450).fill('word').join(' ');
  const longPages = [
    { blocks: [{ type: 'paragraph', content: longText }] },
  ];
  assert.equal(calcReadingTime(longPages), 3);
});

test('parsePageRow parses JSON blocks safely with fallback on corrupt data', () => {
  const validRow = {
    id: 10,
    orderNumber: 2,
    title: 'Variables',
    blocksJson: JSON.stringify([{ type: 'heading', level: 2, content: 'Title' }]),
  };
  const parsed = parsePageRow(validRow);
  assert.equal(parsed.id, 10);
  assert.equal(parsed.orderNumber, 2);
  assert.equal(parsed.title, 'Variables');
  assert.equal(parsed.blocks.length, 1);
  assert.equal(parsed.blocks[0].type, 'heading');

  const corruptRow = {
    id: 11,
    orderNumber: 3,
    title: 'Corrupt',
    blocksJson: '{invalid json',
  };
  const parsedCorrupt = parsePageRow(corruptRow);
  assert.equal(parsedCorrupt.blocks.length, 0);
});

test('hashPassword and verifyPassword securely hash and validate credentials', async () => {
  const plain = 'SecretAuthorPass123!';
  const hashed = await hashPassword(plain);

  assert.notEqual(hashed, plain);
  assert.equal(typeof hashed, 'string');
  assert.equal(hashed.length, 64); // SHA-256 hex length

  const isValid = await verifyPassword(plain, hashed);
  assert.equal(isValid, true);

  const isInvalid = await verifyPassword('WrongPassword', hashed);
  assert.equal(isInvalid, false);
});
