const fs = require("fs");
const path = require("path");
const { cmd } = require("../command"); // ✅ Changed to XERO-MD command handler

// Path to store temporary owners
const SUDO_PATH = path.join(__dirname, "../assets/sudo.json");

// Ensure the JSON file exists
const ensureSudoFile = () => {
  if (!fs.existsSync(SUDO_PATH)) {
    fs.writeFileSync(SUDO_PATH, JSON.stringify([]));
  }
};

// --------------------------------------------------------------------
// 1. Add a temporary owner (sudo)
// --------------------------------------------------------------------
cmd({
    pattern: "setsudo",
    alias: ["addsudo", "addowner"],
    desc: "Add a temporary owner",
    category: "owner",
    react: "😇",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❌ *Access Denied!*\nOnly the main owner can use this command.");

        // Identify target user (mention, reply, or phone number)
        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target) return reply("❌ Please provide a number or tag/reply to a user.");

        ensureSudoFile();
        let sudoList = JSON.parse(fs.readFileSync(SUDO_PATH, "utf-8"));

        if (sudoList.includes(target)) {
            return reply("⚠️ This user is already a temporary owner.");
        }

        sudoList.push(target);
        const uniqueList = [...new Set(sudoList)];
        fs.writeFileSync(SUDO_PATH, JSON.stringify(uniqueList, null, 2));

        const successMsg = `✅ *Temporary owner added successfully!*\n\n👤 User: ${target.replace("@s.whatsapp.net", "")}`;
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/gyaka2.png" }, // ✅ XERO-MD image
            caption: successMsg
        }, { quoted: mek });
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// --------------------------------------------------------------------
// 2. Remove a temporary owner
// --------------------------------------------------------------------
cmd({
    pattern: "delsudo",
    alias: ["delowner", "deletesudo"],
    desc: "Remove a temporary owner",
    category: "owner",
    react: "🫩",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❌ *Access Denied!*\nOnly the main owner can use this command.");

        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target) return reply("❌ Please provide a number or tag/reply to a user.");

        ensureSudoFile();
        let sudoList = JSON.parse(fs.readFileSync(SUDO_PATH, "utf-8"));

        if (!sudoList.includes(target)) {
            return reply("❌ User not found in the temporary owner list.");
        }

        const updatedList = sudoList.filter(x => x !== target);
        fs.writeFileSync(SUDO_PATH, JSON.stringify(updatedList, null, 2));

        const successMsg = `✅ *Temporary owner removed successfully!*\n\n👤 User: ${target.replace("@s.whatsapp.net", "")}`;
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/gyaka2.png" },
            caption: successMsg
        }, { quoted: mek });
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// --------------------------------------------------------------------
// 3. List all temporary owners
// --------------------------------------------------------------------
cmd({
    pattern: "listsudo",
    alias: ["listowner", "sudolist"],
    desc: "List all temporary owners",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❌ *Access Denied!*\nOnly the main owner can use this command.");

        ensureSudoFile();
        let sudoList = JSON.parse(fs.readFileSync(SUDO_PATH, "utf-8"));
        sudoList = [...new Set(sudoList)];

        if (sudoList.length === 0) {
            return reply("📋 No temporary owners found.");
        }

        let listMessage = "👑 *Temporary Owners List*\n\n";
        sudoList.forEach((owner, i) => {
            listMessage += `${i + 1}. ${owner.replace("@s.whatsapp.net", "")}\n`;
        });

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/gyaka2.png" },
            caption: listMessage
        }, { quoted: mek });
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});
