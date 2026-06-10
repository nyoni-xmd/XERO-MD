// emix-fun.js - XERO-MD Fun Emoji Mixer & More
const { cmd } = require("../command");
const axios = require("axios");

// -------------------------------------------------------------
// 1. EMOJI MIXER (combine two emojis into one)
// -------------------------------------------------------------
cmd({
    pattern: "emix",
    alias: ["emojimix", "mixemoji"],
    desc: "Mix two emojis to create a new one.",
    category: "fun",
    react: "🎭",
    filename: __filename,
    use: "😃 😢"
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (args.length < 2) {
            return reply("❌ Please provide two emojis.\nExample: `.emix 😃 😢`");
        }

        let emoji1 = args[0];
        let emoji2 = args[1];

        // Validate emojis (simple regex to check if they are single emoji)
        const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;
        if (!emojiRegex.test(emoji1) || !emojiRegex.test(emoji2)) {
            return reply("⚠️ Please provide valid emojis (single characters).");
        }

        // Use public API (emix.xyz or other). I'll use a reliable free API: https://emojiapi.dev/ not for mix.
        // Instead use: https://emoji.aranja.com/api/emoji-mix (fallback). 
        // But to avoid external dependency, I'll implement a simple random internal mix as fallback.
        const apiUrl = `https://emojikit.vercel.app/api/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
        
        let mixedEmoji;
        try {
            const response = await axios.get(apiUrl, { timeout: 5000 });
            if (response.data && response.data.result) {
                mixedEmoji = response.data.result;
            } else {
                throw new Error("No result from API");
            }
        } catch (error) {
            // Fallback: generate a random mix from a pool of common mixed emojis
            const fallbackMix = {
                "😃😢": "😅", "❤️🔥": "❤️‍🔥", "😂😭": "🤣", "🐱🐶": "🐱‍👤",
                "😊😍": "🥰", "😎🤓": "🧐", "🍕🍔": "🌮", "🎉🎊": "✨"
            };
            const key = `${emoji1}${emoji2}`;
            mixedEmoji = fallbackMix[key] || "🤷‍♂️";
        }

        await conn.sendMessage(from, {
            text: `✨ *Emoji Mix Result*\n\n${emoji1} + ${emoji2} = ${mixedEmoji}\n\n> XERO-MD`
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("❌ Error mixing emojis. Try again later.");
    }
});

// -------------------------------------------------------------
// 2. EMOJI TEXT (convert text to regional indicator emojis)
// -------------------------------------------------------------
cmd({
    pattern: "emojitext",
    alias: ["etext"],
    desc: "Convert text into emoji letters (regional indicators).",
    category: "fun",
    react: "🔤",
    filename: __filename,
    use: "hello"
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (args.length === 0) return reply("Provide text to convert.\nExample: `.emojitext XERO`");

        let text = args.join(" ").toLowerCase();
        let result = "";
        for (let char of text) {
            if (char >= 'a' && char <= 'z') {
                result += `:${char}: `;
                // Alternatively use regional indicator: `🇦` = letter A, but easier: use emoji letters (🅰️ etc)
                // Simpler: use regional indicator symbols (🇦 for a, but requires two letters)
                // I'll use uppercase letter emoji (🅰️ style) but for each letter.
                // Actually better: use regional indicator symbols: 
                // const regional = String.fromCodePoint(0x1F1E6 + (char.charCodeAt(0)-97));
                // But that shows as flag letters. Let's do that.
            }
        }
        // Better approach: regional indicator symbols (🇦 for A)
        let regionalText = "";
        for (let char of text) {
            if (char >= 'a' && char <= 'z') {
                const codePoint = 0x1F1E6 + (char.charCodeAt(0) - 97);
                regionalText += String.fromCodePoint(codePoint);
            } else {
                regionalText += char;
            }
        }
        if (!regionalText) regionalText = "⚠️ Only letters a-z supported.";
        
        await conn.sendMessage(from, { text: `🔠 *Emoji Text:* ${regionalText}\n\n> XERO-MD` }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply("❌ Error converting text.");
    }
});

// -------------------------------------------------------------
// 3. EMOJI RAIN (sends a waterfall of random emojis)
// -------------------------------------------------------------
cmd({
    pattern: "emojirain",
    alias: ["erain"],
    desc: "Make emojis rain in chat (animated edit).",
    category: "fun",
    react: "🌧️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const rainEmojis = ["💧", "💦", "🌧️", "☔", "🌈", "💎", "✨", "⭐", "❤️", "💛", "💚", "💙", "💜"];
        const msg = await conn.sendMessage(from, { text: "🌧️ Starting rain..." });
        
        for (let i = 0; i < 15; i++) {
            const randomEmoji = rainEmojis[Math.floor(Math.random() * rainEmojis.length)];
            const repeatCount = Math.floor(Math.random() * 8) + 2;
            const line = Array(repeatCount).fill(randomEmoji).join(" ");
            await conn.relayMessage(from, {
                protocolMessage: {
                    key: msg.key,
                    type: 14,
                    editedMessage: { conversation: line }
                }
            }, {});
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        await conn.relayMessage(from, {
            protocolMessage: {
                key: msg.key,
                type: 14,
                editedMessage: { conversation: "🌧️ Rain stopped! 🌈" }
            }
        }, {});
    } catch (e) {
        console.error(e);
        reply("❌ Rain effect failed.");
    }
});

// -------------------------------------------------------------
// 4. EMOJI LIST (display random list of emojis by category)
// -------------------------------------------------------------
cmd({
    pattern: "emojilist",
    alias: ["elist"],
    desc: "Show a list of random emojis (fun, animals, etc).",
    category: "fun",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    const categories = {
        "😀 Smileys": ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾"],
        "🐶 Animals": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🐴","🐺","🐗","🐝","🐛","🦋","🐌","🐞","🐜","🪰","🪲","🪳","🦟","🦗","🕷️","🦂","🦞","🐙","🦑","🪼","🐬","🐳","🐋","🦈"],
        "🍔 Food": ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥒","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🍖","🍗","🥩","🥓","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🫔","🥙","🧆","🥚","🍳","🥘","🍲","🥣","🥗","🍿","🧈","🧂","🥫","🍱","🍘","🍙","🍚","🍛","🍜","🍝","🍠","🍢","🍣","🍤","🍥","🥮","🍡","🥟","🥠","🥡","🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯","🥛","☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🥃","🥄","🍽️","🍴","🥢"],
        "🎉 Activities": ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸","🏒","🏑","🥍","🏏","🥅","⛳","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","⛸️","🎿","⛷️","🏂","🏋️","🤼","🤸","⛹️","🤾","🏌️","🏇","🧘","🏄","🏊","🤽","🚣","🏊‍♀️","🏄‍♂️","🚴","🚵","🏎️","🏍️","🛵","🛺","🚲","🛴","🚁","✈️","🚀","🛸","🚂","🚆","🚇","🚊","🚉","🚌","🚎","🚐","🚑","🚒","🚓","🚔","🚕","🚗","🚙","🚚","🚛","🚜","🏎️","🏍️","🛵","🛺","🚲","🛴","🚁","✈️","🚀","🛸","🚂","🚆","🚇","🚊","🚉","🚌","🚎","🚐","🚑","🚒","🚓","🚔","🚕","🚗","🚙","🚚","🚛","🚜"]
    };

    let randomCategory = Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
    let emojis = categories[randomCategory];
    let randomEmojis = emojis.sort(() => 0.5 - Math.random()).slice(0, 20);
    let list = `📋 *Random ${randomCategory} Emojis*\n\n` + randomEmojis.join(" ") + `\n\n> XERO-MD`;
    reply(list);
});
