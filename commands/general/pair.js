import { startPairing } from "../../services/pairingService.js";
import { BRAND } from "../../brand.js";

const lastUse = new Map();

export const pair = async (sock, m, args) => {
    const jid = m.key.remoteJid;
    const number = (args.join("").replace(/\D/g, "") || "");

    if (number.length < 10 || number.length > 15) {
        return `🔗 *PAIR YOUR WHATSAPP*\n\n📝 Usage: .pair <your number with country code>\n📌 Example: .pair 923001234567\n\n🌐 Or use the website: ${BRAND.website}\n\n_You get an 8-digit code → WhatsApp > Linked Devices > Link with phone number._`;
    }

    const now = Date.now();
    if (now - (lastUse.get(jid) || 0) < 20000) return `⏳ Please wait a few seconds before requesting another code.`;
    lastUse.set(jid, now);

    await sock.sendMessage(jid, { text: `🔄 Generating pairing code for +${number}... ⏳` }, { quoted: m });

    try {
        const code = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error("Timed out. Try again.")), 60000);
            startPairing(number, "code", null, {
                onEvent: (event, data) => {
                    if (event === "pairing_code") { clearTimeout(timer); resolve(data.code); }
                    if (event === "pairing_error") { clearTimeout(timer); reject(new Error(data.error)); }
                    if (event === "pairing_success") {
                        sock.sendMessage(jid, { text: `✅ *+${number} paired successfully!*\nThe Session ID + welcome video were sent to that WhatsApp chat.` }).catch(() => { });
                    }
                }
            }).catch((e) => { clearTimeout(timer); reject(e); });
        });
        const shown = String(code).replace(/(.{4})(.{4})/, "$1-$2");
        return `✅ *PAIRING CODE*\n\n🔑 *${shown}*\n\n1️⃣ Open WhatsApp on +${number}\n2️⃣ Linked Devices → Link a Device\n3️⃣ Tap *Link with phone number instead*\n4️⃣ Enter the code above\n\n⏱️ Code expires in ~2 minutes.`;
    } catch (e) {
        console.error("pair cmd error:", e.message);
        return `❌ *Pairing failed:* ${e.message}`;
    }
};
