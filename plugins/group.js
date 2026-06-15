global.registerCommand({
    command: "groupinfo",
    alias: ["gcinfo"],
    desc: "Get group information",
    category: "group",
    function: async (conn, m, { from, isGroup, groupName, participants, reply }) => {
        if (!isGroup) return reply("❌ This command only works in groups.");
        
        const totalMembers = participants?.length || 0;
        const admins = participants?.filter(p => p.admin).length || 0;
        
        await reply(`╭┈┈❍ *XERO-MD* ❍
┊• *Group* : ${groupName}
┊• *Members* : ${totalMembers}
┊• *Admins* : ${admins}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
    }
});

global.registerCommand({
    command: "tagall",
    alias: ["everyone"],
    desc: "Tag all group members",
    category: "group",
    function: async (conn, m, { from, isGroup, isAdmins, participants, reply }) => {
        if (!isGroup) return reply("❌ This command only works in groups.");
        if (!isAdmins) return reply("❌ Only admins can use this command.");
        
        let text = "╭┈┈❍ *XERO-MD* ❍\n";
        let mentions = [];
        
        for (let member of participants) {
            text += `┊• @${member.id.split('@')[0]}\n`;
            mentions.push(member.id);
        }
        text += `╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘\n\n> POWERED BY nyoni-xmd`;
        
        await conn.sendMessage(from, { text, mentions }, { quoted: m });
    }
});
