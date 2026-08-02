import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage
class MockStorage {
  constructor(initial = {}) {
    this.store = { ...initial };
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, val) {
    this.store[key] = String(val);
  }
}

// Request header generator logic mirroring src/utils/api.js
function prepareApiHeaders(storage) {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = storage.getItem('jwt');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

test('prepareApiHeaders includes Bearer token when jwt is present in storage', () => {
  const storage = new MockStorage({ jwt: 'sample-jwt-token-12345' });
  const headers = prepareApiHeaders(storage);

  assert.equal(headers['Content-Type'], 'application/json');
  assert.equal(headers.Authorization, 'Bearer sample-jwt-token-12345');
});

test('prepareApiHeaders omits Authorization header when jwt is missing', () => {
  const storage = new MockStorage();
  const headers = prepareApiHeaders(storage);

  assert.equal(headers['Content-Type'], 'application/json');
  assert.equal(headers.Authorization, undefined);
});
