/**
 * In-Memory Sliding Window Rate Limiter
 * Provides anti-automation and brute-force protection (OWASP ASVS 2.2.1)
 */

interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Checks and increments rate limit for an identifier (e.g., username or IP).
 * @param identifier Unique key to track (e.g., username)
 * @param maxAttempts Maximum allowed attempts in the window (default: 5)
 * @param windowMs Time window in milliseconds (default: 60,000 ms / 1 min)
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // If no record or expired window, initialize fresh record
  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      retryAfterSeconds: 0,
    };
  }

  // If limit exceeded, block request
  if (record.attempts >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  // Increment attempt
  record.attempts += 1;
  return {
    allowed: true,
    remaining: maxAttempts - record.attempts,
    retryAfterSeconds: 0,
  };
}

/**
 * Clears rate limit record upon successful login.
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}
