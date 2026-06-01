const { cmd } = require('./command.js');
const axios = require('axios');

cmd({
    pattern: "weather",
    alias: ["wthr"],
    desc: "Get weather information",
    category: "tools",
    react: "🌤️",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return reply("Example: .weather Dar es Salaam");
        const apiKey = "YOUR_API_KEY"; // Get free key from openweathermap.org
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${apiKey}&units=metric`;
        const res = await axios.get(url);
        const data = res.data;
        const weather = `🌍 *Weather in ${data.name}*
🌡️ Temp: ${data.main.temp}°C
💧 Humidity: ${data.main.humidity}%
🌬️ Wind: ${data.wind.speed} m/s
☁️ Condition: ${data.weather[0].description}`;
        reply(weather);
    } catch (e) {
        reply(`❌ City not found: ${q}`);
    }
});
