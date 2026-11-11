import { default as makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers, delay } from "@whiskeysockets/baileys";
import pino from "pino";
import { join } from "path";
import { rmSync, mkdirSync, existsSync, readFileSync } from "fs";
import { randomBytes } from "crypto";
import { emitUpdate, getIO } from "./socketService.js";
import { sendWelcome } from "./welcome.js";

// Temp storage for active pairing sessions
const activePairingSessions = new Map();

/**
 * Generate a unique Session ID
 */
const generateSessionId = () => {
    return "MARCOWAQAR-" + randomBytes(4).toString("hex").toUpperCase();
};

/**
 * Start a pairing session
 * @param {string} phoneNumber - User's phone number (optional for QR)
 * @param {string} method - "qr" or "code"
 * @param {string} socketId - Socket.IO client ID for targeted updates
 */
export const startPairing = async (phoneNumber, method = "qr", socketId, hooks = {}) => {
    const notify = (event, data) => {
        emitUpdateToSocket(socketId, event, data);
        try { hooks.onEvent?.(event, data); } catch { /* ignore */ }
    };
    const normalizedPhone = String(phoneNumber || "").replace(/\D/g, "");
    if (method === "code" && (!normalizedPhone || normalizedPhone.length < 8 || normalizedPhone.length > 15)) {
        throw new Error("Enter a valid WhatsApp number with country code for pairing code.");
    }
    console.log(`🔌 Requesting pairing for ${normalizedPhone || "QR"} (${method}) via socketId: ${socketId}`);

    try {
        const sessionId = generateSessionId();
        const sessionDir = join(process.cwd(), "sessions", sessionId);

        if (existsSync(sessionDir)) {
            rmSync(sessionDir, { recursive: true, force: true });
        }
        mkdirSync(sessionDir, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        let pairRetries = 0;
        const maxPairRetries = 2;

        const initializeSocket = async () => {
            console.log(`🔌 [${sessionId}] Initializing socket... (Attempt ${pairRetries + 1})`);

            const sock = makeWASocket({
                logger: pino({ level: "silent" }),
                auth: state,
                version: [2, 3000, 1033893291],
                browser: ["MALIK-MD-MINI-BOT", "Chrome", "145.0.0"],
                printQRInTerminal: false,
                markOnlineOnConnect: false,
                generateHighQualityLinkPreview: false,
                syncFullHistory: false,
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 0,
                keepAliveIntervalMs: 10000
            });

            // Store session ref
            activePairingSessions.set(sessionId, { sock, socketId, phone: normalizedPhone });

            let pairingCodeRequested = false;
            const requestPairingCode = async () => {
                if (pairingCodeRequested || method !== "code" || !normalizedPhone || state.creds.registered) return;
                pairingCodeRequested = true;
                try {
                    console.log(`[${sessionId}] Requesting pairing code after WhatsApp handshake...`);
                    const code = await sock.requestPairingCode(normalizedPhone);
                    console.log(`[${sessionId}] ✅ Pairing Code Generated: ${code}`);
                    notify("pairing_code", { code, sessionId });
                } catch (error) {
                    pairingCodeRequested = false;
                    console.error(`[${sessionId}] ❌ Pairing code request failed:`, error.message);
                    notify("pairing_error", {
                        error: "WhatsApp rejected the pairing request (405). Please wait a few seconds and try again with the full country-code number.",
                        sessionId,
                        statusCode: error.output?.statusCode
                    });
                }
            };

            const safeSaveCreds = async () => {
                try {
                    if (!existsSync(sessionDir)) mkdirSync(sessionDir, { recursive: true });
                    await saveCreds();
                } catch (e) {
                    console.warn(`[${sessionId}] saveCreds failed: ${e.message}`);
                }
            };

            sock.ev.on("creds.update", safeSaveCreds);

            sock.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr && method === "qr") {
                    console.log(`[${sessionId}] QR Generated`);
                    notify("qr_update", { qr, sessionId });
                }

                // In pairing-code mode Baileys emits qr as the readiness signal.
                // Calling requestPairingCode before this event can trigger 405.
                if (qr && method === "code") {
                    await requestPairingCode();
                }

                if (connection === "open") {
                    console.log(`✅ [${sessionId}] Connected Successfully!`);
                    await delay(2000);

                    let sessionData = "";
                    try {
                        const credsPath = join(sessionDir, "creds.json");
                        const creds = JSON.parse(readFileSync(credsPath).toString());
                        const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
                        sessionData = "MARCOWAQAR-" + Buffer.from(JSON.stringify({ creds, expiresAt })).toString("base64");
                    } catch (e) {
                        console.error(`[${sessionId}] Failed to read creds:`, e);
                    }

                    try {
                        const userJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
                        const messageText = sessionData;
                        await sock.sendMessage(userJid, { text: messageText });
                        console.log(`[${sessionId}] Session ID sent to user DM: ${userJid}`);
                        // Welcome video right after successful connection
                        try { await sendWelcome(sock, userJid, "."); } catch (we) { console.error(`[${sessionId}] Welcome send failed:`, we.message); }
                    } catch (msgErr) {
                        console.error(`[${sessionId}] Failed to send DM:`, msgErr);
                    }

                    notify("pairing_success", {
                        sessionId,
                        message: "Pairing Successful! Check your WhatsApp DM for the Session ID."
                    });

                    await delay(5000);
                    sock.end();
                    activePairingSessions.delete(sessionId);
                    if (existsSync(sessionDir)) {
                        rmSync(sessionDir, { recursive: true, force: true });
                    }
                }

                if (connection === "close") {
                    const code = lastDisconnect?.error?.output?.statusCode;
                    const reason = lastDisconnect?.error?.message || "Unknown Error";

                    console.warn(`[${sessionId}] Connection closed: ${code} - ${reason}`);

                    if ((code === 515 || code === 405) && pairRetries < maxPairRetries) {
                        pairRetries++;
                        console.log(`[${sessionId}] 🔄 Socket Stream Error (515), auto-restarting...`);
                        await delay(3000);
                        return initializeSocket();
                    }

                    let errorMessage = "Connection Closed (Reason: " + code + ")";
                    if (code === DisconnectReason.loggedOut) errorMessage = "Device logged out/disconnected.";
                    else if (code === DisconnectReason.connectionClosed) errorMessage = "Connection was closed by server. Try again.";
                    else if (code === DisconnectReason.connectionLost) errorMessage = "Network link lost. Check your internet.";
                    else if (code === DisconnectReason.timedOut) errorMessage = "Connection timed out. Please retry.";
                    else if (code === 401) errorMessage = "Unauthorized. Please scan a fresh code.";
                    else if (code === 408) errorMessage = "Uplink Request Timed Out (408). Check your signal.";
                    else if (code === 515) errorMessage = "Stream Error (515). The server detected a conflict. Retrying terminal advised.";

                    notify("pairing_error", {
                        error: errorMessage,
                        sessionId,
                        statusCode: code
                    });

                    activePairingSessions.delete(sessionId);
                    rmSync(sessionDir, { recursive: true, force: true });
                }
            });

            return sock;
        };

        await initializeSocket();

        // Cleanup timeout
        setTimeout(() => {
            if (activePairingSessions.has(sessionId)) {
                console.log(`[${sessionId}] Session timed out (120s cleanup reached)`);
                const session = activePairingSessions.get(sessionId);
                session?.sock?.end();
                activePairingSessions.delete(sessionId);
                if (existsSync(sessionDir)) {
                    rmSync(sessionDir, { recursive: true, force: true });
                }
            }
        }, 120 * 1000);

        return { sessionId };

    } catch (error) {
        console.error("Critical Error in startPairing:", error);
        throw new Error(`Pairing Initialization Failed: ${error.message}`);
    }
};

const emitUpdateToSocket = (socketId, event, data) => {
    try {
        const io = getIO();
        io.emit(event, data);
        console.log(`📡 BROADCAST_EMIT: ${event} -> Data:`, JSON.stringify(data));
        if (socketId) {
            console.log(`📡 (Target was: ${socketId})`);
        }
    } catch (e) {
        console.error("Socket emit error:", e.message);
    }
};
