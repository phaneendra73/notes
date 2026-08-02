import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRawMarkdownToSlides } from '../../src/utils/markdown.js';

test('parseRawMarkdownToSlides splits multi-slide markdown by horizontal rules', () => {
  const markdown = `# Introduction to C#
C# is a modern object-oriented programming language.

---

# Memory Management
Garbage collection automatically reclaims unused memory.

---

# Async and Await
Use async task patterns for non-blocking I/O operations.`;

  const slides = parseRawMarkdownToSlides(markdown);

  assert.equal(slides.length, 3);
  assert.equal(slides[0].step, 1);
  assert.equal(slides[0].title, 'Introduction to C#');
  assert.equal(slides[1].title, 'Memory Management');
  assert.equal(slides[2].title, 'Async and Await');
});

test('parseRawMarkdownToSlides extracts slide titles from first line snippet if no heading present', () => {
  const markdown = `Access Modifiers in OOP define variable visibility.

---

Dependency Injection decouples classes from dependencies.`;

  const slides = parseRawMarkdownToSlides(markdown);

  assert.equal(slides.length, 2);
  assert.equal(slides[0].title, 'Access Modifiers in OOP define variable vi...');
  assert.equal(slides[1].title, 'Dependency Injection decouples classes fro...');
});

test('parseRawMarkdownToSlides returns empty array for empty or non-string input', () => {
  assert.deepEqual(parseRawMarkdownToSlides(''), []);
  assert.deepEqual(parseRawMarkdownToSlides(null), []);
  assert.deepEqual(parseRawMarkdownToSlides(undefined), []);
});
