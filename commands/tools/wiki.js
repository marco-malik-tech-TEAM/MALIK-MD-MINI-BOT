import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";

export const wiki = async (sock, m, args) => {
    const config = getCachedConfig();
    const p = config.prefix || "!";
    const query = args.join(" ");

    if (!query) {
        return `╔══════════════════════════════════╗
║   📚 *𝕎𝕀𝕂𝕀ℙ𝔼𝔻𝕀𝔸* 📚               ║
╚══════════════════════════════════╝

*Usage:* ${p}wiki <topic>
*Example:* ${p}wiki Elon Musk`;
    }

    try {
        const { data } = await axios.get("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(query), {
            headers: {
                'User-Agent': 'MARCO MALIK & WAQAR WRITES MD/2.0 (https://marco-waqar-mini-bot-info-web.vercel.app)'
            },
            timeout: 10000
        });

        if (data.type === "disambiguation") {
            return `╔══════════════════════════════════╗
║   📚 *𝕎𝕀𝕂𝕀ℙ𝔼𝔻𝕀𝔸* 📚               ║
╚══════════════════════════════════╝

⚠️ Multiple results found for "*${query}*"
💡 _Try being more specific._

*Example:* ${p}wiki Albert Einstein`;
        }

        if (!data.extract) {
            return `❌ No Wikipedia article found for "*${query}*"`;
        }

        // Trim extract if too long
        const maxLength = 2000;
        const extract = data.extract.length > maxLength
            ? data.extract.substring(0, maxLength) + "..."
            : data.extract;

        const chatJid = m.key.remoteJid;

        const caption = `╔══════════════════════════════════╗
║   📚 *𝕎𝕀𝕂𝕀ℙ𝔼𝔻𝕀𝔸* 📚               ║
╚══════════════════════════════════╝

📝 *${data.title}*
${data.description ? `_${data.description}_\n` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${extract}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 *Read more:* ${data.content_urls?.desktop?.page || "wikipedia.org"}`;

        // Try to send with thumbnail
        if (data.thumbnail?.source) {
            try {
                const imgRes = await axios.get(data.thumbnail.source, {
                    headers: {
                        'User-Agent': 'MARCO MALIK & WAQAR WRITES MD/2.0 (https://marco-waqar-mini-bot-info-web.vercel.app)'
                    },
                    responseType: "arraybuffer",
                    timeout: 10000
                });
                await sock.sendMessage(chatJid, {
                    image: Buffer.from(imgRes.data),
                    caption
                }, { quoted: m });
                return null;
            } catch { /* Fall through */ }
        }

        return caption;
    } catch (err) {
        if (err.response?.status === 404) {
            return `╔══════════════════════════════════╗
║   📚 *𝕎𝕀𝕂𝕀ℙ𝔼𝔻𝕀𝔸* 📚               ║
╚══════════════════════════════════╝

❌ No article found for "*${query}*"
💡 _Check the spelling and try again._`;
        }
        return `❌ Wikipedia search failed: ${err.message}`;
    }
};
