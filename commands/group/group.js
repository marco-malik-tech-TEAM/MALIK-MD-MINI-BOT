/**
 * Group Commands - Comprehensive group management suite
 * Commands: hidetag, tagall, kick, add, promote, demote, mute, unmute, 
 *           groupinfo, grouplink, revoke, antilink, setwelcome, setgoodbye
 */

import { isAdmin, isBotAdmin } from "../../utils/groupUtils.js";
import { getCachedConfig } from "../../services/configService.js";
import {
    loadGroupSettings,
    saveGroupSettings,
    saveInviteCode,
    getInviteCode,
    updateGroupName
} from "../../services/groupSettingsService.js";

/**
 * !hidetag <message> - Tag all members without showing mentions (stealth tag)
 */
export async function hidetag(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `╔══════════════════════════════════╗
║  ⚠️ *𝔾ℝ𝕆𝕌ℙ 𝕆ℕ𝕃𝕐* ⚠️  ║
╚══════════════════════════════════╝

This command only works in groups.`;
    }

    const message = args.join(" ") || "📢 Attention everyone!";

    try {
        const metadata = await sock.groupMetadata(remoteJid);
        const participants = metadata.participants.map(p => p.id);

        await sock.sendMessage(remoteJid, {
            text: message,
            mentions: participants
        });

        return null; // Message already sent
    } catch (err) {
        return `❌ Failed to hidetag: ${err.message}`;
    }
}

/**
 * !tagall - Tag all members with visible list
 */
export async function tagall(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    const customMessage = args.join(" ") || "";

    try {
        const metadata = await sock.groupMetadata(remoteJid);
        const participants = metadata.participants;

        let tagList = `╔══════════════════════════════════╗
║  📢 *𝕋𝔸𝔾 𝔸𝕃𝕃 𝕄𝔼𝕄𝔹𝔼ℝ𝕊* 📢  ║
╚══════════════════════════════════╝

${customMessage ? `💬 *Message:* ${customMessage}\n\n` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 *Members (${participants.length}):*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        participants.forEach((p, i) => {
            const number = p.id.split("@")[0];
            tagList += `${i + 1}. @${number}\n`;
        });

        await sock.sendMessage(remoteJid, {
            text: tagList,
            mentions: participants.map(p => p.id)
        });

        return null;
    } catch (err) {
        return `❌ Failed: ${err.message}`;
    }
}

/**
 * !kick @user - Remove a member from the group
 */
export async function kick(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to remove members.`;
    }

    // Get mentioned user or quoted message sender
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned || quoted;

    if (!target) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `╔══════════════════════════════════╗
║  🦶 *𝕂𝕀ℂ𝕂 𝕄𝔼𝕄𝔹𝔼ℝ* 🦶  ║
╚══════════════════════════════════╝

*Usage:* ${p}kick @user
*Alt:* Reply to a message with ${p}kick`;
    }

    try {
        await sock.groupParticipantsUpdate(remoteJid, [target], "remove");
        const number = target.split("@")[0];
        return `✅ Successfully removed @${number} from the group.`;
    } catch (err) {
        return `❌ Failed to kick: ${err.message}`;
    }
}

/**
 * !add <number> - Add a member to the group
 */
