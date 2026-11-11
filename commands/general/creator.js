import { BRAND, getAsset } from "../../brand.js";

export const creator = async (sock, m, args) => {
    const [a, b] = BRAND.owners;
    const caption = `💎 *BOT CREATORS* 💎

━━━━━━━━━━━━━━━━━━━━
👤 *${a.name}*
• Role: ${a.role}
• Age: ${a.age} years
• Country: ${a.country}
• Lives in: ${a.city}
• WhatsApp: wa.me/${a.number}

👤 *${b.name}*
• Role: ${b.role}
• Age: ${b.age} years
• Country: ${b.country}
• Lives in: ${b.city}
• WhatsApp: wa.me/${b.number}
━━━━━━━━━━━━━━━━━━━━

🚀 *ABOUT*
${BRAND.short} — Team of Professional Developers.
_Build • Innovate • Automate_
MD Bot | Mini Bot | Custom Bot

🌐 *Website:* ${BRAND.website}

${BRAND.footer}`;
    const img = getAsset("creator.jpeg");
    if (img) return { image: img, caption, linkPreview: null };
    return caption;
};
