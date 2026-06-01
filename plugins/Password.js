const { cmd } = require('./command.js');

cmd({
    pattern: "password",
    alias: ["pass", "genpass"],
    desc: "Generate random strong password",
    category: "tools",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { reply, args }) => {
    try {
        let length = parseInt(args[0]) || 12;
        if (length < 6) length = 6;
        if (length > 32) length = 32;
        
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        reply(`🔐 *Generated Password:*\n\`${password}\``);
    } catch (e) {
        reply(`❌ Error generating password`);
    }
});
