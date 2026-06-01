const { cmd } = require('./command.js');

cmd({
    pattern: "groupinfo",
    alias: ["gcinfo", "gc"],
    desc: "Get group information",
    category: "group",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, groupName, participants, groupAdmins, reply }) => {
    if (!isGroup) return reply("This command only works in groups!");
    
    const totalMembers = participants.length;
    const adminCount = groupAdmins.length;
    
    const info = `👥 *GROUP INFORMATION*
╭━━━━━━━━━━━━━━━╮
│ 📛 Name: ${groupName}
│ 👤 Members: ${totalMembers}
│ 👑 Admins: ${adminCount}
╰━━━━━━━━━━━━━━━╯`;
    reply(info);
});
