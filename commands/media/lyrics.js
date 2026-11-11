import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";

export const lyrics = async (sock, m, args) => {
    const config = getCachedConfig();
    const p = config.prefix || "!";
    const query = args.join(" ");

    if (!query) {
        return `╔══════════════════════════════════╗
║   🎵 *𝕃𝕐ℝ𝕀ℂ𝕊 𝔽𝕀ℕ𝔻𝔼ℝ* 🎵           ║
╚══════════════════════════════════╝

*Usage:* ${p}lyrics <song name>
*Example:* ${p}lyrics Blinding Lights`;
    }

    try {
        // Try lyrics.ovh API
        const parts = query.split(" - ");
        let artist, title;

        if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts.slice(1).join(" - ").trim();
        } else {
            // Search with the full query as title, generic artist
            title = query;
            artist = "";
        }

        let lyricsText = null;

        // Try with artist-title format first
        if (artist) {
            try {
                const { data } = await axios.get(
                    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
                    { timeout: 15000 }
                );
                lyricsText = data.lyrics;
            } catch { /* Try fallback */ }
        }

        // Fallback: try as full title
        if (!lyricsText) {
            try {
                const { data } = await axios.get(
                    `https://api.lyrics.ovh/v1/_/${encodeURIComponent(query)}`,
                    { timeout: 15000 }
                );
                lyricsText = data.lyrics;
            } catch { /* No lyrics found */ }
        }

        if (!lyricsText) {
            return `╔══════════════════════════════════╗
║   🎵 *𝕃𝕐ℝ𝕀ℂ𝕊 𝔽𝕀ℕ𝔻𝔼ℝ* 🎵           ║
╚══════════════════════════════════╝

❌ No lyrics found for "*${query}*"

💡 *Tips:*
• Try: *${p}lyrics Artist - Song Title*
• Example: *${p}lyrics Ed Sheeran - Shape of You*
• Check spelling of song/artist name`;
        }

        // Trim lyrics if too long (WhatsApp message limit)
        const maxLength = 3000;
        const trimmed = lyricsText.length > maxLength;
        const displayLyrics = trimmed
            ? lyricsText.substring(0, maxLength) + "\n\n... ✂️ _(lyrics trimmed)_"
            : lyricsText;

        return `╔══════════════════════════════════╗
║   🎵 *𝕃𝕐ℝ𝕀ℂ𝕊 𝔽𝕀ℕ𝔻𝔼ℝ* 🎵           ║
╚══════════════════════════════════╝

🎤 *${query}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${displayLyrics}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Powered by MARCO MALIK & WAQAR WRITES Bot_ 🎶`;
    } catch (err) {
        console.error("❌ Lyrics error:", err.message);
        return `❌ Failed to fetch lyrics. Try again later.`;
    }
};
