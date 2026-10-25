/**
 * In-memory token bucket rate limiter for API routes
 * Prevents API abuse and controls free tier LLM quota
 */
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const ipBuckets = new Map<string, TokenBucket>();
const CAPACITY = 20; // 20 requests per minute
const REFILL_RATE_MS = (60 * 1000) / CAPACITY; // 1 token every 3s

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let bucket = ipBuckets.get(ip);

  if (!bucket) {
    bucket = { tokens: CAPACITY, lastRefill: now };
    ipBuckets.set(ip, bucket);
  } else {
    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(elapsed / REFILL_RATE_MS);
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(CAPACITY, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: bucket.tokens };
  }

  return { allowed: false, remaining: 0 };
}