export async function add(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to add members.`;
    }

    if (!args[0]) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `╔══════════════════════════════════╗
║  ➕ *𝔸𝔻𝔻 𝕄𝔼𝕄𝔹𝔼ℝ* ➕  ║
╚══════════════════════════════════╝

*Usage:* ${p}add 255712345678
Include country code without + or spaces.`;
    }

    const number = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    try {
        const result = await sock.groupParticipantsUpdate(remoteJid, [number], "add");

        if (result[0]?.status === "403") {
            return `⚠️ Cannot add this number. Their privacy settings may prevent it.`;
        }

        return `✅ Successfully added ${args[0]} to the group!`;
    } catch (err) {
        return `❌ Failed to add: ${err.message}`;
    }
}

/**
 * !promote @user - Make someone an admin
 */
export async function promote(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to promote members.`;
    }

    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned || quoted;

    if (!target) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `╔══════════════════════════════════╗
║  👑 *ℙℝ𝕆𝕄𝕆𝕋𝔼 𝕋𝕆 𝔸𝔻𝕄𝕀ℕ* 👑  ║
╚══════════════════════════════════╝

*Usage:* ${p}promote @user
*Alt:* Reply to a message with ${p}promote`;
    }

    try {
        await sock.groupParticipantsUpdate(remoteJid, [target], "promote");
        const number = target.split("@")[0];
        return `👑 @${number} is now an admin!`;
    } catch (err) {
        return `❌ Failed to promote: ${err.message}`;
    }
}

/**
 * !demote @user - Remove admin status
 */
export async function demote(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to demote members.`;
    }

    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned || quoted;

    if (!target) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `╔══════════════════════════════════╗
║  📉 *𝔻𝔼𝕄𝕆𝕋𝔼 𝔸𝔻𝕄𝕀ℕ* 📉  ║
╚══════════════════════════════════╝

*Usage:* ${p}demote @user
*Alt:* Reply to a message with ${p}demote`;
    }

    try {
        await sock.groupParticipantsUpdate(remoteJid, [target], "demote");
        const number = target.split("@")[0];
        return `📉 @${number} is no longer an admin.`;
    } catch (err) {
        return `❌ Failed to demote: ${err.message}`;
    }
}

/**
 * !mute - Close group (only admins can send)
 */
export async function mute(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to mute the group.`;
    }

    const config = getCachedConfig();
    const p = config.prefix || "!";

    try {
        await sock.groupSettingUpdate(remoteJid, "announcement");
        return `╔══════════════════════════════════╗
║  🔇 *𝔾ℝ𝕆𝕌ℙ 𝕄𝕌𝕋𝔼𝔻* 🔇  ║
╚══════════════════════════════════╝

🔒 *Group is now closed.*
Only admins can send messages.

Use *${p}unmute* to reopen.`;
    } catch (err) {
        return `❌ Failed to mute: ${err.message}`;
    }
}

/**
 * !unmute - Open group (everyone can send)
 */
export async function unmute(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to unmute the group.`;
    }

    try {
        await sock.groupSettingUpdate(remoteJid, "not_announcement");
        return `╔══════════════════════════════════╗
║  🔊 *𝔾ℝ𝕆𝕌ℙ 𝕌ℕ𝕄𝕌𝕋𝔼𝔻* 🔊  ║
╚══════════════════════════════════╝

Everyone can now send messages.`;
    } catch (err) {
        return `❌ Failed to unmute: ${err.message}`;
    }
}

/**
 * !groupinfo - Display group information
 */
export async function groupinfo(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    try {
        const metadata = await sock.groupMetadata(remoteJid);
        const admins = metadata.participants.filter(p => p.admin);
        const superAdmins = admins.filter(p => p.admin === "superadmin");
        const regularAdmins = admins.filter(p => p.admin === "admin");

        const createdDate = new Date(metadata.creation * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        return `╔══════════════════════════════════╗
║  📊 *𝔾ℝ𝕆𝕌ℙ 𝕀ℕ𝔽𝕆* 📊  ║
╚══════════════════════════════════╝

📛 *Name:* ${metadata.subject}
🆔 *ID:* ${remoteJid}
📝 *Description:*
${metadata.desc || "_No description_"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 *Total Members:* ${metadata.participants.length}
👑 *Super Admins:* ${superAdmins.length}
🛡️ *Admins:* ${regularAdmins.length}
📅 *Created:* ${createdDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    } catch (err) {
        return `❌ Failed to get info: ${err.message}`;
    }
}

/**
 * !grouplink - Get group invite link
 */
export async function grouplink(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to get the invite link.`;
    }

    try {
        const code = await sock.groupInviteCode(remoteJid);
        return `╔══════════════════════════════════╗
║  🔗 *𝔾ℝ𝕆𝕌ℙ 𝕃𝕀ℕ𝕂* 🔗  ║
╚══════════════════════════════════╝

https://chat.whatsapp.com/${code}

Share this link to invite people!`;
    } catch (err) {
        return `❌ Failed to get link: ${err.message}`;
    }
}

/**
 * !revoke - Reset/revoke group invite link
 */
export async function revoke(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to revoke the link.`;
    }

    try {
        await sock.groupRevokeInvite(remoteJid);
        const newCode = await sock.groupInviteCode(remoteJid);
        return `╔══════════════════════════════════╗
║  🔄 *𝕃𝕀ℕ𝕂 ℝ𝔼𝕍𝕆𝕂𝔼𝔻* 🔄  ║
╚══════════════════════════════════╝

Old link has been disabled.

*New link:*
https://chat.whatsapp.com/${newCode}`;
    } catch (err) {
        return `❌ Failed to revoke: ${err.message}`;
    }
}

