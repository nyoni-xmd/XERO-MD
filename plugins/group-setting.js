const config = require('../config');
const { cmd } = require('../command');  // ✅ Changed to XERO-MD command handler

// ==================== KICK COMMAND ====================
cmd({
  pattern: "kick",
  alias: ["k", "remove", "nital"],
  desc: "Remove a user from the group",
  category: "group",
  react: "💀",
  filename: __filename
}, async (conn, mek, m, {
  from,
  isCreator,
  isBotAdmins,
  isGroup,
  quoted,
  reply,
  botNumber
}) => {
  try {
    if (!isGroup) return reply("⚠️ This command only works in groups.");
    if (!isBotAdmins) return reply("❌ I must be admin to remove someone.");
    if (!isCreator) return reply("🔐 Only bot owner can use this command.");

    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return reply("❓ You did not give me a user to remove!");
    }

    let users = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : null;

    if (!users) return reply("⚠️ Couldn't determine target user.");

    if (users === botNumber) return reply("🤖 I can't kick myself!");
    const ownerJid = conn.user.id.split(":")[0] + '@s.whatsapp.net';
    if (users === ownerJid) return reply("👑 That's the owner! I can't remove them.");

    await conn.groupParticipantsUpdate(from, [users], "remove");
    reply(`*✅ Successfully removed from group.*`, { mentions: [users] });
  } catch (err) {
    console.error(err);
    reply("❌ Failed to remove user. Something went wrong.");
  }
});

// ==================== PROMOTE COMMAND ====================
cmd({
  pattern: "promote",
  alias: ["p", "giveadmin", "makeadmin"],
  desc: "Promote a user to admin",
  category: "group",
  react: "💀",
  filename: __filename
}, async (conn, mek, m, {
  from,
  isCreator,
  isBotAdmins,
  isAdmins,
  isGroup,
  quoted,
  reply,
  botNumber
}) => {
  try {
    if (!isGroup) return reply("⚠️ This command only works in groups.");
    if (!isBotAdmins) return reply("❌ I must be admin to promote someone.");
    if (!isAdmins && !isCreator) return reply("🔐 Only group admins or owner can use this command.");

    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return reply("❓ You did not give me a user to promote!");
    }

    let users = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : null;

    if (!users) return reply("⚠️ Couldn't determine target user.");

    if (users === botNumber) return reply("🤖 I can't promote myself!");
    const ownerJid = conn.user.id.split(":")[0] + '@s.whatsapp.net';
    if (users === ownerJid) return reply("👑 Owner is already super admin!");

    await conn.groupParticipantsUpdate(from, [users], "promote");
    reply(`*✅ Successfully Promoted to Admin.*`, { mentions: [users] });
  } catch (err) {
    console.error(err);
    reply("❌ Failed to promote. Something went wrong.");
  }
});

// ==================== DEMOTE COMMAND ====================
cmd({
  pattern: "demote",
  alias: ["d", "dismiss", "removeadmin"],
  desc: "Demote a group admin",
  category: "group",
  react: "💀",
  filename: __filename
}, async (conn, mek, m, {
  from,
  isCreator,
  isBotAdmins,
  isAdmins,
  isGroup,
  quoted,
  reply,
  botNumber
}) => {
  try {
    if (!isGroup) return reply("⚠️ This command only works in groups.");
    if (!isBotAdmins) return reply("❌ I must be admin to demote someone.");
    if (!isAdmins && !isCreator) return reply("🔐 Only group admins or owner can use this command.");

    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return reply("❓ You did not give me a user to demote!");
    }

    let users = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : null;

    if (!users) return reply("⚠️ Couldn't determine target user.");

    if (users === botNumber) return reply("🤖 I can't demote myself!");
    const ownerJid = conn.user.id.split(":")[0] + '@s.whatsapp.net';
    if (users === ownerJid) return reply("👑 I can't demote the owner!");

    await conn.groupParticipantsUpdate(from, [users], "demote");
    reply(`*✅ Admin Successfully demoted to a normal member.*`, { mentions: [users] });
  } catch (err) {
    console.error(err);
    reply("❌ Failed to demote. Something went wrong.");
  }
});

