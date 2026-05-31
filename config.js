
const config = {
    PREFIX: process.env.PREFIX || '.',
    MODE: process.env.MODE || 'public',
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || 'true',
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || 'true',
    AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || 'true',
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || 'false',
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || 'Thanks for status!',
    READ_MESSAGE: process.env.READ_MESSAGE || 'true',
    AUTO_REACT: process.env.AUTO_REACT || 'false',
    CUSTOM_REACT: process.env.CUSTOM_REACT || 'false',
    SESSION_ID: process.env.SESSION_ID || '',
    DEV: process.env.DEV || '255763111390'
}
