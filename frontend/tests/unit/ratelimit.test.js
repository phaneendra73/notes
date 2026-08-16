import test from 'node:test';
import assert from 'node:assert/strict';
import { getClientIp, createRateLimiter } from '../../../backend/src/middleware/rateLimit.js';

test('getClientIp extracts IP from cf-connecting-ip header first', () => {
  const c = {
    req: {
      header: (name) => {
        const headers = {
          'cf-connecting-ip': '203.0.113.195',
          'x-forwarded-for': '198.51.100.1',
        };
        return headers[name.toLowerCase()] || null;
      },
    },
  };
  assert.equal(getClientIp(c), '203.0.113.195');
});

test('getClientIp falls back to first IP in x-forwarded-for', () => {
  const c = {
    req: {
      header: (name) => {
        const headers = {
          'x-forwarded-for': '198.51.100.44, 10.0.0.1',
        };
        return headers[name.toLowerCase()] || null;
      },
    },
  };
  assert.equal(getClientIp(c), '198.51.100.44');
});

test('rateLimiter enforces maximum limit and responds with 429 and Retry-After header', async () => {
  const limiter = createRateLimiter({ windowMs: 10_000, max: 3, keyPrefix: 'test_limit' });
  const headers = {};

  const makeRequest = async () => {
    let nextCalled = false;
    const c = {
      req: {
        header: () => '192.0.2.1',
      },
      header: (k, v) => {
        headers[k] = v;
      },
      json: (body, status) => ({ body, status }),
    };

    const result = await limiter(c, async () => {
      nextCalled = true;
      return { ok: true };
    });

    return { result, nextCalled, headers };
  };

  // Requests 1, 2, 3 should succeed
  const r1 = await makeRequest();
  assert.equal(r1.nextCalled, true);
  assert.equal(r1.headers['RateLimit-Limit'], '3');
  assert.equal(r1.headers['RateLimit-Remaining'], '2');

  const r2 = await makeRequest();
  assert.equal(r2.nextCalled, true);
  assert.equal(r2.headers['RateLimit-Remaining'], '1');

  const r3 = await makeRequest();
  assert.equal(r3.nextCalled, true);
  assert.equal(r3.headers['RateLimit-Remaining'], '0');

  // Request 4 should be blocked with 429
  const r4 = await makeRequest();
  assert.equal(r4.nextCalled, false);
  assert.equal(r4.result.status, 429);
  assert.equal(r4.result.body.error, 'Too Many Requests');
  assert.ok(r4.headers['Retry-After']);
});
