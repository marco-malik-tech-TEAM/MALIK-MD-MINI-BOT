import app from "./app.js";
import { PORT } from "./env.js";
import { whatsappService } from "./services/whatsappService.js";
import { createServer } from "http";
import { initSocket } from "./services/socketService.js";
import { cleanStaleSessions } from "./services/cleanupService.js";

const httpServer = createServer(app);
initSocket(httpServer);

// Run cleanup on startup
cleanStaleSessions();

httpServer.listen(PORT, () => {
    console.log(`🚀 MARCO MALIK & WAQAR WRITES MD running on port ${PORT}`);
});

// Initialize WhatsApp
whatsappService.init().catch(err => {
    console.error("Failed to initialize WhatsApp Service:", err);
});

// Global Error Handling
process.on("unhandledRejection", (reason, promise) => {
    console.error("🔥 Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("🔥 Uncaught Exception:", err);
    if (
        err.message.includes("Unsupported state") ||
        err.message.includes("unable to authenticate") ||
        err.message.includes("fetch failed") ||
        err.code === "UND_ERR_CONNECT_TIMEOUT"
    ) {
        console.warn("⚠️ Ignored fatal network/decryption error to prevent process crash.");
    } else {
        console.error("🚀 Keeping server alive despite critical error.");
    }
});


// Graceful Shutdown
const shutdown = () => {
    console.log("🛑 Server shutting down...");
    // Give async file writes a moment to finish (e.g. session saving)
    setTimeout(() => {
        process.exit(0);
    }, 500);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
