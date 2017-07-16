
const SiaraBot = require('./bot/bot');

if (!process.env.BOT_TOKEN) {
    console.error('No token provided');
} else {
    // Init SiaraBot
    const siarBot = new SiaraBot({
        token: process.env.BOT_TOKEN, 
        name: `"Siara" Siarzewski`,
    });

    siarBot.on('message', siarBot.onMessage);
    console.log('SiaraBot is runnning...');
}