/**
 * !leave - Make the bot leave the group
 */
export async function leave(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    // Try to save invite code before leaving
    if (await isBotAdmin(sock, remoteJid)) {
        try {
            const code = await sock.groupInviteCode(remoteJid);
            const metadata = await sock.groupMetadata(remoteJid);
            saveInviteCode(remoteJid, code);
            updateGroupName(remoteJid, metadata.subject);
            console.log(`📝 Saved invite code for ${metadata.subject} before leaving.`);
        } catch (e) {
            console.error("Failed to save invite code:", e.message);
        }
    }

    try {
        const sender = m.key.participant || m.key.remoteJid;
        const botJid = sock.user?.id;

        // If the message is fromMe, it means the user's personal account is leaving
        if (m.key.fromMe) {
            const config = getCachedConfig();
            const p = config.prefix || "!";
            await sock.sendMessage(remoteJid, {
                text: `⚠️ *Warning:* You are using your personal WhatsApp account as the bot. 
Running ${p}leave will make *YOU* leave this group.

If you just want me to stop responding, use:
*${p}bot off*

If you really want to leave, type:
*${p}leave confirm*`
            });

            if (args[0] !== "confirm") return null;
        }

        await sock.sendMessage(remoteJid, {
            text: `╔══════════════════════════════════╗
    ║  👋 *𝔾𝕆𝕆𝔻𝔹𝕐𝔼* 👋  ║
    ╚══════════════════════════════════╝

    MARCO MALIK & WAQAR WRITES MD is leaving this group.
    Thanks for having me! 

    🔗 marco-waqar-mini-bot-info-web.vercel.app`
        });

        await sock.groupLeave(remoteJid);
        return null;
    } catch (err) {
        return `❌ Failed to leave: ${err.message}`;
    }
}

/**
 * !admins - List all group admins
 */
export async function admins(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    try {
        const metadata = await sock.groupMetadata(remoteJid);
        const adminList = metadata.participants.filter(p => p.admin);

        let output = `╔══════════════════════════════════╗
║  👑 *𝔾ℝ𝕆𝕌ℙ 𝔸𝔻𝕄𝕀ℕ𝕊* 👑  ║
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        adminList.forEach((admin, i) => {
            const number = admin.id.split("@")[0];
            const role = admin.admin === "superadmin" ? "👑 Owner" : "🛡️ Admin";
            output += `${i + 1}. @${number} - ${role}\n`;
        });

        output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Total:* ${adminList.length} admins`;

        await sock.sendMessage(remoteJid, {
            text: output,
            mentions: adminList.map(a => a.id)
        });

        return null;
    } catch (err) {
        return `❌ Failed: ${err.message}`;
    }
}

/**
 * !setname <name> - Change group name
 */
