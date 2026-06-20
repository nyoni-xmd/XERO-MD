// plugins/meme.js - XERO-MD Meme Generator
const axios = require('axios');
const fs = require('fs');
const path = require('path');

global.registerCommand({
    command: "meme",
    alias: ["memegenerator", "makememe"],
    desc: "Convert your text into a meme image",
    category: "fun",
    function: async (conn, m, { from, reply, args, q }) => {
        try {
            // Check if text is provided
            if (!q) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• 📋 *MEME GENERATOR*
┊•
┊• 💡 *Usage* :
┊•   .meme [Your meme text]
┊•
┊• 📌 *Example* :
┊•   .meme Kuna shule za ajabu TZ hii wanafunzi wanapanda minazi kila siku 😂
┊•
┊• 📌 *More examples* :
┊•   .meme Life is like a box of chocolates
┊•   .meme I should have stayed in bed today
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            // Show processing message
            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 🎨 *Generating your meme...*
┊• ⏳ Please wait
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            // Encode text for URL
            const encodedText = encodeURIComponent(q);
            
            // Use popcat meme API (free and reliable)
            const memeUrl = `https://api.popcat.xyz/meme?text=${encodedText}`;
            
            // Download the meme image
            const response = await axios.get(memeUrl, {
                responseType: 'arraybuffer',
                timeout: 15000
            });

            // Send the meme image
            await conn.sendMessage(from, {
                image: Buffer.from(response.data),
                caption: `╭┈┈❍ *XERO-MD* ❍
┊• 🎭 *Your Meme is Ready!*
┊•
┊• 📝 *Text* : ${q}
┊• ⏰ *Generated* : ${new Date().toLocaleString()}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`
            }, { quoted: m });

        } catch (error) {
            console.error("Meme Error:", error);
            
            // Fallback: Try alternative API
            try {
                const fallbackUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(q)}.jpg`;
                const response = await axios.get(fallbackUrl, {
                    responseType: 'arraybuffer',
                    timeout: 15000
                });
                
                await conn.sendMessage(from, {
                    image: Buffer.from(response.data),
                    caption: `╭┈┈❍ *XERO-MD* ❍
┊• 🎭 *Your Meme is Ready!*
┊• 📝 *Text* : ${q}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`
                }, { quoted: m });
                return;
            } catch (fallbackError) {
                // If both fail, send a text-based meme
                const memeText = `╭┈┈❍ *XERO-MD* ❍
┊• 📝 *Meme Text*
┊•
┊• ${q}
┊•
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS
> POWERED BY nyoni-xmd`;
                
                await reply(memeText);
            }
        }
    }
});
