import axios from "axios";
import { formatMarkdown } from "../../utils/markdownToWhatsApp.js";
import { getCachedConfig } from "../../services/configService.js";
import { BRAND } from "../../brand.js";

const SYSTEM = `You are ${BRAND.name} AI, a friendly, smart assistant inside a WhatsApp bot. You were created by Marco Malik (19, from Rajanpur, Pakistan) and Waqar Writes (21, from Karachi, Pakistan) — the ${BRAND.short} developer team. If anyone asks who made/created/developed you, answer that you were made by Marco Malik and Waqar Writes. Reply in the same language/script the user writes in (Urdu, Roman Urdu, Hindi, English...). Keep answers clear and under 1500 characters. Use emojis sparingly. Use simple Markdown (**bold**, *italic*, \`code\`).`;

const CREATOR_RE = /(who\s+(made|created|built|developed|owns?)|your\s+(creator|developer|owner|maker)|kisne\s+(banaya|bnaya|banaya\s+hai)|kis\s*ne\s+bana|kon\s+hai\s+(aapka|apka|tumhara|tera)\s+(developer|owner|creator)|developer\s+kon|banane\s*wala|بنایا|ڈویلپر|کس نے)/i;

const creatorReply = () => `🤖 Main *${BRAND.name} AI* hun.\n\n👨‍💻 Mujhe *Marco Malik* (19 saal, Rajanpur) aur *Waqar Writes* (21 saal, Karachi) ne banaya hai — Pakistan se. 🇵🇰\n\n🌐 ${BRAND.website}`;

async function askPollinations(question) {
    const { data } = await axios.post("https://text.pollinations.ai/openai", {
        model: "openai",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: question }]
    }, { timeout: 60000, headers: { "Content-Type": "application/json" } });
    return data?.choices?.[0]?.message?.content;
}
async function askPollinationsGet(question) {
    const url = `https://text.pollinations.ai/${encodeURIComponent(question)}?system=${encodeURIComponent(SYSTEM)}`;
    const { data } = await axios.get(url, { timeout: 60000 });
    return typeof data === "string" ? data : null;
}
// Any OpenAI-compatible provider via env: AI_API_KEY, AI_BASE_URL, AI_MODEL
async function askEnvProvider(question) {
    if (!process.env.AI_API_KEY) return null;
    const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const { data } = await axios.post(`${base}/chat/completions`, {
        model: process.env.AI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: question }]
    }, { timeout: 60000, headers: { Authorization: `Bearer ${process.env.AI_API_KEY}` } });
    return data?.choices?.[0]?.message?.content;
}
async function askSiputzx(question) {
    const { data } = await axios.get(`https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(SYSTEM)}&content=${encodeURIComponent(question)}`, { timeout: 45000 });
    return data?.data;
}

export const ai = async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    const question = args.join(" ").trim();

    if (!question) {
        return `🤖 *${BRAND.name} AI*\n\n*Usage:* ${p}ai <your question>\n\n• ${p}ai Explain quantum physics simply\n• ${p}ai Write a poem about friendship\n• ${p}ai aapko kisne banaya?\n\n🧠 _Powered by ${BRAND.short}_`;
    }

    // Instant, always-working answer about the creators
    if (CREATOR_RE.test(question)) return creatorReply();

    await sock.sendMessage(jid, { text: "🤖 _Thinking..._" }, { quoted: m });

    const providers = [askEnvProvider, askPollinations, askPollinationsGet, askSiputzx];
    for (const fn of providers) {
        try {
            const reply = await fn(question);
            if (reply && typeof reply === "string" && reply.trim().length > 1) {
                let out = formatMarkdown(reply.trim());
                if (out.length > 3000) out = out.slice(0, 3000) + "\n\n_...trimmed_ ✂️";
                return `🤖 *${BRAND.name} AI*\n\n❓ *You asked:* ${question}\n\n━━━━━━━━━━━━━━━━━━━━\n\n${out}\n\n━━━━━━━━━━━━━━━━━━━━\n🧠 _Powered by ${BRAND.short}_ ⚡`;
            }
        } catch (e) {
            console.warn(`AI provider ${fn.name} failed:`, e.response?.status || e.message);
        }
    }
    return `❌ *AI is busy right now.* All AI servers failed to respond.\n\n💡 _Try again in a minute._`;
};
