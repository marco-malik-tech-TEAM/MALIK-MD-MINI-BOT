import { getCachedConfig } from "../../services/configService.js";

export const setbio = async (sock, m, args) => {
    const bio = args.join(" ");
    const config = getCachedConfig();
    const p = config.prefix || "!";

    if (!bio) {
        return `╔══════════════════════════════════╗
║      📝 *𝕊𝔼𝕋 𝔹𝕀𝕆* 📝            ║
╚══════════════════════════════════╝

📝 *U𝕤𝕒𝕘𝕖:* ${p}setbio [text]
📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* ${p}setbio Hello from MARCO MALIK & WAQAR WRITES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Update your WhatsApp about/bio!`;
    }

    try {
        await sock.updateProfileStatus(bio);
        return `╔══════════════════════════════════╗
║     ✅ *𝔹𝕀𝕆 𝕌ℙ𝔻𝔸𝕋𝔼𝔻* ✅         ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 *ℕ𝔼𝕎 𝔹𝕀𝕆*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${bio}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Updated by MARCO MALIK & WAQAR WRITES Bot_ 🤖`;
    } catch (error) {
        return `╔══════════════════════════════════╗
║         ❌ *𝔼ℝℝ𝕆ℝ* ❌            ║
╚══════════════════════════════════╝

Failed to update profile bio.
Please try again later.`;
    }
};
