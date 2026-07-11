const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

export function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const timestamps = rateLimit.get(ip).filter((t) => t > windowStart);
  rateLimit.set(ip, timestamps);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }

  timestamps.push(now);
  return true;
}

// Helper to clear rate limit tracker (useful for testing)
export function resetRateLimit() {
  rateLimit.clear();
}
