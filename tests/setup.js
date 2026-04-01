/**
 * Vitest global test setup — jsdom environment
 *
 * This file runs before every test suite. It provides:
 *  - A localStorage mock (in-memory) for tests that exercise persistence
 *  - A helper to load index.html into the jsdom document
 *  - Cleanup between tests
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

/* ── In-memory localStorage mock ── */
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] ?? null
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

/* ── Helper: load index.html into jsdom ── */
globalThis.loadDocument = () => {
  const html = readFileSync(resolve(ROOT, 'index.html'), 'utf-8');
  document.open();
  document.write(html);
  document.close();
};

/* ── Reset between tests ── */
beforeEach(() => {
  localStorage.clear();
  // Reset data-theme to light
  document.documentElement.setAttribute('data-theme', 'light');
});

afterEach(() => {
  vi.restoreAllMocks();
});
