require('dotenv').config();

const firebase = require(`firebase`);

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

const checkEnvs = envs => envs.map(env => {
    if (!process.env[env]) {
        // eslint-disable-next-line no-console
        console.error(`VARIABLE ${env} NOT FOUND!`);
        return false;
    }
    // eslint-disable-next-line no-console
    console.log(`VARIABLE ${env} OK!`);
    return true;
});

const runApp = async () => {
    if (checkEnvs(REQUIRED_ENVS).includes(false)) {
        // eslint-disable-next-line no-console
        console.error(`App won't work without above variables. Please add it and restart app.`);
    } else {
        // Init SiaraBot
        const siarBot = new SiaraBot({
            token: process.env.BOT_TOKEN,
            name: `"Siara" Siarzewski`,
        });
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTHDOMAIN,
            databaseURL: process.env.FIREBASE_DB_URL,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            email: process.env.FIREBASE_EMAIL,
            password: process.env.FIREBASE_PASS,
        };

        await siarBot.init(firebase, firebaseConfig);
        siarBot.on('message', siarBot.onMessage);
    }
};

runApp().then(() => {
    // eslint-disable-next-line no-console
    console.info('SiaraBot is runnning...');
},
err => {
    // eslint-disable-next-line no-console
    console.error('Ups something went wrong ¯\\_(ツ)_/¯', err);
    process.exit(0);
},
);
