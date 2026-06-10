const fs = require("fs");
const config = require("../config");
const { cmd, commands } = require("../command");  
const path = require('path');
const axios = require("axios");
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// ---------- Privacy Menu ----------
cmd({
    pattern: "privacymenu",
    alias: ["privacy"],
    desc: "Privacy settings menu",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
    if (!isCreator) return reply("❌ *Access Denied!*\nOwner only.");
    try {
        let privacyMenu = `╭━━〔 *Privacy Settings* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• blocklist - View blocked users
┃◈┃• getbio - Get user's bio
┃◈┃• setppall - Set profile pic privacy
┃◈┃• setonline - Set online privacy
┃◈┃• setpp - Change bot's profile pic
┃◈┃• setmyname - Change bot's name
┃◈┃• updatebio - Change bot's bio
┃◈┃• groupsprivacy - Set group add privacy
┃◈┃• getprivacy - View current privacy settings
┃◈┃• getpp - Get user's profile picture
┃◈┃
┃◈┃*Options for privacy commands:*
┃◈┃• all - Everyone
┃◈┃• contacts - My contacts only
┃◈┃• contact_blacklist - Contacts except blocked
┃◈┃• none - Nobody
┃◈┃• match_last_seen - Match last seen
┃◈└───────────┈⊷
╰──────────────┈⊷
*Note:* Most commands are owner-only`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/gyaka2.png" }, // XERO-MD image
            caption: privacyMenu,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363399470975987@newsletter", // new newsletter
                    newsletterName: "XERO-MD",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});

// ---------- Blocklist ----------
cmd({
    pattern: "blocklist",
    desc: "View the list of blocked users.",
    category: "privacy",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 You are not the owner!*");
    try {
        const blockedUsers = await conn.fetchBlocklist();
        if (blockedUsers.length === 0) return reply("📋 Your block list is empty.");
        const list = blockedUsers.map((user, i) => `🚧 BLOCKED ${user.split('@')[0]}`).join('\n');
        const count = blockedUsers.length;
        reply(`📋 Blocked Users (${count}):\n\n${list}`);
    } catch (err) {
        console.error(err);
        reply(`❌ Failed to fetch block list: ${err.message}`);
    }
});

// ---------- Get Bio ----------
cmd({
    pattern: "getbio",
    desc: "Displays the user's bio.",
    category: "privacy",
    filename: __filename,
}, async (conn, mek, m, { args, reply, isCreator }) => {
    if (!isCreator) return reply("❌ Owner only.");
    try {
        const jid = args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : mek.key.remoteJid;
        const about = await conn.fetchStatus(jid);
        if (!about) return reply("No bio found.");
        return reply(`📝 *Bio for ${jid.split('@')[0]}*\n\n${about.status}`);
    } catch (error) {
        console.error(error);
        reply("No bio found or user unavailable.");
    }
});

// ---------- Set Profile Picture Privacy ----------
cmd({
    pattern: "setppall",
    desc: "Update Profile Picture Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { args, reply, isCreator }) => {
    if (!isCreator) return reply("❌ Owner only!");
    try {
        const value = args[0] || 'all';
        const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
        if (!validValues.includes(value)) return reply("❌ Invalid option. Valid: all, contacts, contact_blacklist, none.");
        await conn.updateProfilePicturePrivacy(value);
        reply(`✅ Profile picture privacy updated to: ${value}`);
    } catch (e) {
        return reply(`*Error:* ${e.message}`);
    }
});

// ---------- Set Online Privacy ----------
cmd({
    pattern: "setonline",
    desc: "Update Online Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { args, reply, isCreator }) => {
    if (!isCreator) return reply("❌ Owner only!");
    try {
        const value = args[0] || 'all';
        const validValues = ['all', 'match_last_seen'];
        if (!validValues.includes(value)) return reply("❌ Invalid option. Valid: all, match_last_seen.");
        await conn.updateOnlinePrivacy(value);
        reply(`✅ Online privacy updated to: ${value}`);
    } catch (e) {
        return reply(`*Error:* ${e.message}`);
    }
});

// ---------- Set Bot Profile Picture ----------
cmd({
    pattern: "setpp",
    desc: "Set bot profile picture.",
    category: "privacy",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, quoted, reply }) => {
    if (!isCreator) return reply("❌ Owner only!");
    if (!quoted || !quoted.message?.imageMessage) return reply("❌ Reply to an image.");
    try {
        const stream = await downloadContentFromMessage(quoted.message.imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        const mediaPath = path.join(__dirname, `${Date.now()}.jpg`);
        fs.writeFileSync(mediaPath, buffer);
        await conn.updateProfilePicture(conn.user.jid, { url: mediaPath });
        fs.unlinkSync(mediaPath);
        reply("🖼️ Profile picture updated successfully!");
    } catch (error) {
        console.error(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ---------- Set Bot Display Name ----------
cmd({
    pattern: "setmyname",
    desc: "Set bot's WhatsApp display name.",
    category: "privacy",
    react: "⚙️",
    filename: __filename
}, async (conn, mek, m, { args, reply, isCreator }) => {
    if (!isCreator) return reply("❌ Owner only!");
    const displayName = args.join(" ");
    if (!displayName) return reply("❌ Provide a display name.");
    try {
        await conn.updateProfileName(displayName);
        reply(`✅ Bot name set to: ${displayName}`);
    } catch (err) {
        console.error(err);
        reply("❌ Failed to set display name.");
    }
});

// ---------- Update Bio ----------
cmd({
    pattern: "updatebio",
    react: "🥏",
    desc: "Change bot's bio.",
    category: "privacy",
    use: '.updatebio <new bio>',
    filename: __filename
}, async (conn, mek, m, { q, reply, isCreator }) => {
    if (!isCreator) return reply('🚫 Owner only.');
    if (!q) return reply('❓ Enter the new bio.');
    if (q.length > 139) return reply('❗ Character limit exceeded (max 139).');
    try {
        await conn.updateProfileStatus(q);
        reply("✔️ New bio added successfully.");
    } catch (e) {
        reply('🚫 Error: ' + e.message);
    }
});

// ---------- Groups Add Privacy ----------
cmd({
    pattern: "groupsprivacy",
    desc: "Update Group Add Privacy",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { args, reply, isCreator }) => {
    if (!isCreator) return reply("❌ Owner only!");
    try {
        const value = args[0] || 'all';
        const validValues = ['all', 'contacts', 'contact_blacklist', 'none'];
        if (!validValues.includes(value)) return reply("❌ Invalid option. Valid: all, contacts, contact_blacklist, none.");
        await conn.updateGroupsAddPrivacy(value);
        reply(`✅ Group add privacy updated to: ${value}`);
    } catch (e) {
        return reply(`*Error:* ${e.message}`);
    }
});

// ---------- Get Privacy Settings ----------
cmd({
    pattern: "getprivacy",
    desc: "Get bot's privacy settings.",
    category: "privacy",
    use: '.getprivacy',
    filename: __filename
}, async (conn, mek, m, { reply, isCreator }) => {
    if (!isCreator) return reply('🚫 Owner only.');
    try {
        const duka = await conn.fetchPrivacySettings?.();
        if (!duka) return reply('🚫 Failed to fetch privacy settings.');
        let puka = `
╭───「 PRIVACY 」───◆  
│ ∘ Read Receipts: ${duka.readreceipts}  
│ ∘ Profile Picture: ${duka.profile}  
│ ∘ Status: ${duka.status}  
│ ∘ Online: ${duka.online}  
│ ∘ Last Seen: ${duka.last}  
│ ∘ Group Add: ${duka.groupadd}  
│ ∘ Call Add: ${duka.calladd}  
╰────────────────────`;
        await reply(puka);
    } catch (e) {
        reply('🚫 Error: ' + e.message);
    }
});

// ---------- Get Profile Picture of any user ----------
cmd({
    pattern: "getpp",
    alias: ["stealpp"],
    react: "🖼️",
    desc: "Get profile picture of a user by phone number (owner only)",
    category: "owner",
    use: ".getpp <phone number>",
    filename: __filename
}, async (conn, mek, m, { args, reply, isCreator }) => {
    if (!isCreator) return reply("❌ Owner only.");
    if (!args[0]) return reply("Provide a phone number (e.g., 255763111390).");
    try {
        let targetJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(targetJid, "image");
        } catch {
            return reply("This user has no profile picture or it cannot be accessed.");
        }
        let userName = targetJid.split('@')[0];
        try {
            const contact = await conn.getContact(targetJid);
            userName = contact.notify || contact.vname || userName;
        } catch {}
        await conn.sendMessage(m.chat, { image: { url: ppUrl }, caption: `> Profile Pic of *${userName}*` });
        await conn.sendMessage(m.chat, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        reply("An error occurred.");
        console.error(e);
    }
});
