import { createWhatsAppClient, getClient, clearSession } from "./whatsappClient.js";
import { existsSync } from "fs";
import { AUTH_INFO_PATH } from "./configService.js";

export const whatsappService = {
    client: null,

    async init() {
        try {
            console.log("🔄 Initializing WhatsApp Bot...");

            // Check if auth exists
            const hasSession = existsSync(AUTH_INFO_PATH) &&
                existsSync(`${AUTH_INFO_PATH}/creds.json`);

            if (hasSession) {
                console.log("📂 Found existing session. Attempting to resume...");
            } else {
                console.log("📱 No session found. Scan QR code to connect.");
            }

            // Create client
            this.client = await createWhatsAppClient();
            return this.client;
        } catch (error) {
            console.error("❌ Failed to initialize WhatsApp service:", error);
            throw error;
        }
    },

    getClient() {
        return getClient();
    },

    async logout() {
        const client = getClient();
        if (client) {
            try {
                await client.logout();
            } catch (e) {
                console.error("Logout error:", e);
            }
        }
        return clearSession();
    },

    async restart() {
        console.log("🔄 Restarting WhatsApp connection...");
        const client = getClient();
        if (client) {
            try {
                client.end();
            } catch (e) { }
        }
        return this.init();
    }
};
