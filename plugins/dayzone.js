// plugins/today.js - XERO-MD Time & Date Command
const moment = require('moment-timezone');

// Country data with accurate timezones
const countryData = {
    // Africa
    'tanzania': { name: 'TANZANIA', flag: '🇹🇿', timezone: 'Africa/Dar_es_Salaam', offset: 3 },
    'kenya': { name: 'KENYA', flag: '🇰🇪', timezone: 'Africa/Nairobi', offset: 3 },
    'uganda': { name: 'UGANDA', flag: '🇺🇬', timezone: 'Africa/Kampala', offset: 3 },
    'rwanda': { name: 'RWANDA', flag: '🇷🇼', timezone: 'Africa/Kigali', offset: 2 },
    'burundi': { name: 'BURUNDI', flag: '🇧🇮', timezone: 'Africa/Bujumbura', offset: 2 },
    'ethiopia': { name: 'ETHIOPIA', flag: '🇪🇹', timezone: 'Africa/Addis_Ababa', offset: 3 },
    'nigeria': { name: 'NIGERIA', flag: '🇳🇬', timezone: 'Africa/Lagos', offset: 1 },
    'ghana': { name: 'GHANA', flag: '🇬🇭', timezone: 'Africa/Accra', offset: 0 },
    'south africa': { name: 'SOUTH AFRICA', flag: '🇿🇦', timezone: 'Africa/Johannesburg', offset: 2 },
    'egypt': { name: 'EGYPT', flag: '🇪🇬', timezone: 'Africa/Cairo', offset: 2 },
    'morocco': { name: 'MOROCCO', flag: '🇲🇦', timezone: 'Africa/Casablanca', offset: 1 },
    
    // Asia
    'india': { name: 'INDIA', flag: '🇮🇳', timezone: 'Asia/Kolkata', offset: 5.5 },
    'china': { name: 'CHINA', flag: '🇨🇳', timezone: 'Asia/Shanghai', offset: 8 },
    'japan': { name: 'JAPAN', flag: '🇯🇵', timezone: 'Asia/Tokyo', offset: 9 },
    'korea': { name: 'KOREA', flag: '🇰🇷', timezone: 'Asia/Seoul', offset: 9 },
    'singapore': { name: 'SINGAPORE', flag: '🇸🇬', timezone: 'Asia/Singapore', offset: 8 },
    'malaysia': { name: 'MALAYSIA', flag: '🇲🇾', timezone: 'Asia/Kuala_Lumpur', offset: 8 },
    'indonesia': { name: 'INDONESIA', flag: '🇮🇩', timezone: 'Asia/Jakarta', offset: 7 },
    'saudi arabia': { name: 'SAUDI ARABIA', flag: '🇸🇦', timezone: 'Asia/Riyadh', offset: 3 },
    'uae': { name: 'UAE', flag: '🇦🇪', timezone: 'Asia/Dubai', offset: 4 },
    'turkey': { name: 'TURKEY', flag: '🇹🇷', timezone: 'Europe/Istanbul', offset: 3 },
    
    // Europe
    'germany': { name: 'GERMANY', flag: '🇩🇪', timezone: 'Europe/Berlin', offset: 1 },
    'france': { name: 'FRANCE', flag: '🇫🇷', timezone: 'Europe/Paris', offset: 1 },
    'italy': { name: 'ITALY', flag: '🇮🇹', timezone: 'Europe/Rome', offset: 1 },
    'spain': { name: 'SPAIN', flag: '🇪🇸', timezone: 'Europe/Madrid', offset: 1 },
    'uk': { name: 'UNITED KINGDOM', flag: '🇬🇧', timezone: 'Europe/London', offset: 0 },
    'england': { name: 'UNITED KINGDOM', flag: '🇬🇧', timezone: 'Europe/London', offset: 0 },
    'russia': { name: 'RUSSIA', flag: '🇷🇺', timezone: 'Europe/Moscow', offset: 3 },
    'netherlands': { name: 'NETHERLANDS', flag: '🇳🇱', timezone: 'Europe/Amsterdam', offset: 1 },
    'sweden': { name: 'SWEDEN', flag: '🇸🇪', timezone: 'Europe/Stockholm', offset: 1 },
    
    // Americas
    'usa': { name: 'USA', flag: '🇺🇸', timezone: 'America/New_York', offset: -5 },
    'united states': { name: 'USA', flag: '🇺🇸', timezone: 'America/New_York', offset: -5 },
    'canada': { name: 'CANADA', flag: '🇨🇦', timezone: 'America/Toronto', offset: -5 },
    'brazil': { name: 'BRAZIL', flag: '🇧🇷', timezone: 'America/Sao_Paulo', offset: -3 },
    'mexico': { name: 'MEXICO', flag: '🇲🇽', timezone: 'America/Mexico_City', offset: -6 },
    'argentina': { name: 'ARGENTINA', flag: '🇦🇷', timezone: 'America/Argentina/Buenos_Aires', offset: -3 },
    
    // Oceania
    'australia': { name: 'AUSTRALIA', flag: '🇦🇺', timezone: 'Australia/Sydney', offset: 10 },
    'new zealand': { name: 'NEW ZEALAND', flag: '🇳🇿', timezone: 'Pacific/Auckland', offset: 12 }
};

