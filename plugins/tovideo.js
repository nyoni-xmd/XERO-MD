const { cmd } = require('../command');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Fonction de conversion WebP vers MP4
async function convertWebpToMp4({ file, filename, url }) {
    if (!file && !url) {
        throw new Error("A file or a URL is required.");
    }
    if (file && !filename) {
        throw new Error("Filename is required for uploaded files.");
    }

    const form = new FormData();
    if (file) form.append("new-image", file, { filename });
    if (url) form.append("new-image-url", url);

    const uploadRes = await axios.post("https://ezgif.com/webp-to-mp4", form, {
        headers: form.getHeaders()
    });

    const redirectUrl = uploadRes?.request?.res?.responseUrl;
    if (!redirectUrl) throw new Error("Redirection not found.");

    const fileId = redirectUrl.split('/').pop();

    const convertRes = await axios.post(`${redirectUrl}?ajax=true`, new URLSearchParams({
        file: fileId
    }), {
        headers: { 'Content-Type': "application/x-www-form-urlencoded" }
    });

    const html = convertRes.data.toString();
    const mp4Path = html.split('" controls><source src="')?.[1]?.split('" type="video/mp4">Your browser')?.[0];
    if (!mp4Path) throw new Error("Conversion failed.");

    return "https:" + mp4Path.replace("https:", '');
}

// Commande sticker -> vidéo
cmd({
    pattern: "stickertovideo",
    alias: ["tovideo"],
    desc: "Convert a sticker to MP4 video",
    category: "convert",
    react: "🎞️",
    filename: __filename
}, async (conn, mek, m, { quoted, repondre }) => {
    try {
        if (!quoted || !quoted.stickerMessage) {
            return conn.sendMessage(m.chat, { text: "Reply to a sticker." }, { quoted: mek });
        }

        // Télécharger le sticker temporairement
        const stickerPath = await conn.dl_save_media_msg(quoted.stickerMessage);
        const stickerStream = fs.createReadStream(stickerPath);

        // Conversion
        const videoUrl = await convertWebpToMp4({
            file: stickerStream,
            filename: "sticker.webp"
        });

        // Envoi de la vidéo
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: "```Powered By OVL-MD```"
        }, { quoted: mek });

        // Nettoyage
        fs.unlinkSync(stickerPath);

    } catch (err) {
        console.error(err);
        repondre("❌ An error occurred during conversion.");
    }
});
