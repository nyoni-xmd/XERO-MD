
// plugins/sn.js - XERO-MD Save Contact Name
const { saveContact, getContact, getAllContacts, deleteContact } = require('../data/contacts');

global.registerCommand({
    command: "sn",
    alias: ["savename", "savecontact", "save"],
    desc: "Save a contact with a custom name (reply to their message)",
    category: "tools",
    function: async (conn, m, { from, reply, quoted, args, sender, isOwner }) => {
        try {
            // Check if replying to a message
            if (!quoted) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *SAVE CONTACT COMMAND*
┊•
┊• 💡 *Usage* :
┊•   Reply to user's message with .sn [name]
┊•
┊• 📌 *Examples* :
┊•   Reply to message → .sn Mama
┊•   Reply to message → .sn Dada Mariam
┊•
┊• 🔧 *Other commands* :
┊•   .snlist - Show all saved contacts
┊•   .sndelete @user - Delete a contact
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            // Get target JID from quoted message
            let targetJid = quoted.sender || quoted.key?.participant || quoted.key?.remoteJid;
            
            if (!targetJid) {
                return reply("❌ Could not identify the user you replied to.");
            }

            // Check if name is provided
            if (!args[0]) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *No name provided!*
┊•
┊• 📝 *Usage* : .sn [name]
┊• 📌 *Example* : .sn Mama
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            const name = args.join(" ");
            const userNumber = targetJid.split('@')[0];

            // Check if contact already exists
            const existing = getContact(targetJid);
            
            // Save contact
            saveContact(targetJid, name);

            const replyMsg = `╭┈┈❍ *XERO-MD* ❍
┊• ✅ *Contact saved successfully!*
┊•
┊• 👤 *Name* : ${name}
┊• 📞 *Number* : ${userNumber}
┊• 📅 *Saved* : ${new Date().toLocaleString()}
┊• 🔄 *Status* : ${existing ? 'Updated' : 'New contact'}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

            await reply(replyMsg, { mentions: [targetJid] });

        } catch (error) {
            console.error("SN Error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Error saving contact!*
┊• 🔧 *Error* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});

// ==================== LIST SAVED CONTACTS ====================
global.registerCommand({
    command: "snlist",
    alias: ["savedcontacts", "contacts", "mylist"],
    desc: "Show all saved contacts",
    category: "tools",
    function: async (conn, m, { from, reply }) => {
        try {
            const contacts = getAllContacts();
            const entries = Object.entries(contacts);

            if (entries.length === 0) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *SAVED CONTACTS*
┊•
┊• 📭 No contacts saved yet!
┊•
┊• 💡 Use .sn [name] to save a contact
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            let listMsg = `╭┈┈❍ *XERO-MD* ❍
┊• 📋 *SAVED CONTACTS*
┊• 👥 *Total* : ${entries.length}
┊•
`;
            entries.forEach(([jid, data], index) => {
                const number = jid.split('@')[0];
                listMsg += `┊• ${index + 1}. *${data.name}* - ${number}\n`;
            });
            listMsg += `╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;

            await reply(listMsg);

        } catch (error) {
            console.error("SNList Error:", error);
            reply(`❌ Error: ${error.message}`);
        }
    }
});

// ==================== DELETE SAVED CONTACT ====================
global.registerCommand({
    command: "sndelete",
    alias: ["delcontact", "removecontact"],
    desc: "Delete a saved contact (reply or tag)",
    category: "tools",
    function: async (conn, m, { from, reply, quoted, args, mentionedJid, isOwner }) => {
        try {
            let targetJid = mentionedJid?.[0] || quoted?.sender || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');

            if (!targetJid) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *No user specified!*
┊•
┊• 📝 *Usage* :
┊•   .sndelete @user
┊•   Reply to user's message with .sndelete
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            const deleted = deleteContact(targetJid);

            if (!deleted) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• ❌ *Contact not found!*
┊• 💡 Use .snlist to see saved contacts
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            const number = targetJid.split('@')[0];
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• ✅ *Contact deleted!*
┊• 📞 *Number* : ${number}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

        } catch (error) {
            console.error("SNDelete Error:", error);
            reply(`❌ Error: ${error.message}`);
        }
    }
});