const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

global.registerCommand({
    command: "today",
    alias: ["date", "day", "time", "now", "worldtime"],
    desc: "Get current date and time for any country",
    category: "tools",
    function: async (conn, m, { from, reply, args, prefix, sender }) => {
        try {
            if (!args || args.length === 0) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *COUNTRY NAME NOT SPECIFIED!*
┊•
┊• *Usage* : ${prefix}today [country]
┊• *Examples* :
┊•   ${prefix}today tanzania
┊•   ${prefix}today kenya
┊•   ${prefix}today japan
┊•   ${prefix}today germany
┊•
┊• *Country list* : ${prefix}today list
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            const input = args.join(' ').toLowerCase();

            if (input === 'list') {
                let countriesList = "╭┈┈❍ *XERO-MD* ❍\n┊• *AVAILABLE COUNTRIES*\n┊•\n";
                const countryEntries = Object.entries(countryData);
                for (let i = 0; i < countryEntries.length; i++) {
                    const [key, data] = countryEntries[i];
                    countriesList += `┊• ${data.flag} ${data.name} (UTC${data.offset >= 0 ? '+' : ''}${data.offset})\n`;
                }
                countriesList += `┊•
┊• *Usage* : ${prefix}today [country]
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`;
                return reply(countriesList);
            }

            let country = null;
            for (const [key, data] of Object.entries(countryData)) {
                if (key === input || key.includes(input) || input.includes(key)) {
                    country = data;
                    break;
                }
            }

            if (!country) {
                return reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ COUNTRY NOT FOUND!*
┊•
┊• *Country* : ${input}
┊• *Not found in database*
┊•
┊• *Available countries* : ${prefix}today list
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
            }

            // Get time for the country
            const time = moment().tz(country.timezone);
            const date = time.toDate();
            
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            const isLeapYear = (date.getFullYear() % 4 === 0 && (date.getFullYear() % 100 !== 0 || date.getFullYear() % 400 === 0));
            const totalDays = isLeapYear ? 366 : 365;
            const weekNumber = getWeekNumber(date);
            const progress = Math.round((dayOfYear / totalDays) * 100);
            
            const timeMessage = `╭┈┈❍ *XERO-MD* ❍
┊• ${country.flag} *TIME IN ${country.name}*
┊•
┊• 📅 *Date* : ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}
┊• 🕒 *Time* : ${time.format('HH:mm:ss')}
┊• 🌍 *Timezone* : ${country.timezone} (UTC${country.offset >= 0 ? '+' : ''}${country.offset})
┊•
┊• 📊 *Year Progress* :
┊•   Day ${dayOfYear} of ${totalDays} (${progress}%)
┊•   Week ${weekNumber} of 52
┊•
┊• 📅 *Year ${date.getFullYear()}* :
┊•   ${isLeapYear ? '🔷 Leap Year' : '📅 Normal Year'}
┊•   Days remaining : ${totalDays - dayOfYear}
┊•   Unix timestamp : ${Math.floor(date.getTime() / 1000)}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd
⚡ POWER - SPEED - CONTROL
🚀 BEYOND LIMITS`;

            await conn.sendMessage(from, {
                text: timeMessage,
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
            console.error("TODAY CMD ERROR:", error);
            reply(`╭┈┈❍ *XERO-MD* ❍
┊• *❌ ERROR!*
┊• *Reason* : ${error.message}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈⭘

> POWERED BY nyoni-xmd`);
        }
    }
});
