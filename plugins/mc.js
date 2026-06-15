global.registerCommand({
    command: "mycmd",
    alias: ["mc"],
    desc: "Description of my command",
    category: "tools",  // ← Hii category itaamua itaonekana wapi kwenye menu
    function: async (conn, m, { reply }) => {
        await reply("Command executed!");
    }
});