// ==================== HIDETAG (tag all with custom message/media) ====================
cmd({
  pattern: "hidetag",
  alias: ["tag", "h"],
  react: "🔊",
  desc: "To Tag all Members for Any Message/Media",
  category: "group",
  use: '.hidetag Hello',
  filename: __filename
}, async (conn, mek, m, {
  from, q, isGroup, isCreator, isAdmins,
  participants, reply
}) => {
  try {
    const isUrl = (url) => {
      return /https?:\/\/(www\.)?[\w\-@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([\w\-@:%_\+.~#?&//=]*)/.test(url);
    };

    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins && !isCreator) return reply("❌ Only group admins can use this command.");

    const mentionAll = { mentions: participants.map(u => u.id) };

    if (!q && !m.quoted) {
      return reply("❌ Please provide a message or reply to a message to tag all members.");
    }

    if (m.quoted) {
      const type = m.quoted.mtype || '';
      if (type === 'extendedTextMessage') {
        return await conn.sendMessage(from, {
          text: m.quoted.text || 'No message content found.',
          ...mentionAll
        }, { quoted: mek });
      }

      if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type)) {
        try {
          const buffer = await m.quoted.download?.();
          if (!buffer) return reply("❌ Failed to download the quoted media.");

          let content;
          switch (type) {
            case "imageMessage":
              content = { image: buffer, caption: m.quoted.text || "📷 Image", ...mentionAll };
              break;
            case "videoMessage":
              content = { video: buffer, caption: m.quoted.text || "🎥 Video", gifPlayback: m.quoted.message?.videoMessage?.gifPlayback || false, ...mentionAll };
              break;
            case "audioMessage":
              content = { audio: buffer, mimetype: "audio/mp4", ptt: m.quoted.message?.audioMessage?.ptt || false, ...mentionAll };
              break;
            case "stickerMessage":
              content = { sticker: buffer, ...mentionAll };
              break;
            case "documentMessage":
              content = { document: buffer, mimetype: m.quoted.message?.documentMessage?.mimetype || "application/octet-stream", fileName: m.quoted.message?.documentMessage?.fileName || "file", caption: m.quoted.text || "", ...mentionAll };
              break;
          }
          if (content) return await conn.sendMessage(from, content, { quoted: mek });
        } catch (e) {
          console.error("Media download/send error:", e);
          return reply("❌ Failed to process the media. Sending as text instead.");
        }
      }
      return await conn.sendMessage(from, { text: m.quoted.text || "📨 Message", ...mentionAll }, { quoted: mek });
    }

    if (q) {
      if (isUrl(q)) {
        return await conn.sendMessage(from, { text: q, ...mentionAll }, { quoted: mek });
      }
      await conn.sendMessage(from, { text: q, ...mentionAll }, { quoted: mek });
    }
  } catch (e) {
    console.error(e);
    reply(`❌ *Error Occurred !!*\n\n${e.message}`);
  }
});

// ==================== KICKALL ====================
cmd({
  pattern: "kickall",
  alias: ["byeall", "end", "endgc"],
  desc: "Removes all members (including admins) from the group except specified numbers",
  category: "admin",
  react: "⚠️",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, reply, groupMetadata, isCreator }) => {
  if (!isGroup) return reply("❌ This command can only be used in groups.");
  if (!isCreator) return reply("❌ Only the *owner* can use this command.");
  if (!isBotAdmins) return reply("❌ I need to be *admin* to use this command.");

  try {
    const ignoreJids = [
      "255763111390@s.whatsapp.net",   // your number
      "255610209120@s.whatsapp.net"    // your second number (optional)
    ];

    const participants = groupMetadata.participants || [];
    const targets = participants.filter(p => !ignoreJids.includes(p.id));
    const jids = targets.map(p => p.id);

    if (jids.length === 0) return reply("✅ No members to remove (everyone is excluded).");

    await conn.groupParticipantsUpdate(from, jids, "remove");
    reply(`✅ Removed ${jids.length} members from the group.`);
  } catch (error) {
    console.error("End command error:", error);
    reply("❌ Failed to remove members. Error: " + error.message);
  }
});

