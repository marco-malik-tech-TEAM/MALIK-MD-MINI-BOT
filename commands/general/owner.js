import { BRAND, getAsset } from "../../brand.js";

export const owner = async (sock, m, args) => {
    const lines = BRAND.owners.map((o, i) => `*${i + 1}. ${o.name}* (${o.role})\n   🎂 Age: ${o.age}\n   📍 ${o.city}, ${o.country}\n   📱 wa.me/${o.number}\n   ☎️ +${o.number}`).join("\n\n");
    const caption = `👑 *BOT OWNERS* 👑\n\n━━━━━━━━━━━━━━━━━━━━\n${lines}\n━━━━━━━━━━━━━━━━━━━━\n\n🌐 *Website:* ${BRAND.website}\n\n${BRAND.footer}`;

    // Send contact cards for both owners
    try {
        const contacts = BRAND.owners.map(o => ({
            displayName: o.name,
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${o.name}\nORG:${BRAND.short};\nTEL;type=CELL;type=VOICE;waid=${o.number}:+${o.number}\nEND:VCARD`
        }));
        const img = getAsset("creator.jpeg");
        if (img) await sock.sendMessage(m.key.remoteJid, { image: img, caption }, { quoted: m });
        else await sock.sendMessage(m.key.remoteJid, { text: caption }, { quoted: m });
        await sock.sendMessage(m.key.remoteJid, { contacts: { displayName: BRAND.short, contacts } }, { quoted: m });
    } catch (e) {
        console.error("owner cmd error:", e.message);
        return caption;
    }
};
