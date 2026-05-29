

const { cmd } = require("../command");

// Command: biblelist
cmd({
    pattern: "biblelist",
    alias: ["biblebooks", "listbible", "blist"], // Ajout des alias
    desc: "Get the complete list of books in the Bible.",
    category: "fun",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        // Liste des livres de la Bible
        const bibleList = `│1. *ɢᴇɴᴇsɪs*
│2. *ᴇxᴏᴅᴜs*
│3. *ʟᴇᴠɪᴛɪᴄᴜs*
│4. *ɴᴜᴍʙᴇʀs*
│5. *ᴅᴇᴜᴛᴇʀᴏɴᴏᴍʏ*
│6. *ᴊᴏsʜᴜᴀ*
│7. *ᴊᴜᴅɢᴇs*
│8. *ʀᴜᴛʜ*
│9. *sᴀᴍᴜᴇʟ*
╰────────────────❃
╭─ 「 *\`BIBLE LIST2\`* 」
│📖 *ɴᴇᴡ ᴛᴇsᴛᴀᴍᴇɴᴛ*:
│1. *ᴍᴀᴛᴛʜᴇᴡ*
│2. *ᴍᴀʀᴋ*
│3. *ʟᴜᴋᴇ*
│4. *ᴊᴏʜɴ*
│5. *ᴀᴄᴛs*
│6. *ʀᴏᴍᴀɴs*
│7. *ᴄᴏʀɪɴᴛʜɪᴀɴs*
│8. *ɢᴀʟᴀᴛɪᴀɴs*
│9. *ᴇᴘʜᴇsɪᴀɴs*
╰────────────────❃
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘʀɪɴᴄᴇ xᴛʀᴇᴍᴇ*🍀
`;

        // Remplacer ce lien par l'URL de l'image que tu m'enverras
        const imageUrl = "https://files.catbox.moe/muf64d.jpg"; // Remplace "TON_LIEN_IMAGE_ICI" par ton lien d'image

        // Vérifier si le message de la commande est correctement reçu
        if (!m.chat) {
            return reply("❌ *An error occurred: Invalid chat.*");
        }

        // Envoi de la réponse avec l'image et la liste des livres de la Bible
        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: `╭─ 「 *\`BIBLE LIST1\`* 」\n` +
                     `│📜 *ᴏʟᴅ ᴛᴇsᴛᴀᴍᴇɴᴛ*:\n` +
                     bibleList.trim() // Ajout du texte des livres de la Bible
        }, { quoted: mek });
    } catch (error) {
        console.error(error);
        reply("❌ *An error occurred while fetching the Bible list. Please try again.*");
    }
});
