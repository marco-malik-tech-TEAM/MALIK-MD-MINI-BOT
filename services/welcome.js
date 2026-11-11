import { BRAND, getAsset } from "../brand.js";

export const buildWelcomeText = (prefix = ".") => `╭─━─━━━━━━━━━━━━━━━━━━─━─╮
   🚀 *${BRAND.name}* 🚀
╰─━─━━━━━━━━━━━━━━━━━━─━─╯

✅ *Connected Successfully!*
✨ Welcome! Your ${BRAND.short} bot is now active.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 *BOT FEATURES*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎵 Music (MP3), Video, TikTok, Instagram, Facebook downloader
🤖 AI Chat   🛡️ Anti-Delete / Antilink
🎮 Games, Jokes & Fun   👥 Group Management
💾 Status Saver (react to any status)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 *DEVELOPERS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Marco Malik* — 19 • Rajanpur, Pakistan 🇵🇰
👤 *Waqar Writes* — 21 • Karachi, Pakistan 🇵🇰

🌐 *Website:* ${BRAND.website}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👇 *Type* ${prefix}help *to see all commands!*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

/** Sends the welcome video (or logo/text fallback) to a JID */
export async function sendWelcome(sock, jid, prefix = ".") {
    const text = buildWelcomeText(prefix);
    const video = getAsset("welcome-video.mp4");
    const logo = getAsset("logo.png");
    if (video) return sock.sendMessage(jid, { video, caption: text, gifPlayback: false });
    if (logo) return sock.sendMessage(jid, { image: logo, caption: text });
    return sock.sendMessage(jid, { text });
}
