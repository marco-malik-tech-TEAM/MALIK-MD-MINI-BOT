export const status = async (sock, m, args) => {
    const target = args[0] ? args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.key.remoteJid;

    try {
        const ppUrl = await sock.profilePictureUrl(target, "image").catch(() => null);
        const statusInfo = await sock.fetchStatus(target).catch(() => ({ status: "No status found" }));

        return `╔══════════════════════════════════╗
║    👤 *ℙℝ𝕆𝔽𝕀𝕃𝔼 𝕍𝕀𝔼𝕎𝔼ℝ* 👤      ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *𝕌𝕊𝔼ℝ 𝕀ℕ𝔽𝕆ℝ𝕄𝔸𝕋𝕀𝕆ℕ*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 *ℕ𝕦𝕞𝕓𝕖𝕣:* ${target.split("@")[0]}
📝 *𝔸𝕓𝕠𝕦𝕥:* ${statusInfo.status || "N/A"}
${ppUrl ? `🖼️ *Profile:* ${ppUrl}` : "🖼️ *Profile:* Hidden or N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Fetched with MARCO MALIK & WAQAR WRITES Bot_ 🤖`;
    } catch (error) {
        return `╔══════════════════════════════════╗
║         ❌ *𝔼ℝℝ𝕆ℝ* ❌            ║
╚══════════════════════════════════╝

Could not fetch status information.
Please try again later.`;
    }
};
