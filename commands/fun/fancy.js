import { getCachedConfig } from "../../services/configService.js";

export const fancy = async (sock, m, args) => {
    const config = getCachedConfig();
    const p = config.prefix || "!";
    const text = args.join(" ");
    if (!text) {
        return `╔══════════════════════════════════╗
║     ✨ *𝔽𝔸ℕℂ𝕐 𝕋𝔼𝕏𝕋 𝕄𝔸𝕂𝔼ℝ* ✨     ║
╚══════════════════════════════════╝

📝 *𝕌𝕤𝕒𝕘𝕖:* ${p}fancy [your text]
📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* ${p}fancy MARCO MALIK & WAQAR WRITES Bot

Convert any text to stylish fonts!`;
    }

    const styles = {
        bubble: (t) => {
            const map = "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ";
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return t.split("").map(c => chars.indexOf(c) > -1 ? map[chars.indexOf(c)] : c).join("");
        },
        square: (t) => {
            const map = "🄰🄱🄲🄳🄴🄵🄿🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🄰🄱🄲🄳🄴🄵🄿🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉";
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return t.split("").map(c => chars.indexOf(c) > -1 ? map[chars.indexOf(c)] : c).join("");
        },
        script: (t) => {
            const map = "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵";
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return t.split("").map(c => chars.indexOf(c) > -1 ? map[chars.indexOf(c)] : c).join("");
        },
        fraktur: (t) => {
            const map = "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ";
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return t.split("").map(c => chars.indexOf(c) > -1 ? map[chars.indexOf(c)] : c).join("");
        }
    };

    return `╔══════════════════════════════════╗
║     ✨ *𝔽𝔸ℕℂ𝕐 𝕋𝔼𝕏𝕋 𝕊𝕋𝕐𝕃𝔼𝕊* ✨     ║
╚══════════════════════════════════╝

📝 *Original:* ${text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔵 *𝔹𝕦𝕓𝕓𝕝𝕖 𝕊𝕥𝕪𝕝𝕖*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${styles.bubble(text)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟦 *𝕊𝕢𝕦𝕒𝕣𝕖 𝕊𝕥𝕪𝕝𝕖*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${styles.square(text)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📜 *𝕊𝔠𝔯𝔦𝔭𝔱 𝕊𝕥𝕪𝕝𝕖*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${styles.script(text)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
𝕲 *𝔊𝔬𝔱𝔥𝔦𝔠 𝕊𝕥𝕪𝕝𝕖*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${styles.fraktur(text)}

_Copy and paste your favorite!_ 📋`;
};