export async function setgroupname(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to change the group name.`;
    }

    const newName = args.join(" ");
    if (!newName) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `*Usage:* ${p}setgroupname <new name>`;
    }

    try {
        await sock.groupUpdateSubject(remoteJid, newName);
        return `✅ Group name changed to: *${newName}*`;
    } catch (err) {
        return `❌ Failed: ${err.message}`;
    }
}

/**
 * !setdesc <description> - Change group description
 */
export async function setdesc(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to change the description.`;
    }

    const newDesc = args.join(" ");
    if (!newDesc) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `*Usage:* ${p}setdesc <new description>`;
    }

    try {
        await sock.groupUpdateDescription(remoteJid, newDesc);
        return `✅ Group description updated!`;
    } catch (err) {
        return `❌ Failed: ${err.message}`;
    }
}

// ═══════════════════════════════════════════════════════════════
// WELCOME & GOODBYE SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * !welcome on/off - Toggle welcome messages
 */
export async function welcome(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    const settings = loadGroupSettings(remoteJid);
    const action = args[0]?.toLowerCase();

    if (action === "on") {
        settings.welcome.enabled = true;
        saveGroupSettings(remoteJid, settings);
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `✅ *Welcome Enabled!* New members will now be greeted.
💡 Use *${p}setwelcome <message>* to change it.`;
    }

    if (action === "off") {
        settings.welcome.enabled = false;
        saveGroupSettings(remoteJid, settings);
        return `╔══════════════════════════════════╗
║  ❌ *𝕎𝔼𝕃ℂ𝕆𝕄𝔼 𝔻𝕀𝕊𝔸𝔹𝕃𝔼𝔻* ❌  ║
╚══════════════════════════════════╝

Welcome messages have been turned off.`;
    }

    const config = getCachedConfig();
    const p = config.prefix || "!";
    return `╔══════════════════════════════════╗
║  👋 *𝕎𝔼𝕃ℂ𝕆𝕄𝔼 𝕊𝕐𝕊𝕋𝔼𝕄* 👋  ║
╚══════════════════════════════════╝

*Status:* ${settings.welcome.enabled ? "✅ Enabled" : "❌ Disabled"}

*Current message:*
${settings.welcome.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Commands:*
• ${p}welcome on - Enable
• ${p}welcome off - Disable
• ${p}setwelcome <msg> - Set message

💡 Use *@user* for member mention`;
}

/**
 * !setwelcome <message> - Set custom welcome message
 */
export async function setwelcome(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    const message = args.join(" ");
    if (!message) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `╔══════════════════════════════════╗
║  ✏️ *𝕊𝔼𝕋 𝕎𝔼𝕃ℂ𝕆𝕄𝔼* ✏️  ║
╚══════════════════════════════════╝

*Usage:* ${p}setwelcome <your message>

*Placeholders:*
• @user - Member's mention
• {group} - Group name
• {count} - Member count

*Example:*
${p}setwelcome Welcome @user to our family! 🎉
You are member #{count} in {group}!`;
    }

    const settings = loadGroupSettings(remoteJid);
    settings.welcome.message = message;
    settings.welcome.enabled = true;
    saveGroupSettings(remoteJid, settings);

    return `✅ Welcome message updated!

*Preview:*
${message.replace("@user", "@newmember")}`;
}

/**
 * !goodbye on/off - Toggle goodbye messages
 */
