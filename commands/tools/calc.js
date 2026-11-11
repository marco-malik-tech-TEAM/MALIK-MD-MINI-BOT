import { getCachedConfig } from "../../services/configService.js";

export const calc = async (sock, m, args) => {
    const config = getCachedConfig();
    const p = config.prefix || "!";

    const expression = args.join("");
    if (!expression) {
        return `╔══════════════════════════════════╗
║   🔢 *MARCO MALIK & WAQAR WRITES ℂ𝔸𝕃ℂ𝕌𝕃𝔸𝕋𝕆ℝ* 🔢   ║
╚══════════════════════════════════╝

📝 *𝕌𝕤𝕒𝕘𝕖:* ${p}calc [expression]
📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* ${p}calc 5 * (10 + 2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Supported:* + - * / ( )`;
    }

    try {
        if (/[^-+/*().0-9 ]/g.test(expression)) {
            return `╔══════════════════════════════════╗
║         ❌ *𝔼ℝℝ𝕆ℝ* ❌            ║
╚══════════════════════════════════╝

Invalid characters detected!
Use only: *numbers* and *+ - * / ( )*`;
        }

        const result = new Function(`return ${expression}`)();

        return `╔══════════════════════════════════╗
║   🔢 *MARCO MALIK & WAQAR WRITES ℂ𝔸𝕃ℂ𝕌𝕃𝔸𝕋𝕆ℝ* 🔢   ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 *𝔼𝕏ℙℝ𝔼𝕊𝕊𝕀𝕆ℕ*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${expression}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 *ℝ𝔼𝕊𝕌𝕃𝕋*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *${result}*`;
    } catch (err) {
        return `╔══════════════════════════════════╗
║         ❌ *𝔼ℝℝ𝕆ℝ* ❌            ║
╚══════════════════════════════════╝

Calculation error!
Please check your expression.`;
    }
};
