const fs = require('fs');
const config = require('../config');
const { cmd, commands } = require('../command');  // Badala ya DianaTech
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions');

// Plugin ya kuhifadhi vCard za wanachama wa kundi
cmd({
    pattern: 'savecontact',
    alias: ["vcf", "scontact", "savecontacts"],
    desc: 'Save group participants as vCard',
    category: 'tools',
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command is for groups only.");
        if (!isOwner) return reply("🔒 *Access Denied!*\nOnly bot owner can use this command.");

        if (!groupMetadata || !groupMetadata.participants) {
            return reply("❌ Could not fetch group participants.");
        }

        let members = groupMetadata.participants;
        let vcard = '';
        let count = 0;

        for (let member of members) {
            let jid = member.id;
            let number = jid.split('@')[0];
            vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:${count + 1}. ${number}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD\n`;
            count++;
        }

        let fileName = './XERO-MD_contacts.vcf';
        reply(`📇 Saving ${members.length} participants...`);

        fs.writeFileSync(fileName, vcard.trim());
        await sleep(2000);

        await conn.sendMessage(from, {
            document: fs.readFileSync(fileName),
            mimetype: 'text/vcard',
            fileName: 'XERO-MD_contacts.vcf',
            caption: `✅ *Done saving!*\n\n👥 *Group:* ${groupMetadata.subject}\n📞 *Contacts:* ${members.length}\n\n> *XERO-MD*`
        }, { quoted: mek });

        fs.unlinkSync(fileName);
    } catch (err) {
        console.error(err);
        reply(`❌ Error: ${err.message}`);
    }
});
