const { cmd, commands } = require('../command');  
const { exec } = require('child_process');
const config = require('../config');
const { sleep } = require('../lib/functions');

// 1. Shutdown Bot
cmd({
    pattern: "shutdown",
    desc: "Shutdown the bot.",
    category: "owner",
    react: "🛑",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ Owner only!");
    await reply("🛑 Shutting down...");
    process.exit(0);
});

// 2. Broadcast Message to All Groups (with newsletter style)
cmd({
    pattern: "broadcast",
    desc: "Broadcast a message to all groups.",
    category: "owner",
    react: "📢",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ Owner only!");
    if (args.length === 0) return reply("📢 Provide a message to broadcast.");
    const message = args.join(' ');
    const groups = await conn.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);
    let successCount = 0;
    for (const groupId of groupIds) {
        try {
            await conn.sendMessage(groupId, {
                text: message,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363399470975987@newsletter",
                        newsletterName: "XERO-MD",
                        serverMessageId: Math.floor(Math.random() * 1000)
                    }
                }
            });
            successCount++;
            await sleep(500);
        } catch (e) { console.error(`Failed to send to ${groupId}:`, e.message); }
    }
    reply(`📢 Broadcast sent to ${successCount} out of ${groupIds.length} groups.`);
});

// 3. Set Profile Picture (fixed download)
cmd({
    pattern: "setpp",
    desc: "Set bot profile picture.",
    category: "owner",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ Owner only!");
    if (!quoted || !quoted.message?.imageMessage) return reply("❌ Reply to an image.");
    try {
        const media = await conn.downloadMediaMessage(quoted.message.imageMessage);
        await conn.updateProfilePicture(conn.user.jid, media);
        reply("🖼️ Profile picture updated successfully!");
    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});

// 4. Clear All Chats
cmd({
    pattern: "clearchats",
    desc: "Clear all chats from the bot.",
    category: "owner",
    react: "🧹",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ Owner only!");
    try {
        // Use newer method if available, otherwise fallback
        if (conn.chats && typeof conn.chats.all === 'function') {
            const chats = conn.chats.all();
            for (const chat of chats) {
                await conn.modifyChat(chat.jid, 'delete').catch(() => {});
            }
        } else {
            // Fallback: send delete request to each chat individually (more complex, skip for brevity)
            reply("⚠️ This feature may not be fully supported in this Baileys version.");
            return;
        }
        reply("🧹 All chats cleared successfully!");
    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});

// 5. Get Group JIDs
cmd({
    pattern: "gjid",
    desc: "Get list of JIDs for all groups the bot is in.",
    category: "owner",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ Owner only!");
    const groups = await conn.groupFetchAllParticipating();
    const groupJids = Object.keys(groups);
    if (groupJids.length === 0) return reply("No groups found.");
    const list = groupJids.map((jid, i) => `${i+1}. ${jid}`).join('\n');
    reply(`📝 *Group JIDs (${groupJids.length}):*\n\n${list}`);
});

// 6. Delete Message (Fixed)
cmd({
    pattern: "delete",
    react: "❌",
    alias: ["del"],
    desc: "Delete a quoted message (admin/owner only)",
    category: "group",
    use: '.del (reply to a message)',
    filename: __filename
}, async (conn, mek, m, { from, isOwner, isAdmins, reply, quoted }) => {
    // Allow owner or group admin
    if (!isOwner && !isAdmins) return reply("❌ Only owner or group admin can delete messages.");
    if (!quoted) return reply("❌ Reply to the message you want to delete.");
    try {
        const key = {
            remoteJid: from,
            fromMe: false,
            id: quoted.key.id,
            participant: quoted.key.participant || quoted.key.remoteJid
        };
        await conn.sendMessage(from, { delete: key });
        reply("✅ Message deleted.");
    } catch (e) {
        console.error(e);
        reply("❌ Failed to delete message. Ensure bot is admin (if in group).");
    }
});
