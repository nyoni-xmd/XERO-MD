const fs = require("fs");
const path = require("path");
const { cmd } = require("../command"); // ✅ Badala ya DianaTech

// Ensure ban.json exists
const BAN_FILE = path.join(__dirname, "../assets/ban.json");
const ensureBanFile = () => {
  if (!fs.existsSync(BAN_FILE)) {
    fs.writeFileSync(BAN_FILE, JSON.stringify([]));
  }
};

// --------------------------------------------------------------------
// 1. Ban a user
// --------------------------------------------------------------------
cmd({
    pattern: "ban",
    alias: ["blockuser", "addban"],
    desc: "Ban a user from using the bot",
    category: "owner",
    react: "⛔",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❌ *Access Denied!*\nOnly the main owner can use this command.");

        // Identify target user (mention, reply, or phone number)
        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target) return reply("❌ Please provide a number or tag/reply to a user.");

        ensureBanFile();
        let banned = JSON.parse(fs.readFileSync(BAN_FILE, "utf-8"));

        if (banned.includes(target)) {
            return reply("⚠️ This user is already banned.");
        }

        banned.push(target);
        fs.writeFileSync(BAN_FILE, JSON.stringify([...new Set(banned)], null, 2));

        const successMsg = `⛔ *User banned successfully!*\n\n👤 User: ${target.replace("@s.whatsapp.net", "")}\n🔒 They can no longer use the bot.`;
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
// 2. Unban a user
// --------------------------------------------------------------------
cmd({
    pattern: "unban",
    alias: ["removeban"],
    desc: "Unban a user",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❌ *Access Denied!*\nOnly the main owner can use this command.");

        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target) return reply("❌ Please provide a number or tag/reply to a user.");

        ensureBanFile();
        let banned = JSON.parse(fs.readFileSync(BAN_FILE, "utf-8"));

        if (!banned.includes(target)) {
            return reply("❌ This user is not banned.");
        }

        const updated = banned.filter(u => u !== target);
        fs.writeFileSync(BAN_FILE, JSON.stringify(updated, null, 2));

        const successMsg = `✅ *User unbanned successfully!*\n\n👤 User: ${target.replace("@s.whatsapp.net", "")}\n🔓 They can now use the bot again.`;
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
// 3. List all banned users
// --------------------------------------------------------------------
cmd({
    pattern: "listban",
    alias: ["banlist", "bannedusers"],
    desc: "List all banned users",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("❌ *Access Denied!*\nOnly the main owner can use this command.");

        ensureBanFile();
        let banned = JSON.parse(fs.readFileSync(BAN_FILE, "utf-8"));
        banned = [...new Set(banned)];

        if (banned.length === 0) {
            return reply("📋 No banned users found.");
        }

        let listMessage = "⛔ *Banned Users List*\n\n";
        banned.forEach((id, i) => {
            listMessage += `${i + 1}. ${id.replace("@s.whatsapp.net", "")}\n`;
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
