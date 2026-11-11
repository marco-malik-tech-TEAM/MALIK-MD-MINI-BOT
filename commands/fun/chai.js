// Funny step-by-step "prank" command (clean version): chai banane ka mazaaki process
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const chai = async (sock, m, args) => {
    const jid = m.key.remoteJid;
    const ctx = m.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.mentionedJid?.[0] || ctx?.participant || null;
    const tag = target ? `@${target.split("@")[0]}` : (args.join(" ") || "Target");
    const mentions = target ? [target] : [];
    const say = (text) => sock.sendMessage(jid, { text, mentions });

    const steps = [
        `🎯 *Target Fix:* ${tag}`,
        "🔥 Mahaul garam ho raha hai...",
        "🙌 Haath ready hain...",
        "🧴 Cheeni aur patti daal raha hun...",
        "☕ 1 ubaal... 2 ubaal... 3 ubaal... 4 ubaal... 5 ubaal!",
        "💧 1 qatra... 2 qatra... 3 qatra... 4 qatra... 5 qatra!",
        "😮‍💨 Uff...",
        "😋 Maza aa gaya!",
        `✅ *Target Complete!* ${tag} ki chai tayyar hai ☕`,
        "🛁 Ab jaake nahaa lo... nahi nahi, pehle chai pi lo! 😂"
    ];
    for (const s of steps) { await say(s); await sleep(1500); }
};
