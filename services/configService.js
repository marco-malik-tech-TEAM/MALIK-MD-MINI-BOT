import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CONFIG_PATH = join(process.cwd(), "config.json");
const AUTH_DIR = join(process.cwd(), "auth_info");

// Default configuration for a fresh bot
const DEFAULT_CONFIG = {
    phone: "",
    name: "Bot User",
    autoLikeStatus: false,
    antiDelete: false,
    antiCall: false,
    antiViewOnce: false,
    antiRemove: false,
    autoReadMessages: false,
    autoViewStatus: false,
    alwaysTyping: false,
    alwaysRecording: false,
    alwaysOnline: false,
    prefix: ".",
    ownerNumber: "923377857866"
};

// Ensure auth directory exists
if (!existsSync(AUTH_DIR)) {
    mkdirSync(AUTH_DIR, { recursive: true });
}

/**
 * Load configuration from local JSON file
 */
export function loadConfig() {
    let fileConfig = {};
    try {
        if (existsSync(CONFIG_PATH)) {
            const data = readFileSync(CONFIG_PATH, "utf-8");
            fileConfig = JSON.parse(data);
        }
    } catch (err) {
        console.error("❌ Failed to load config.json:", err.message);
    }

    // Merge defaults -> file config -> environment variables (highest priority)
    return {
        ...DEFAULT_CONFIG,
        ...fileConfig,
        phone: process.env.PHONE || fileConfig.phone || DEFAULT_CONFIG.phone,
        ownerNumber: process.env.OWNER_NUMBER || fileConfig.ownerNumber || DEFAULT_CONFIG.ownerNumber,
        prefix: process.env.PREFIX || fileConfig.prefix || DEFAULT_CONFIG.prefix
    };
}

/**
 * Save configuration to local JSON file
 */
export function saveConfig(config) {
    try {
        writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
        console.log("✅ Config saved successfully");
        return true;
    } catch (err) {
        console.error("❌ Failed to save config.json:", err.message);
        return false;
    }
}

/**
 * Update specific settings in the config
 */
export function updateConfig(updates) {
    const config = loadConfig();
    const newConfig = { ...config, ...updates };
    return saveConfig(newConfig);
}

/**
 * Get a specific setting from config
 */
export function getSetting(key) {
    const config = loadConfig();
    return config[key];
}

// In-memory cache for performance
let configCache = null;
let configCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

/**
 * Get cached config for performance
 */
export function getCachedConfig() {
    const now = Date.now();
    if (!configCache || (now - configCacheTime > CACHE_TTL)) {
        configCache = loadConfig();
        configCacheTime = now;
    }
    return configCache;
}

/**
 * Invalidate config cache (call after updates)
 */
export function invalidateConfigCache() {
    configCache = null;
    configCacheTime = 0;
}

export const AUTH_INFO_PATH = AUTH_DIR;
