import { getCachedConfig } from "../../services/configService.js";

export const setname = async (sock, m, args) => {
    const name = args.join(" ");
    const config = getCachedConfig();
    const p = config.prefix || "!";

    if (!name) {
        return `╔══════════════════════════════════╗
║     👤 *𝕊𝔼𝕋 ℕ𝔸𝕄𝔼* 👤            ║
╚══════════════════════════════════╝

📝 *𝕌𝕤𝕒𝕘𝕖:* ${p}setname [name]
📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* ${p}setname MARCO MALIK & WAQAR WRITES Bot

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Update your WhatsApp display name!`;
    }

    try {
        await sock.updateProfileName(name);
        return `╔══════════════════════════════════╗
║    ✅ *ℕ𝔸𝕄𝔼 𝕌ℙ𝔻𝔸𝕋𝔼𝔻* ✅        ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *ℕ𝔼𝕎 ℕ𝔸𝕄𝔼*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Updated by MARCO MALIK & WAQAR WRITES Bot_ 🤖`;
    } catch (error) {
        return `╔══════════════════════════════════╗
║         ❌ *𝔼ℝℝ𝕆ℝ* ❌            ║
╚══════════════════════════════════╝

Failed to update profile name.
Please try again later.`;
    }
};
