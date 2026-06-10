const { cmd, commands } = require('../command'); //
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

cmd({
  pattern: "newgc",
  category: "group",
  desc: "Create a new group and add participants.",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, body, sender, groupMetadata, participants, reply, prefix }) => {
  try {
    if (!body) {
      return reply(`Usage: ${prefix}newgc group_name;number1,number2,...`);
    }

    const [groupName, numbersString] = body.split(";");
    
    if (!groupName || !numbersString) {
      return reply(`Usage: ${prefix}newgc group_name;number1,number2,...`);
    }

    // Clean numbers: remove spaces, ensure format
    const participantNumbers = numbersString.split(",").map(number => {
      let cleaned = number.trim().replace(/[^0-9]/g, '');
      return `${cleaned}@s.whatsapp.net`;
    });

    if (participantNumbers.length === 0) {
      return reply("❌ Please provide at least one phone number.");
    }

    const group = await conn.groupCreate(groupName, participantNumbers);
    
    // Get invite link
    const inviteCode = await conn.groupInviteCode(group.id);
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

    // Optional welcome message
    await conn.sendMessage(group.id, { text: `Welcome to ${groupName}! 🎉\n\nGroup created by XERO-MD` });

    reply(`✅ *Group created successfully!*\n\n📛 *Name:* ${groupName}\n🔗 *Invite Link:* ${inviteLink}\n👥 *Members added:* ${participantNumbers.length}\n\n> XERO-MD`);

  } catch (e) {
    console.error(e);
    return reply(`❌ *Error creating group:*\n${e.message}`);
  }
});
