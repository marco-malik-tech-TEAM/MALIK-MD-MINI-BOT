/**
 * Unicode Fancy Text Converter
 * Converts regular text to stylized Unicode characters
 */

// Mathematical Bold Serif (𝐁𝐨𝐥𝐝)
const boldSerif = {
    chars: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳",
    base: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
};

// Script/Cursive (𝒮𝒸𝓇𝒾𝓅𝓉)
const script = {
    chars: "𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏",
    base: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
};

// Double-Struck/Outlined (𝕆𝕦𝕥𝕝𝕚𝕟𝕖)
const outlined = {
    chars: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫",
    base: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
};

// Fraktur/Gothic (𝔉𝔯𝔞𝔨𝔱𝔲𝔯)
const fraktur = {
    chars: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷",
    base: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
};

// Small Caps (ꜱᴍᴀʟʟ ᴄᴀᴘꜱ)
const smallCaps = {
    chars: "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ",
    base: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
};

// Monospace (𝚖𝚘𝚗𝚘)
const mono = {
    chars: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣",
    base: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
};

// Wide/Fullwidth (Ｗｉｄｅ)
const wide = {
    chars: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ",
    base: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
};

/**
 * Convert text to a specific style
 */
function convertText(text, style) {
    const styleMap = { boldSerif, script, outlined, fraktur, smallCaps, mono, wide };
    const selectedStyle = styleMap[style] || outlined;

    return [...text].map(char => {
        const index = selectedStyle.base.indexOf(char);
        return index !== -1 ? [...selectedStyle.chars][index] : char;
    }).join("");
}

// Export individual converters
export const toFancy = (text) => convertText(text, "outlined");
export const toBold = (text) => convertText(text, "boldSerif");
export const toScript = (text) => convertText(text, "script");
export const toFraktur = (text) => convertText(text, "fraktur");
export const toSmallCaps = (text) => convertText(text, "smallCaps");
export const toMono = (text) => convertText(text, "mono");
export const toWide = (text) => convertText(text, "wide");

// Default export - uses outlined style for main branding
export default {
    toFancy,
    toBold,
    toScript,
    toFraktur,
    toSmallCaps,
    toMono,
    toWide,

    // Bot branding in fancy fonts
    BRAND: "MARCO MALIK & WAQAR WRITES",
    BOT: "𝔹𝕆𝕋",
    POWERED_BY: "ℙ𝕠𝕨𝕖𝕣𝕖𝕕 𝕓𝕪 MARCO MALIK & WAQAR WRITES 𝔹𝕠𝕥"
};
