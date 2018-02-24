require('dotenv').config();

const SiaraBot = require('./bot/bot');

const REQUIRED_ENVS = [
    'FIREBASE_PASS',
    'FIREBASE_EMAIL',
    'FIREBASE_API_KEY',
    'FIREBASE_AUTHDOMAIN',
    'FIREBASE_DB_URL',
    'FIREBASE_STORAGE_BUCKET',
    'BOT_TOKEN',
];

const checkEnvs = envs => {
    return envs.map(env => {
        if (!process.env[env]) {
            console.error(`VARIABLE ${env} NOT FOUND!`);
            return false;
        } else {
            console.log(`VARIABLE ${env} OK!`);
            return true;
        }
    })
};

const runApp = async () => {
    if (checkEnvs(REQUIRED_ENVS).includes(false)){
        console.error(`App won't work without above variables. Please add it and restart app.`);
        return;
    } else {
        // Init SiaraBot
        const siarBot = new SiaraBot({
            token: process.env.BOT_TOKEN,
            name: `"Siara" Siarzewski`,
        });

        await siarBot.init();
        siarBot.on('message', siarBot.onMessage);
        console.log('SiaraBot is runnning...');
    }
};

runApp();
