export const crash = async (sock, m, args) => {
    const chatJid = m.key.remoteJid;

    await sock.sendMessage(chatJid, {
        text: `⚠️ *SYSTEM WARNING* ⚠️

An unexpected error has occurred.
Bot process terminated unexpectedly.

Error Code: 0x0000007E
SYSTEM_THREAD_EXCEPTION_NOT_HANDLED`
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    await sock.sendMessage(chatJid, {
        text: `╔══════════════════════════════════╗
║                                  ║
║     💀 𝔹𝕃𝕌𝔼 𝕊ℂℝ𝔼𝔼ℕ 𝕆𝔽 𝔻𝔼𝔸𝕋ℍ     ║
║                                  ║
╚══════════════════════════════════╝

Your device ran into a problem
and needs to restart.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stop Code: CRITICAL_PROCESS_DIED
Memory dump: 0x00000000...0xFFFFFFFF

⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡟⠛⣻⡿⠿⠿⠿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⠟⠁⣼⣿⣧⡀⠀⣼⣿⣿⣿⣿⣿
⣿⣿⣿⣿⠏⠀⠀⠈⠻⠿⠃⠀⠹⠿⣿⣿⣿⣿
⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿
⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⣀⣴⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣷⣶⣤⣤⣤⣶⣾⣿⣿⣿⣿⣿⣿

Collecting error info... 100% complete

Restarting in 3...`
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    await sock.sendMessage(chatJid, { text: "2..." });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await sock.sendMessage(chatJid, { text: "1..." });
    await new Promise(resolve => setTimeout(resolve, 1500));

    await sock.sendMessage(chatJid, {
        text: `╔══════════════════════════════════╗
║  ✅ *𝕊𝕐𝕊𝕋𝔼𝕄 ℝ𝔼𝕊𝕋𝕆ℝ𝔼𝔻* ✅         ║
╚══════════════════════════════════╝

😂 *Just kidding!* Nothing crashed!

Your device is perfectly fine 🛡️
It was just a prank! 🎭

_MARCO MALIK & WAQAR WRITES Bot is alive and well_ 💪`
    });

    return null;
};
