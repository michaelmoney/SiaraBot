require('dotenv').config();

const SiaraBot = require('./bot/bot');

(function init() {
    if (!process.env.BOT_TOKEN) {
        console.error('No token for Slackbot provided!');
    } else if (!process.env.FIREBASE_PASS || !process.env.FIREBASE_EMAIL) {
        console.error('No email or password for Firebase provided!');
    } else {
        // Init SiaraBot
        const siarBot = new SiaraBot({
            token: process.env.BOT_TOKEN,
            name: `"Siara" Siarzewski`,
        });

        siarBot.init();

        siarBot.on('message', siarBot.onMessage);
        console.log('SiaraBot is runnning...');
    }
})();

