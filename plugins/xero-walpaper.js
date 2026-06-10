const config = require('../config');
const { cmd } = require('../command'); 
const axios = require('axios');
const cheerio = require('cheerio');

const BASE = 'https://4kwallpapers.com';

const HEADERS = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10)',
    'accept-language': 'en-US,en;q=0.9',
    'referer': BASE
};

async function fetchHtml(url) {
    const { data } = await axios.get(url, {
        headers: HEADERS,
        timeout: 20000
    });
    return data;
}

async function searchWallpapers(query) {
    const html = await fetchHtml(
        `${BASE}/search/?q=${encodeURIComponent(query)}`
    );

    const $ = cheerio.load(html);
    const results = [];

    $('a[href*=".html"]').each((_, el) => {
        const href = $(el).attr('href');

        if (!href) return;

        const fullUrl = href.startsWith('http')
            ? href
            : BASE + href;

        if (
            /\/[a-z0-9-]+-(\d+)\.html$/i.test(fullUrl) &&
            !results.includes(fullUrl)
        ) {
            results.push(fullUrl);
        }
    });

    return results.slice(0, 10);
}

async function getWallpaperImage(detailUrl) {
    const html = await fetchHtml(detailUrl);

    const $ = cheerio.load(html);

    const resolutions = [
        '1080x2400',
        '1080x2340',
        '1080x2160',
        '1080x1920',
        '720x1280',
        '3840x2160',
        '2560x1440',
        '1920x1080'
    ];

    const links = [];

    $('a[href*="/images/wallpapers/"]').each((_, el) => {
        const href = $(el).attr('href');

        if (href) {
            links.push(
                href.startsWith('http')
                    ? href
                    : BASE + href
            );
        }
    });

    if (!links.length) return null;

    for (const res of resolutions) {
        const found = links.find(x => x.includes(res));
        if (found) return found;
    }

    return links[0];
}

cmd({
    pattern: "wallpaper",
    alias: ["wp", "wall"],
    desc: "Download HD Wallpapers",
    category: "download",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {

    if (!q) {
        return reply(
            "*🖼️ Give me a wallpaper name!*\n\nExample:\n.wallpaper Ronaldo"
        );
    }

    try {

        await reply(`🔍 Searching wallpapers for *${q}*...`);

        const detailPages = await searchWallpapers(q);

        if (!detailPages.length) {
            return reply(`❌ No wallpapers found for *${q}*`);
        }

        const imageUrls = await Promise.all(
            detailPages.map(url =>
                getWallpaperImage(url).catch(() => null)
            )
        );

        const validImages = imageUrls.filter(Boolean);

        if (!validImages.length) {
            return reply("❌ Failed to fetch wallpapers.");
        }

        let count = 0;

        for (const image of validImages) {

            try {

                const resolution =
                    image.match(/(\d+x\d+)/)?.[1] ||
                    "HD";

                await conn.sendMessage(
                    from,
                    {
                        image: { url: image },
                        caption:
`╭━━〔 *WALLPAPER DOWNLOADER* 〕━━⬣
┃ 🔎 Query : ${q}
┃ 📱 Quality : ${resolution}
┃ 🤖 Bot : ${config.BOT_NAME}
╰━━━━━━━━━━━━━━━━━━⬣
> ${config.DESCRIPTION}`
                    },
                    { quoted: mek }
                );

                count++;

            } catch (e) {
                console.log(e);
            }
        }

        if (count === 0) {
            return reply("❌ Unable to send wallpapers.");
        }

    } catch (err) {
        console.log(err);

        reply(
            "❌ Error while fetching wallpapers.\nTry again later."
        );
    }
});
