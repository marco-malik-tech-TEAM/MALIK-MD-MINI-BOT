import { getCachedConfig } from "../../services/configService.js";
import { downloadMedia, firstUrl } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

const make = (site, label, emoji, example) => async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    // link can come from args or from a replied/quoted message
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const qText = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
    const url = firstUrl(args.join(" ")) || firstUrl(qText);
    if (!url) return `${emoji} *${label} DOWNLOADER*\n\n📝 Usage: ${p}${site} <link>\n📌 Example: ${p}${site} ${example}\n\n${BRAND.footer}`;

    await sock.sendMessage(jid, { text: `${emoji} Downloading ${label} video... ⏳` }, { quoted: m });
    try {
        const { buffer } = await downloadMedia(url, { site, kind: "video" });
        await sock.sendMessage(jid, { video: buffer, mimetype: "video/mp4", caption: `${emoji} *${label} Video* ✅\n\n${BRAND.footer}` }, { quoted: m });
    } catch (e) {
        console.error(`${label} download failed:`, e.message, e.details);
        return `❌ *${label} download failed.*\n\n💡 Link private/removed, or servers are busy. Try again later.`;
    }
};

export const tiktok = make("tiktok", "TikTok", "🎵", "https://vt.tiktok.com/xxxx");
export const instagram = make("instagram", "Instagram", "📸", "https://www.instagram.com/reel/xxxx");
export const facebook = make("facebook", "Facebook", "📘", "https://www.facebook.com/watch?v=xxxx");
