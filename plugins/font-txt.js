const { cmd } = require('../command');
const fancy = require('../lib/style');

cmd({
    pattern: "fancy",
    desc: "Apply fancy text styles",
    category: "fun",
    react: "💫",
    filename: __filename
}, 
async (conn, mek, m, { from, args, prefix, reply }) => {
    try {
        const id = args[0]?.match(/\d+/)?.join('');
        const text = args.slice(1).join(" ");

        // Si aucun argument → montrer la liste des styles
        if (!args.length) {
            return reply(
                `╭─ 「 *\`FANCY STYLE\`* 」\n│EXAMPLE: FANCY 10 XERO-MD\n│` +
                String.fromCharCode(8206).repeat(4001) + 
                fancy.list('XERO-MD', fancy)
            );
        }

        if (!id || !text) {
            return reply(
                `Example: ${prefix}fancy 10 XERO-MD\n` +
                String.fromCharCode(8206).repeat(4001) + 
                fancy.list('XERO-MD', fancy)
            );
        }

        const selectedStyle = fancy[parseInt(id) - 1];
        if (selectedStyle) {
            return reply(fancy.apply(selectedStyle, text));
        } else {
            return reply('_Style not found :(_');
        }
    } catch (error) {
        console.error(error);
        return reply('_An error occurred :(_');
    }
});