export async function goodbye(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    const settings = loadGroupSettings(remoteJid);
    const action = args[0]?.toLowerCase();

    if (action === "on") {
        settings.goodbye.enabled = true;
        saveGroupSettings(remoteJid, settings);
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `╔══════════════════════════════════╗
║  ✅ *𝔾𝕆𝕆𝔻𝔹𝕐𝔼 𝔼ℕ𝔸𝔹𝕃𝔼𝔻* ✅  ║
╚══════════════════════════════════╝

A farewell message will be sent when members leave!

*Current message:*
${settings.goodbye.message}

💡 Use *${p}setgoodbye <message>* to change it.`;
    }

    if (action === "off") {
        settings.goodbye.enabled = false;
        saveGroupSettings(remoteJid, settings);
        return `╔══════════════════════════════════╗
║  ❌ *𝔾𝕆𝕆𝔻𝔹𝕐𝔼 𝔻𝕀𝕊𝔸𝔹𝕃𝔼𝔻* ❌  ║
╚══════════════════════════════════╝

Goodbye messages have been turned off.`;
    }

    const config = getCachedConfig();
    const p = config.prefix || "!";
    return `╔══════════════════════════════════╗
║  👋 *𝔾𝕆𝕆𝔻𝔹𝕐𝔼 𝕊𝕐𝕊𝕋𝔼𝕄* 👋  ║
╚══════════════════════════════════╝

*Status:* ${settings.goodbye.enabled ? "✅ Enabled" : "❌ Disabled"}

*Current message:*
${settings.goodbye.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Commands:*
• ${p}goodbye on - Enable
• ${p}goodbye off - Disable
• ${p}setgoodbye <msg> - Set message

💡 Use *@user* for member mention`;
}

/**
 * !setgoodbye <message> - Set custom goodbye message
 */
export async function setgoodbye(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    const message = args.join(" ");
    if (!message) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `╔══════════════════════════════════╗
║  ✏️ *𝕊𝔼𝕋 𝔾𝕆𝕆𝔻𝔹𝕐𝔼* ✏️  ║
╚══════════════════════════════════╝

*Usage:* ${p}setgoodbye <your message>

*Placeholders:*
• @user - Member's name
• {group} - Group name

*Example:*
${p}setgoodbye Goodbye @user! 👋
We'll miss you in {group}!`;
    }

    const settings = loadGroupSettings(remoteJid);
    settings.goodbye.message = message;
    settings.goodbye.enabled = true;
    saveGroupSettings(remoteJid, settings);

    return `✅ Goodbye message updated!

*Preview:*
${message.replace("@user", "@leavingmember")}`;
}

/**
 * !antilink on/off/kick/warn - Toggle anti-link protection
 */
