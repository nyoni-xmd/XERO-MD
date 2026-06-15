global.registerCommand({
    command: "getpp",
    alias: ["pp"],
    desc: "Get user profile picture",
    category: "tools",
    function: async (conn, m, { from, reply, args, quoted, isGroup, sender }) => {
        let target = m.mentionedJid?.[0] || (quoted?.sender) || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net') || (isGroup ? sender : null);
        if (!target) return reply("❌ Tag a user or provide a number.");
        
        try {
            let ppUrl = await conn.profilePictureUrl(target, 'image');
            await conn.sendMessage(from, {
                image: { url: ppUrl },
                caption: `╭┈┈❍ *XERO-MD* ❍
┊• *Profile picture of* @${target.split('@')[0]}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`,
                mentions: [target]
            }, { quoted: m });
        } catch {
            reply("❌ No profile picture found.");
        }
    }
});
