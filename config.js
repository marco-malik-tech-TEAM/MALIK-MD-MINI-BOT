/**
 * Bot Configuration
 * Contains default settings for the WhatsApp bot
 */

export const botConfig = {
    // Bot command prefix
    prefix: ".",

    // Bot name displayed in messages
    botName: "MARCO MALIK & WAQAR WRITES MD",

    // Default session expiry in days
    sessionExpiryDays: 3,

    // Owner phone numbers (can execute owner-only commands)
    ownerNumbers: ["923377857866", "923293245445"],

    // Premium features enabled by default
    defaultPremiumFeatures: {
        alwaysOnline: false,
        antiCall: false,
        antiDelete: false,
        antiViewOnce: false
    },

    // Rate limiting
    rateLimit: {
        maxCommandsPerMinute: 30,
        cooldownMs: 2000
    },

    // Message limits
    messageLimits: {
        maxBroadcastRecipients: 50,
        maxTagAllMembers: 100
    }
};

export default botConfig;