// ==================== ADD COMMAND ====================
cmd({
  pattern: "add",
  alias: ["invite", "addmember", "a", "summon"],
  desc: "Adds a person to group",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, quoted, args, reply, isGroup, isBotAdmins, isCreator }) => {
  try {
    if (!isCreator) return reply("*📛 This is an owner command.*");
    if (!isGroup) return reply("_This command is for groups_");
    if (!isBotAdmins) return reply("_I'm not admin_");
    if (!args[0] && !quoted) return reply("_Mention user to add_");

    let jid = m.mentionedJid?.[0]
      || (m.quoted?.sender ?? null)
      || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

    await conn.groupParticipantsUpdate(from, [jid], "add");
    return reply(`@${jid.split("@")[0]} added`, { mentions: [jid] });
  } catch (e) {
    console.log(e);
    m.reply(`${e}`);
  }
});

// ==================== REQUEST LIST (pending join requests) ====================
cmd({
  pattern: "requestlist",
  desc: "Shows pending group join requests",
  category: "group",
  react: "📋",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
  try {
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins) return reply("❌ Only group admins can use this command.");
    if (!isBotAdmins) return reply("❌ I need to be an admin to view join requests.");

    const requests = await conn.groupRequestParticipantsList(from);
    if (requests.length === 0) {
      await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
      return reply("ℹ️ No pending join requests.");
    }

    let text = `📋 *Pending Join Requests (${requests.length})*\n\n`;
    requests.forEach((user, i) => {
      text += `${i+1}. @${user.jid.split('@')[0]}\n`;
    });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    return reply(text, { mentions: requests.map(u => u.jid) });
  } catch (error) {
    console.error("Request list error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    return reply("❌ Failed to fetch join requests.");
  }
});

// ==================== ACCEPT ALL PENDING REQUESTS ====================
cmd({
  pattern: "acceptall",
  desc: "Accepts all pending group join requests",
  category: "group",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
  try {
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins) return reply("❌ Only group admins can use this command.");
    if (!isBotAdmins) return reply("❌ I need to be an admin to accept join requests.");

    const requests = await conn.groupRequestParticipantsList(from);
    if (requests.length === 0) {
      await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
      return reply("ℹ️ No pending join requests to accept.");
    }

    const jids = requests.map(u => u.jid);
    await conn.groupRequestParticipantsUpdate(from, jids, "approve");

    await conn.sendMessage(from, { react: { text: '👍', key: m.key } });
    return reply(`✅ Successfully accepted ${requests.length} join requests.`);
  } catch (error) {
    console.error("Accept all error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    return reply("❌ Failed to accept join requests.");
  }
});

// ==================== REJECT ALL PENDING REQUESTS ====================
cmd({
  pattern: "rejectall",
  desc: "Rejects all pending group join requests",
  category: "group",
  react: "❌",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
  try {
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins) return reply("❌ Only group admins can use this command.");
    if (!isBotAdmins) return reply("❌ I need to be an admin to reject join requests.");

    const requests = await conn.groupRequestParticipantsList(from);
    if (requests.length === 0) {
      await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
      return reply("ℹ️ No pending join requests to reject.");
    }

    const jids = requests.map(u => u.jid);
    await conn.groupRequestParticipantsUpdate(from, jids, "reject");

    await conn.sendMessage(from, { react: { text: '👎', key: m.key } });
    return reply(`✅ Successfully rejected ${requests.length} join requests.`);
  } catch (error) {
    console.error("Reject all error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    return reply("❌ Failed to reject join requests.");
  }
});
