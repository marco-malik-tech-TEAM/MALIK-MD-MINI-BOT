import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";

export const news = async (sock, m, args) => {
    const config = getCachedConfig();
    const p = config.prefix || "!";
    try {
        // Primary API: Saurav Tech (NewsAPI wrapper)
        const response = await axios.get("https://saurav.tech/NewsAPI/top-headlines/category/general/us.json", { timeout: 10000 });
        const articles = response.data.articles;

        if (!articles || articles.length === 0) throw new Error("No articles found");

        let message = `╔══════════════════════════════════╗
║      📰 *MARCO MALIK & WAQAR WRITES ℕ𝔼𝕎𝕊* 📰         ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 *𝕋𝕆ℙ ℍ𝔼𝔸𝔻𝕃𝕀ℕ𝔼𝕊*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

        articles.slice(0, 5).forEach((item, i) => {
            message += `${["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"][i]} *${item.title}*
   📍 _${item.source.name}_

`;
        });

        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Stay informed with MARCO MALIK & WAQAR WRITES Bot_ 🤖`;

        return {
            text: message,
            linkPreview: null
        };

    } catch (err) {
        console.error("Primary news API failed:", err.message);

        return `╔══════════════════════════════════╗
║    📰 *ℕ𝔼𝕎𝕊 𝕌ℕ𝔸𝕍𝔸𝕀𝕃𝔸𝔹𝕃𝔼* 📰      ║
╚══════════════════════════════════╝

⚠️ Unable to fetch live headlines.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 *𝕋ℝ𝕐 𝕋ℍ𝔼𝕊𝔼 𝕊𝕆𝕌ℝℂ𝔼𝕊:*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ news.google.com
2️⃣ bbc.com/news
3️⃣ cnn.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Please try again later_ 🔄`;
    }
};
