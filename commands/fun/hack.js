const hackSteps = [
    "🔓 Initializing hack sequence...",
    "📡 Connecting to target device...",
    "🌐 Bypassing firewall... [██░░░░░░░░] 20%",
    "🔑 Cracking password... [████░░░░░░] 40%",
    "📂 Accessing files... [██████░░░░] 60%",
    "💾 Downloading data... [████████░░] 80%",
    "🔒 Encrypting traces... [██████████] 100%",
];

export const hack = async (sock, m, args) => {
    const target = args[0] || "unknown";
    const chatJid = m.key.remoteJid;

    // Send initial message
    await sock.sendMessage(chatJid, {
        text: `╔══════════════════════════════════╗
║   💻 *ℍ𝔸ℂ𝕂𝔼ℝ 𝕄𝕆𝔻𝔼* 💻             ║
╚══════════════════════════════════╝

🎯 *Target:* ${target}
⏳ Starting hack sequence...`
    });

    // Send animated steps with delays
    for (const step of hackSteps) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await sock.sendMessage(chatJid, { text: step });
    }

    // Final reveal
    await new Promise(resolve => setTimeout(resolve, 2000));
    await sock.sendMessage(chatJid, {
        text: `╔══════════════════════════════════╗
║   ✅ *ℍ𝔸ℂ𝕂 ℂ𝕆𝕄ℙ𝕃𝔼𝕋𝔼* ✅           ║
╚══════════════════════════════════╝

📋 *Results for ${target}:*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 *Device:* iPhone 15 Pro Max
🔋 *Battery:* 69%
📍 *Location:* Behind you 👀
🔑 *Password:* ILoveMarcoWaqarBot
💬 *Last Search:* "How to be cool"
🎵 *Last Song:* Baby Shark 🦈
📸 *Gallery:* 847 selfies found
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

😂 _Just kidding! This is a prank!_
🛡️ _No one was actually hacked._`
    });

    // Return null since we handled sending manually
    return null;
};
