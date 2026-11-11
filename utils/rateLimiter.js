/**
 * Simple In-Memory Rate Limiter
 * Limits users to a fixed number of commands per time window.
 */
class RateLimiter {
    constructor(limit = 5, windowMs = 60000) {
        this.limit = limit;
        this.windowMs = windowMs;
        this.store = new Map();
    }

    /**
     * Check if a user is within the rate limit.
     * @param {string} userId - The user ID (phone number).
     * @returns {boolean} - true if allowed, false if limited.
     */
    check(userId) {
        const now = Date.now();
        const record = this.store.get(userId);

        if (!record) {
            this.store.set(userId, { count: 1, firstRequest: now });
            return true;
        }

        if (now - record.firstRequest > this.windowMs) {
            // Window expired, reset
            this.store.set(userId, { count: 1, firstRequest: now });
            return true;
        }

        if (record.count >= this.limit) {
            console.warn(`⚠️ [RateLimiter] User ${userId} exceeded limit (${this.limit}/${this.windowMs}ms)`);
            return false;
        }

        record.count++;
        return true;
    }

    /**
     * Get seconds remaining until limit reset for a user.
     * @param {string} userId
     * @returns {number} Seconds remaining
     */
    getTimeToReset(userId) {
        const record = this.store.get(userId);
        if (!record) return 0;
        const elapsed = Date.now() - record.firstRequest;
        const remaining = Math.max(0, this.windowMs - elapsed);
        return Math.ceil(remaining / 1000);
    }

    /**
     * Clean up old entries to prevent memory leaks.
     * Should be called periodically.
     */
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.store.entries()) {
            if (now - value.firstRequest > this.windowMs) {
                this.store.delete(key);
            }
        }
    }
}

// Global instance: 5 commands per 60 seconds
export const rateLimiter = new RateLimiter(5, 60000);

// Auto-cleanup every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
