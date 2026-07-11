import test from 'node:test';
import assert from 'node:assert';
import { checkRateLimit, resetRateLimit } from '../lib/rateLimit.mjs';

test('Rate Limiter Tests', async (t) => {
  // Reset the rate limiter map before each test run
  resetRateLimit();

  await t.test('allows requests below limit', () => {
    resetRateLimit();
    const ip = '192.168.1.1';
    for (let i = 0; i < 5; i++) {
      const allowed = checkRateLimit(ip);
      assert.strictEqual(allowed, true);
    }
  });

  await t.test('blocks requests exceeding limit', () => {
    resetRateLimit();
    const ip = '192.168.1.2';
    // Max limit is 10
    for (let i = 0; i < 10; i++) {
      const allowed = checkRateLimit(ip);
      assert.strictEqual(allowed, true);
    }
    // 11th request should be blocked
    const blocked = checkRateLimit(ip);
    assert.strictEqual(blocked, false);
  });

  await t.test('keeps namespaces separate for different IPs', () => {
    resetRateLimit();
    const ipA = '10.0.0.1';
    const ipB = '10.0.0.2';

    // Reach limit for IP A
    for (let i = 0; i < 10; i++) {
      assert.strictEqual(checkRateLimit(ipA), true);
    }
    assert.strictEqual(checkRateLimit(ipA), false);

    // IP B should still be allowed since it is a different namespace
    assert.strictEqual(checkRateLimit(ipB), true);
  });
});
