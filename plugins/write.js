const { cmd } = require('../command');
const fs = require('fs');
const sharp = require('sharp');

cmd({
    pattern: "write",
    alias: [],
    desc: "Add text to an image, video, or sticker",
    category: "convert",
    react: "✍️",
    filename: __filename
}, async (conn, mek, m, { quoted, args, repondre }) => {
    if (!quoted || !args[0]) {
        return conn.sendMessage(m.chat, {
            text: "Please reply to a file and provide text."
        }, { quoted: mek });
    }

    const media = quoted.imageMessage || quoted.videoMessage || quoted.stickerMessage;
    if (!media) {
        return conn.sendMessage(m.chat, {
            text: "Unsupported file type. Please reply to an image, video, or sticker."
        }, { quoted: mek });
    }

    try {
        // Download the media
        const mediaPath = await conn.dl_save_media_msg(media);
        const image = sharp(mediaPath);
        const { width, height } = await image.metadata();

        const text = args.join(" ").toUpperCase();
        let fontSize = Math.floor(width / 10);
        if (fontSize < 20) fontSize = 20;
        const lineHeight = fontSize * 1.2;
        const maxLineWidth = width * 0.8;

        // Wrap text
        function wrapText(input, maxWidth) {
            const words = input.split(" ");
            let lines = [];
            let currentLine = '';

            words.forEach(word => {
                const testLine = currentLine + word + " ";
                const testWidth = testLine.length * (fontSize * 0.6);
                if (testWidth > maxWidth && currentLine !== '') {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    currentLine = testLine;
                }
            });
            lines.push(currentLine.trim());
            return lines;
        }

        const lines = wrapText(text, maxLineWidth);

        // Create SVG with text
        const svgText = lines.map((line, i) => `
            <text x="50%" y="${height - (lines.length - i) * lineHeight}" 
            font-size="${fontSize}" font-family="Arial" fill="white" 
            text-anchor="middle" stroke="black" stroke-width="${fontSize / 15}">
            ${line}</text>
        `).join('');

        const svg = `<svg width="${width}" height="${height}">${svgText}</svg>`;

        // Composite text on image
        const buffer = await image.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).toBuffer();

        // Save as webp sticker
        const outPath = `${Math.floor(Math.random() * 10000)}.webp`;
        await sharp(buffer).webp().toFile(outPath);

        // Send sticker
        await conn.sendMessage(m.chat, {
            sticker: fs.readFileSync(outPath)
        }, { quoted: mek });

        // Clean up
        fs.unlinkSync(outPath);
        fs.unlinkSync(mediaPath);

    } catch (err) {
        repondre("An error occurred while adding text: " + err.message);
    }
});
