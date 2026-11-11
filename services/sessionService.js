import { getCachedConfig, invalidateConfigCache } from "./configService.js";

// In-memory cache for performance
const sessionCache = new Map();
const sessionCacheTTL = 60 * 1000; // 1 minute

/**
 * Get session data from local config
 */
export async function getSessionData(phoneNumber) {
    const cleanPhone = phoneNumber?.replace(/\D/g, "") || "";
    const cached = sessionCache.get(cleanPhone);

    if (cached && (Date.now() - cached.timestamp < sessionCacheTTL)) {
        return cached.data;
    }

    const config = getCachedConfig();

    // Map config to session-like object for compatibility
    const session = {
        phone: config.phone,
        name: config.name,
        autoLikeStatus: config.autoLikeStatus,
        antiDelete: config.antiDelete,
        antiCall: config.antiCall,
        antiViewOnce: config.antiViewOnce,
        antiRemove: config.antiRemove,
        autoReadMessages: config.autoReadMessages,
        autoViewStatus: config.autoViewStatus,
        alwaysTyping: config.alwaysTyping,
        alwaysRecording: config.alwaysRecording,
        alwaysOnline: config.alwaysOnline,
        prefix: config.prefix
    };

    sessionCache.set(cleanPhone, { data: session, timestamp: Date.now() });
    return session;
}

/**
 * Invalidate session cache
 */
export function invalidateSessionCache(phoneNumber) {
    const cleanPhone = phoneNumber?.replace(/\D/g, "") || "";
    sessionCache.delete(cleanPhone);
    invalidateConfigCache();
}

/**
 * Update session settings
 */
export async function updateSessionSettings(phoneNumber, settings) {
    const { updateConfig } = await import("./configService.js");
    updateConfig(settings);
    invalidateSessionCache(phoneNumber);
}
