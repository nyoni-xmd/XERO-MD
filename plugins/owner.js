// plugins/owner.js
global.registerCommand({
    command: "owner",
    alias: ["creator", "dev"],
    desc: "Owner info",
    category: "info",
    function: async (conn, m, { reply }) => {
        await reply(`👑 OWNER
Name: nyoni-xmd
Number: +255763111390
Number 2: +255610209120`);
    }
});