export async function antilink(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to manage antilink.`;
    }

    const settings = loadGroupSettings(remoteJid);
    const action = args[0]?.toLowerCase();

    if (action === "on" || action === "warn") {
        settings.antilink.enabled = true;
        settings.antilink.action = "warn";
        saveGroupSettings(remoteJid, settings);
        return `╔══════════════════════════════════╗
║  🔗 *𝔸ℕ𝕋𝕀𝕃𝕀ℕ𝕂 - 𝕎𝔸ℝℕ* 🔗  ║
╚══════════════════════════════════╝

Anti-link is now *ON* (Warn mode)

Links will be deleted and user will be warned.`;
    }

    if (action === "kick") {
        settings.antilink.enabled = true;
        settings.antilink.action = "kick";
        saveGroupSettings(remoteJid, settings);
        return `╔══════════════════════════════════╗
║  🔗 *𝔸ℕ𝕋𝕀𝕃𝕀ℕ𝕂 - 𝕂𝕀ℂ𝕂* 🔗  ║
╚══════════════════════════════════╝

Anti-link is now *ON* (Kick mode)

Links will be deleted and user will be removed!`;
    }

    if (action === "off") {
        settings.antilink.enabled = false;
        saveGroupSettings(remoteJid, settings);
        return `╔══════════════════════════════════╗
║  ❌ *𝔸ℕ𝕋𝕀𝕃𝕀ℕ𝕂 𝔻𝕀𝕊𝔸𝔹𝕃𝔼𝔻* ❌  ║
╚══════════════════════════════════╝

Members can now share links freely.`;
    }

    const config = getCachedConfig();
    const p = config.prefix || "!";
    return `╔══════════════════════════════════╗
║  🔗 *𝔸ℕ𝕋𝕀𝕃𝕀ℕ𝕂 𝕊𝕐𝕊𝕋𝔼𝕄* 🔗  ║
╚══════════════════════════════════╝

*Status:* ${settings.antilink.enabled ? `✅ Enabled (${settings.antilink.action})` : "❌ Disabled"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Commands:*
• ${p}antilink on - Enable (warn mode)
• ${p}antilink kick - Enable (kick mode)
• ${p}antilink off - Disable

🛡️ Protects group from spam links!`;
}

/**
 * !poll <question> | <option1> | <option2> ... - Create a poll
 */
export async function poll(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    const fullText = args.join(" ");
    const parts = fullText.split("|").map(p => p.trim());

    if (parts.length < 3) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `╔══════════════════════════════════╗
║  📊 *ℂℝ𝔼𝔸𝕋𝔼 ℙ𝕆𝕃𝕃* 📊  ║
╚══════════════════════════════════╝

*Usage:* ${p}poll Question | Option1 | Option2 | ...

*Example:*
${p}poll Best programming language? | JavaScript | Python | Rust

You need at least 2 options!`;
    }

    const question = parts[0];
    const options = parts.slice(1);

    try {
        await sock.sendMessage(remoteJid, {
            poll: {
                name: question,
                values: options,
                selectableCount: 1
            }
        });
        return null;
    } catch (err) {
        return `❌ Failed to create poll: ${err.message}`;
    }
}

/**
 * !warn @user - Warn a user (3 warns = kick)
 */
const warnCounts = new Map();

export async function warn(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    if (!await isBotAdmin(sock, remoteJid)) {
        return `⚠️ Bot must be an admin to warn members.`;
    }

    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned || quoted;

    if (!target) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `╔══════════════════════════════════╗
║  ⚠️ *𝕎𝔸ℝℕ 𝕌𝕊𝔼ℝ* ⚠️  ║
╚══════════════════════════════════╝

*Usage:* ${p}warn @user
*Alt:* Reply to a message with ${p}warn

3 warnings = automatic kick!`;
    }

    const key = `${remoteJid}_${target}`;
    const currentWarns = (warnCounts.get(key) || 0) + 1;
    warnCounts.set(key, currentWarns);

    const number = target.split("@")[0];

    if (currentWarns >= 3) {
        try {
            await sock.groupParticipantsUpdate(remoteJid, [target], "remove");
            warnCounts.delete(key);
            return `╔══════════════════════════════════╗
║  🚫 *𝕌𝕊𝔼ℝ 𝕂𝕀ℂ𝕂𝔼𝔻* 🚫  ║
╚══════════════════════════════════╝

@${number} has been removed after 3 warnings!`;
        } catch (err) {
            return `❌ Failed to kick: ${err.message}`;
        }
    }

    return `╔══════════════════════════════════╗
║  ⚠️ *𝕎𝔸ℝℕ𝕀ℕ𝔾* ⚠️  ║
╚══════════════════════════════════╝

@${number} has been warned!

⚠️ *Warnings:* ${currentWarns}/3

${currentWarns === 2 ? "🚨 *Next warning will result in a kick!*" : ""}`;
}

/**
 * !resetwarn @user - Reset warnings for a user
 */
export async function resetwarn(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `⚠️ This command only works in groups.`;
    }

    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned || quoted;

    if (!target) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        return `*Usage:* ${p}resetwarn @user`;
    }

    const key = `${remoteJid}_${target}`;
    warnCounts.delete(key);
    const number = target.split("@")[0];

    return `✅ Warnings reset for @${number}`;
}

/**
 * !bot on/off - Toggle bot functionality in the group
 */
export async function botToggle(sock, m, args) {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) return `⚠️ This only works in groups.`;

    const status = args[0]?.toLowerCase();
    const settings = loadGroupSettings(remoteJid);
    const config = getCachedConfig();
    const p = config.prefix || "!";

    if (status === "on") {
        settings.botEnabled = true;
        saveGroupSettings(remoteJid, settings);
        return `✅ *Bot Enabled:* MARCO MALIK & WAQAR WRITES is now active in this group.`;
    } else if (status === "off") {
        settings.botEnabled = false;
        saveGroupSettings(remoteJid, settings);
        return `📴 *Bot Disabled:* MARCO MALIK & WAQAR WRITES will no longer respond to commands in this group (except ${p}bot on).`;
    }

    return `*Status:* ${settings.botEnabled ? "✅ Active" : "📴 Inactive"}\n\n*Usage:* ${p}bot on/off`;
}

/**
 * !rejoin <group_jid> - Rejoin a group using saved invite code
 */
export async function rejoin(sock, m, args) {
    const targetJid = args[0];

    if (!targetJid) {
        return `╔══════════════════════════════════╗
║  🔄 *ℝ𝔼𝕁𝕆𝕀ℕ 𝔾ℝ𝕆𝕌ℙ* 🔄  ║
╚════════════════════╚════════════╝

*Usage:* !rejoin <group_id>

*How to find ID:* Check the bot logs or use !groupinfo while in the group.`;
    }

    const inviteCode = getInviteCode(targetJid);

    if (!inviteCode) {
        return `❌ *Invite Code Not Found*

I can only rejoin if:
1. I was an *Admin* when I left.
2. I successfully saved the invite link.
3. The link hasn't been revoked.

You might need to add me manually.`;
    }

    try {
        await sock.groupAcceptInvite(inviteCode);
        return `✅ Successfully rejoined the group!`;
    } catch (err) {
        console.error("Rejoin Error:", err);
        return `❌ *Failed to Rejoin*

*Reason:* ${err.message.includes("403") ? "Bot is banned or link revoked" : err.message}`;
    }
}

/**
 * !groupantidelete on/off - Toggle anti-delete for this group
 */
export async function groupantidelete(sock, m, args) {
    const remoteJid = m.key.remoteJid;

    if (!remoteJid.endsWith("@g.us")) {
        return `╔══════════════════════════════════╗
║  ⚠️ *𝔾ℝ𝕆𝕌ℙ 𝕆ℕ𝕃𝕐* ⚠️  ║
╚══════════════════════════════════╝

This command only works in groups.
Use *!antidelete* for personal chats.`;
    }

    const settings = loadGroupSettings(remoteJid);
    const action = args[0]?.toLowerCase();

    if (action === "on") {
        settings.groupAntiDelete = { enabled: true };
        saveGroupSettings(remoteJid, settings);
        return `╔══════════════════════════════════╗
║  ✅ *𝔾ℝ𝕆𝕌ℙ 𝔸ℕ𝕋𝕀-𝔻𝔼𝕃𝔼𝕋𝔼 𝔼ℕ𝔸𝔹𝕃𝔼𝔻* ✅  ║
╚══════════════════════════════════╝

Deleted messages in this group will now be restored!

⚠️ *Note:* Bot owner's own deleted messages are always excluded.`;
    }

    if (action === "off") {
        settings.groupAntiDelete = { enabled: false };
        saveGroupSettings(remoteJid, settings);
        return `╔══════════════════════════════════╗
║  ❌ *𝔾ℝ𝕆𝕌ℙ 𝔸ℕ𝕋𝕀-𝔻𝔼𝕃𝔼𝕋𝔼 𝔻𝕀𝕊𝔸𝔹𝕃𝔼𝔻* ❌  ║
╚══════════════════════════════════╝

Deleted messages in this group will no longer be restored.`;
    }

    return `╔══════════════════════════════════╗
║  🛡️ *𝔾ℝ𝕆𝕌ℙ 𝔸ℕ𝕋𝕀-𝔻𝔼𝕃𝔼𝕋𝔼* 🛡️  ║
╚══════════════════════════════════╝

*Status:* ${settings.groupAntiDelete?.enabled ? "✅ Enabled" : "❌ Disabled"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Commands:*
• !groupantidelete on - Enable
• !groupantidelete off - Disable

💡 Use *!antidelete* for personal chats.
🛡️ Restores deleted messages from other members!`;
}
