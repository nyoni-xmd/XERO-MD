// plugins/cs.js - XERO-MD Country Census/Population Data
const axios = require('axios');

// Country code mapping
const countryCodes = {
    'china': 'CN', 'tanzania': 'TZ', 'kenya': 'KE', 'uganda': 'UG', 'rwanda': 'RW',
    'burundi': 'BI', 'india': 'IN', 'usa': 'US', 'united states': 'US', 'uk': 'GB',
    'united kingdom': 'GB', 'germany': 'DE', 'france': 'FR', 'japan': 'JP',
    'brazil': 'BR', 'nigeria': 'NG', 'south africa': 'ZA', 'egypt': 'EG',
    'russia': 'RU', 'canada': 'CA', 'australia': 'AU', 'ethiopia': 'ET',
    'ghana': 'GH', 'senegal': 'SN', 'morocco': 'MA', 'algeria': 'DZ',
    'sudan': 'SD', 'angola': 'AO', 'mozambique': 'MZ', 'zambia': 'ZM',
    'zimbabwe': 'ZW', 'malawi': 'MW', 'botswana': 'BW', 'namibia': 'NA',
    'pakistan': 'PK', 'bangladesh': 'BD', 'indonesia': 'ID', 'thailand': 'TH',
    'vietnam': 'VN', 'philippines': 'PH', 'malaysia': 'MY', 'mexico': 'MX'
};

// Flag emojis for countries
const countryFlags = {
    'tanzania': '🇹🇿', 'kenya': '🇰🇪', 'uganda': '🇺🇬', 'rwanda': '🇷🇼',
    'china': '🇨🇳', 'india': '🇮🇳', 'usa': '🇺🇸', 'uk': '🇬🇧',
    'germany': '🇩🇪', 'france': '🇫🇷', 'japan': '🇯🇵', 'brazil': '🇧🇷',
    'nigeria': '🇳🇬', 'south africa': '🇿🇦', 'egypt': '🇪🇬', 'russia': '🇷🇺',
    'canada': '🇨🇦', 'australia': '🇦🇺', 'ethiopia': '🇪🇹', 'ghana': '🇬🇭'
};

global.registerCommand({
    command: "cs",
    alias: ["census", "population"],
    desc: "Get country census/population data",
    category: "info",
    function: async (conn, m, { from, reply, text, sender }) => {
        try {
            if (!text) {
                const helpMsg = `╭┈┈❍ *XERO-MD* ❍
┊• *📊 COUNTRY CENSUS DATA*
┊•
┊• *Usage* : .cs [country name]
┊•
┊• *Examples* :
┊•   .cs tanzania
┊•   .cs kenya
┊•   .cs china
┊•   .cs india
┊•
┊• *Info Provided* :
┊•   👥 Population
┊•   📅 Census year
┊•   🌍 Area
┊•   📐 Density
┊•   📈 Growth rate
┊•   🏙️ Capital
┊•
┊• *Source* : World Bank & UN
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`;
                return reply(helpMsg);
            }

            const countryName = text.trim().toLowerCase();
            const flag = countryFlags[countryName] || '🌍';
            const formattedName = countryName.charAt(0).toUpperCase() + countryName.slice(1);

            await reply(`╭┈┈❍ *XERO-MD* ❍
┊• 🔍 *Searching census data for* : ${formattedName}
┊• ⏳ *Please wait...*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);

            const countryCode = countryCodes[countryName];
            
            if (!countryCode) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ Country not found in database!*
┊•
┊• *Available countries* :
┊•   Tanzania, Kenya, Uganda, Rwanda
┊•   China, India, USA, UK, Germany
┊•   France, Japan, Brazil, Nigeria
┊•   South Africa, Egypt, Russia, Canada
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            // Try REST Countries API first for basic info
            let restData = null;
            try {
                const restUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;
                const restResponse = await axios.get(restUrl);
                restData = restResponse.data[0];
            } catch (e) {
                console.error("REST API error:", e.message);
            }

            // Try World Bank API for population
            let population = "N/A";
            let censusYear = "N/A";
            let growthRate = "N/A";
            
            try {
                const wbUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL?format=json`;
                const wbResponse = await axios.get(wbUrl);
                const wbData = wbResponse.data;
                
                if (wbData && wbData[1] && wbData[1].length > 0) {
                    const popData = wbData[1].filter(p => p.value);
                    if (popData.length > 0) {
                        population = parseInt(popData[0].value).toLocaleString();
                        censusYear = popData[0].date;
                        
                        if (popData.length > 1 && popData[1].value) {
                            const current = parseFloat(popData[0].value);
                            const previous = parseFloat(popData[1].value);
                            if (previous > 0) {
                                const growth = ((current - previous) / previous * 100).toFixed(2);
                                growthRate = `${growth}%`;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("World Bank API error:", e.message);
            }

            // Prepare data from REST API or fallback
            const area = restData ? restData.area.toLocaleString() : "N/A";
            const capital = restData?.capital?.[0] || "N/A";
            const region = restData?.region || "N/A";
            const subregion = restData?.subregion || "N/A";
            const languages = restData?.languages ? Object.values(restData.languages).slice(0, 3).join(", ") : "N/A";
            
            let density = "N/A";
            if (restData && restData.area > 0 && restData.population) {
                density = (restData.population / restData.area).toFixed(2);
            }

            const resultMsg = `╭┈┈❍ *XERO-MD* ❍
┊• ${flag} *CENSUS DATA : ${formattedName.toUpperCase()}*
┊•
┊• 👥 *Population* : ${population}
┊• 📅 *Census Year* : ${censusYear}
┊• 📈 *Growth Rate* : ${growthRate}
┊•
┊• 🌍 *Area* : ${area} km²
┊• 📐 *Density* : ${density}/km²
┊• 🏙️ *Capital* : ${capital}
┊•
┊• 🗺️ *Region* : ${region}
┊• 🌐 *Subregion* : ${subregion}
┊• 🗣️ *Languages* : ${languages}
┊•
┊• 📋 *Source* : World Bank & UN Data
┊• ⚡ *Powered by XERO-MD*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`;

            await conn.sendMessage(from, {
                text: resultMsg,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363399470975987@newsletter',
                        newsletterName: 'XERO-MD',
                        serverMessageId: 143
                    }
                }
            }, { quoted: m });

        } catch (error) {
            console.error("CS Command Error:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• *⚠️ Error fetching census data!*
┊• *Reason* : ${error.message}
┊• *Please try again later*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
