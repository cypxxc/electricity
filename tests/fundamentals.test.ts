import { describe, expect, test } from 'bun:test';
import { env } from '../lib/env';
import { checkRateLimit, clearRateLimit } from '../lib/auth/rate-limiter';
import robots from '../app/robots';

describe('Web Engineering Fundamentals & Standards', () => {
  describe('Environment Validation (lib/env.ts)', () => {
    test('enforces required DATABASE_URL and defaults', () => {
      expect(env.DATABASE_URL).toBeDefined();
      expect(typeof env.DATABASE_URL).toBe('string');
      expect(env.DATABASE_URL.length).toBeGreaterThan(0);
    });

    test('validates NODE_ENV within permitted enum values', () => {
      expect(['development', 'test', 'production']).toContain(env.NODE_ENV);
    });

    test('validates PORT as a valid number', () => {
      expect(typeof env.PORT).toBe('number');
      expect(env.PORT).toBeGreaterThan(0);
    });

    test('transforms COOKIE_SECURE into boolean', () => {
      expect(typeof env.COOKIE_SECURE).toBe('boolean');
    });
  });

  describe('Rate Limiting & Anti-Brute Force (lib/auth/rate-limiter.ts)', () => {
    test('allows requests within limit and decrements remaining', () => {
      const testId = `test-user-${Date.now()}`;
      clearRateLimit(testId);

      const r1 = checkRateLimit(testId, 3, 10000);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = checkRateLimit(testId, 3, 10000);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = checkRateLimit(testId, 3, 10000);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      // 4th attempt should be blocked
      const r4 = checkRateLimit(testId, 3, 10000);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
      expect(r4.retryAfterSeconds).toBeGreaterThan(0);

      // Clearing should reset
      clearRateLimit(testId);
      const r5 = checkRateLimit(testId, 3, 10000);
      expect(r5.allowed).toBe(true);
      expect(r5.remaining).toBe(2);
    });
  });

  describe('Search Engine Robot Policy (app/robots.ts)', () => {
    test('generates valid Next.js robots configuration', () => {
      const config = robots();
      expect(config.rules).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rule = Array.isArray(config.rules) ? config.rules[0] : (config.rules as any);
      expect(rule.allow).toBe('/');
      expect(rule.disallow).toContain('/admin');
      expect(rule.disallow).toContain('/login');
    });
  });
});
