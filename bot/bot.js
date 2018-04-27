const SlackBot = require(`../node_modules/slackbots`);
const _ = require(`lodash`);
const firebase = require(`firebase`);
const moment = require(`moment`);
const MESSAGE = `message`;
const TARGET_TAG = `<target>`;
const HELP_COMMAND = `help`;
const COMMAND_OPERATOR = `!`;
const params = {
    icon_emoji: `:siara:`,
};

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

const STANDUP_PHRASE = `standup`;
const CHANNEL_OPERATOR = `channel`;
const HERE_OPERATOR = `here`;

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

module.exports = class SiaraBot extends SlackBot {
    constructor (cfg) {
        super(cfg);
    }

    async init() {
        this._phrases = [];
        this._users = [];
        this.holidays = [];
        this.weekdays = [];
        this.standupUrl = undefined;
        await this.connectDb();
        await this.loadLocale();
        await this.loadWeekdays();
        await this.loadHolidays();
        await this.loadPhrases();
        await this.getStandupTime();
        await this.getUsers();
        await this.loadStandupUrl();
        this.runSchedule();
    }

    runSchedule() {
        setInterval(() => this.checkSchedule(this.getTime()), 1000);
    }

    getTime() {
        return moment().format(`LTS`);
    }

    getDay() {
        return moment().format(`dddd`);
    }

    isWeekend() {
        return this.weekdays.includes(this.getDay());
    }

    isHoliday () {
        return this.holidays.includes(moment().format(`L`));
    }

    async loadHolidays() {
        const holidaysRef = await db.ref(`/holidays/`);
        holidaysRef.on(`value`, holidays => {
            this.holidays = holidays.val();
        });
    }

    async loadWeekdays() {
        const weekdaysRef = await db.ref(`/weekdays/`);
        weekdaysRef.on(`value`, weekdays => {
            this.weekdays = weekdays.val();
        });
    }

    async loadStandupUrl () {
        const weekdaysRef = await db.ref(`/standupUrl/`);
        weekdaysRef.on(`value`, standupUrl => {
            this.standupUrl = standupUrl.val();
        });
    }

    async loadLocale() {
        const localeRef = await db.ref(`/locale/`);
        localeRef.on(`value`, locale => {
            this.locale = locale.val();
            moment.locale(this.locale);
        });


    }

    userByName(name) {
        return `<@${name}>`;
    }

    async getStandupTime() {
        const scheduleRef = await db.ref(`/schedule/`);
        scheduleRef.on(`value`, schedule => {
            this.schedule = schedule.val();
        });
    }

    async getUsers () {
        const usersRef = await db.ref(`/users/`);
        usersRef.on(`value`, async users => {
            this._users = this.users = users.val();
        });
    }

    getUser() {
        this.users = this.users.length ? this.users : this._users;
        const number = this.getRandomNumber(0, this.users.length - 1);
        const randomUser = this.users[number];
        this.users = this.users.filter(user => user !== randomUser);
        return this.userByName(randomUser);
    }

    checkSchedule(time) {
        if (this.isWeekend() || this.isHoliday()) {
            return;
        }
        this.schedule.forEach((item, index) => {
            if (item.time === time) {
                if (item.phrase === STANDUP_PHRASE) {
                    this.sendMessage(this.schedule[index].channel, this.pickPhrase(this.schedule[index].phrase, this.getUser()), item.phrase);
                } else {
                    this.sendMessage(this.schedule[index].channel, this.pickPhrase(this.schedule[index].phrase), undefined, undefined);
                }
            }
        })
    }

    connectDb () {
        return firebase.auth().signInWithEmailAndPassword(process.env.FIREBASE_EMAIL, process.env.FIREBASE_PASS);
    }

    composeMessage (text, target = ``) {
        let message;
        if (text.replace(TARGET_TAG, target) === text) {
            message = `${target} ${text}`;
        } else {
            message = text.replace(TARGET_TAG, target);
        }
        return message;
    }

    findPhrase (command, phrases = this.phrases) {
        return Object.assign({}, _.find(phrases, phrase => phrase.name === command));
    }

    getCommandList () {
        return `*Dostępne komendy:* ${this._phrases.map(phrase => phrase.name).toString()}`;
    }

    getRandomNumber (min, max) {
        const minVal = Math.ceil(min);
        const maxVal = Math.floor(max);
        return Math.floor(Math.random() * (maxVal - minVal)) + minVal;
    }

    isMessageFromBot (data) {
        return data.user === this.self.id || data.username === this.name;
    }

    async loadPhrases () {
        const phrasesRef = await db.ref(`/phrases/`);
        phrasesRef.on(`value`, phrases => {
            console.log(`Phrases downloaded! Total count: ` + phrases.val().length);
            this._phrases = this.phrases = phrases.val();
        });
    }

    parseMessage(message){
        const re = /![a-zA-Z].*/g;
        const result = re.exec(message.text);
        if (!result) {
            return;
        }
        const {keyword, target} = this.parseInput(result[0]);
        return {
            keyword,
            target,
        }
    }

    sendMessage(channel, text, command) {
        if (!text) {
            return;
        }
        if (command === STANDUP_PHRASE) {
            this.postMessage(channel, `_${text}_ ${this.standupUrl}`, params);
        } else {
            this.postMessage(channel, `_${text}_`, params);
        }
    }

    onMessage (msgData) {
        if (msgData.type === MESSAGE) {
            if (!this.isMessageFromBot(msgData)) {
                const {keyword, target } = this.parseMessage(msgData);
                if (keyword === HELP_COMMAND) {
                    this.sendMessage(msgData.channel, this.getCommandList(), keyword);
                } else {
                    this.sendMessage(msgData.channel, this.pickPhrase(keyword, target), keyword);
                }
            }
        }
    }

    parseInput (line) {
        const splitted = line.split(` `);
        const command = splitted.shift();
        let target = splitted.join(` `);
        let keyword = command.split(COMMAND_OPERATOR)[1];
        if (keyword.includes(CHANNEL_OPERATOR) || keyword.includes(HERE_OPERATOR)) {
            keyword = target = ``;
        }
        return {
            keyword,
            target,
        };
    }

    handleNoPhrase() {
        return {
            type: "phrase",
            name: "niewiem",
            texts: [
                "¯\\_(ツ)_/¯"
            ]
        }

    }

    pickPhrase (command, target) {
        this.currentPhrase = this.findPhrase(command);
        if (!this.currentPhrase.texts) {
            return;
        }

        if (!this.currentPhrase.texts.length) {
            this.resetPhraseTexts(this.currentPhrase.name);
        }
        const pickedText = this.pickText();
        this.updatePhraseTexts(pickedText);
        return this.composeMessage(pickedText, target);
    }

    pickText () {
        const randomNumber = this.getRandomNumber(0, this.currentPhrase.texts.length);
        return this.currentPhrase.texts[randomNumber];
    }

    resetPhraseTexts (command) {
        const searchedPhrase = this.findPhrase(command);
        const originalPhrase = this.findPhrase(command, this._phrases);
        this.phrases = this.phrases.map((phrase) => {
            if (phrase.name === searchedPhrase.name) {
                return originalPhrase;
            }
            return phrase;
        });
        this.currentPhrase = this.findPhrase(command);
    }

    async updatePhraseTexts (text) {
        this.currentPhrase.texts = _.filter(this.currentPhrase.texts, item => item !== text);
        this.phrases = this._phrases.map((phrase) => {
            if (phrase.name === this.currentPhrase.name) {
                return this.currentPhrase;
            }
            return phrase;
        });
    }
};

