// plugins/pp.js - XERO-MD Profile Picture Stealer
global.registerCommand({
    command: "pp",
    alias: ["getpp", "stealpp", "profilepic"],
    desc: "Download profile picture of a user (reply to their message)",
    category: "tools",
    function: async (conn, m, { from, reply, quoted, args, isGroup, sender }) => {
        try {
            // Determine target JID
            let targetJid = null;

            // If user replied to a message, get sender of that message
            if (quoted) {
                targetJid = quoted.sender || quoted.key?.participant || quoted.key?.remoteJid;
            } 
            // If user mentioned someone
            else if (m.mentionedJid && m.mentionedJid[0]) {
                targetJid = m.mentionedJid[0];
            }
            // If user provided a phone number as argument
            else if (args[0]) {
                const number = args[0].replace(/[^0-9]/g, '');
                if (number.length >= 9) {
                    targetJid = number + '@s.whatsapp.net';
                }
            }
            // If in group and no target, use the sender themselves
            else if (isGroup) {
                targetJid = sender;
            } else {
                // In DM, use the other participant
                targetJid = sender;
            }

            if (!targetJid) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *PROFILE PICTURE STEALER*
┊•
┊• 💡 *Usage* :
┊•   Reply to user's message with .pp
┊•   .pp @mention (in group)
┊•   .pp 255712345678 (phone number)
┊•
┊• 📌 *Example* :
┊•   Reply to a message → .pp
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            // Fetch profile picture
            let ppUrl;
            try {
                ppUrl = await conn.profilePictureUrl(targetJid, 'image');
            } catch (error) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *No profile picture found!*
┊• 👤 *User* : @${targetJid.split('@')[0]}
┊• 💡 This user has not set a profile picture
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`, { mentions: [targetJid] });
            }

            // Get user's display name (if available)
            let userName = targetJid.split('@')[0];
            try {
                const contact = await conn.getContact(targetJid);
                if (contact.notify) userName = contact.notify;
                else if (contact.vname) userName = contact.vname;
            } catch (e) {}

            // Send profile picture
            await conn.sendMessage(from, {
                image: { url: ppUrl },
                caption: `╭┈┈❍ *XERO-MD* ❍
┊• 📸 *Profile Picture*
┊•
┊• 👤 *User* : @${targetJid.split('@')[0]} ${userName !== targetJid.split('@')[0] ? `(${userName})` : ''}
┊• 🔗 *Downloaded* : Successfully
┊• ⏰ *Time* : ${new Date().toLocaleString()}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (error) {
            console.error("PP Command Error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Error fetching profile picture!*
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
