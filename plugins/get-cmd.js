const { cmd, commands } = require('../command');  // ✅ XERO‑MD command system
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Owner numbers – you can use isCreator, but we'll also keep JID check
const ownerNumbers = ['255763111390', '255610209120'];

cmd({
    pattern: "get",
    alias: ["source", "js"],
    desc: "Fetch the full source code of a command",
    category: "owner",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender, isCreator }) => {
    try {
        // Restrict to bot owner(s)
        const senderNumber = sender.split('@')[0];
        if (!ownerNumbers.includes(senderNumber) && !isCreator) {
            return reply("❌ Access Denied! This command is for the bot owner only.");
        }

        if (!args[0]) return reply("❌ Please provide a command name. Example: `.get menu`");

        const commandName = args[0].toLowerCase();
        
        // commands is an array from command.js (global.commandsArray)
        const commandData = commands.find(cmd => 
            cmd.command === commandName || 
            (cmd.alias && cmd.alias.includes(commandName))
        );

        if (!commandData) return reply("❌ Command not found!");

        const commandPath = commandData.filename;
        const fullCode = fs.readFileSync(commandPath, 'utf-8');

        // WhatsApp caption limit ~ 4096 characters
        let truncatedCode = fullCode;
        if (truncatedCode.length > 3900) {
            truncatedCode = fullCode.substring(0, 3900) + "\n\n// Code too long, full file attached 📂";
        }

        const formattedCode = `⬤───〔 *📜 Command Source* 〕───⬤
\`\`\`js
${truncatedCode}
\`\`\`
╰──────────⊷  
⚡ *XERO-MD* | Full file sent below`;

        // Send image preview (XERO‑MD image)
        await conn.sendMessage(from, { 
            image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/gyaka2.png" },
            caption: formattedCode,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363399470975987@newsletter",
                    newsletterName: "XERO-MD",
                    serverMessageId: Math.floor(Math.random() * 1000)
                }
            }
        }, { quoted: mek });

        // Send the full .js file as a document
        const fileName = `${commandName}.js`;
        const tempPath = path.join(__dirname, fileName);
        fs.writeFileSync(tempPath, fullCode);

        await conn.sendMessage(from, { 
            document: fs.readFileSync(tempPath),
            mimetype: 'text/javascript',
            fileName: fileName
        }, { quoted: mek });

        fs.unlinkSync(tempPath);

    } catch (e) {
        console.error("Error in .get command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
