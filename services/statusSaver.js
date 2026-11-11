import { downloadMediaMessage } from "@whiskeysockets/baileys";
import pino from "pino";
import { BRAND } from "../brand.js";

const statusCache = new Map(); // status message id -> full message
const MAX = 400;

const unwrap = (msg) => {
    let c = msg || {};
    for (let i = 0; i < 3; i++) {
        c = c.ephemeralMessage?.message || c.viewOnceMessage?.message || c.viewOnceMessageV2?.message || c.documentWithCaptionMessage?.message || c;
    }
    return c;
};

/** Remember every status that reaches the bot while it's online */
export function cacheStatus(m) {
    if (m.key?.remoteJid !== "status@broadcast" || m.key.fromMe || !m.message) return;
    if (m.message.protocolMessage || m.message.reactionMessage) return;
    statusCache.set(m.key.id, m);
    if (statusCache.size > MAX) statusCache.delete(statusCache.keys().next().value);
}

/**
 * Owner reacts (any emoji) to a status, OR replies to a status → the status is sent to the owner's own chat.
 * Returns true if the message was a status-save trigger.
 */
export async function handleStatusSave(sock, m) {
    if (!m.message || !m.key.fromMe) return false;

    let statusId = null;
    const react = m.message.reactionMessage;
    if (react && react.key?.remoteJid === "status@broadcast" && react.text) {
        statusId = react.key.id;
    }
    const ctx = m.message.extendedTextMessage?.contextInfo;
    if (!statusId && ctx?.remoteJid === "status@broadcast" && ctx.stanzaId) {
        statusId = ctx.stanzaId;
    }
    if (!statusId) return false;

    const orig = statusCache.get(statusId);
    const me = sock.user.id.split(":")[0].split("@")[0] + "@s.whatsapp.net";
    if (!orig) {
        console.log(`ℹ️ [StatusSaver] status ${statusId} not in cache (bot was offline when it was posted)`);
        return true;
    }

    try {
        const poster = (orig.key.participant || orig.participant || "").split("@")[0];
        const c = unwrap(orig.message);
        const tag = `💾 *Status saved* ${poster ? `(from +${poster})` : ""}\n\n${BRAND.footer}`;
        if (c.imageMessage || c.videoMessage || c.audioMessage) {
            const buffer = await downloadMediaMessage(orig, "buffer", {}, { logger: pino({ level: "silent" }), reuploadRequest: sock.updateMediaMessage });
            if (c.imageMessage) await sock.sendMessage(me, { image: buffer, caption: `${c.imageMessage.caption ? c.imageMessage.caption + "\n\n" : ""}${tag}` });
            else if (c.videoMessage) await sock.sendMessage(me, { video: buffer, caption: `${c.videoMessage.caption ? c.videoMessage.caption + "\n\n" : ""}${tag}` });
            else await sock.sendMessage(me, { audio: buffer, mimetype: "audio/mp4", ptt: !!c.audioMessage.ptt });
        } else {
            const text = c.conversation || c.extendedTextMessage?.text;
            if (text) await sock.sendMessage(me, { text: `${text}\n\n${tag}` });
        }
        console.log(`💾 [StatusSaver] saved status ${statusId}`);
    } catch (e) {
        console.error("StatusSaver error:", e.message);
        await sock.sendMessage(me, { text: `❌ Status save failed: ${e.message}` }).catch(() => { });
    }
    return true;
}
