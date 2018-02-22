const SlackBot = require(`../node_modules/slackbots`);
const _ = require(`lodash`);
const firebase = require('firebase');
const moment = require('moment');
const MESSAGE = `message`;
const TARGET_TAG = `<target>`;
const HELP_COMMAND = `help`;
const COMMAND_OPERATOR = `!`;
const params = {
    icon_emoji: `:siara:`,
};

const firebaseConfig = {
    apiKey: 'AIzaSyCHLu3-3Nwvunukb3MhsnOzeRFBhDGKrU0\n',
    authDomain: 'siara-46012.firebaseapp.com',
    databaseURL: 'https://siara-46012.firebaseio.com',
    storageBucket: 'siara-46012.appspot.com',
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

module.exports = class SiaraBot extends SlackBot {
    constructor (cfg) {
        super(cfg);
    }

    async init () {
        this._phrases = [];
        this._users = [];
        await this.connectDb();
        await this.loadPhrases();
        await this.getStandupTime();
        await this.getUsers();
        moment.locale('pl');
        this.runSchedule();
    }

    runSchedule() {
        setInterval(() => this.checkSchedule(this.getTime()), 1000);
    }

    getTime() {
        return moment().format('LTS');
    }

    userByName(name) {
        return `<@${name}>`;
    }

    async getStandupTime() {
        const scheduleRef = await db.ref('/schedule/');
        scheduleRef.on('value', schedule => {
            this.schedule = schedule.val();
        });
    }

    async getUsers () {
        const usersRef = await db.ref('/users/');
        usersRef.on('value', async users => {
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
        this.schedule.forEach((item, index) => {
            if (item.time === time) {
                if (item.phrase === 'standup') {
                    this.sendMessage(this.schedule[index].channel, this.pickPhrase(this.schedule[index].phrase, this.getUser()));
                } else {
                    this.sendMessage(this.schedule[index].channel, this.pickPhrase(this.schedule[index].phrase), undefined);
                }
            }
        })
    }

    connectDb () {
        return firebase.auth().signInWithEmailAndPassword(process.env.FIREBASE_EMAIL, process.env.FIREBASE_PASS);
    }

    composeMessage (text, target = '') {
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
        const phrasesRef = await db.ref('/phrases/');
        phrasesRef.on('value', phrases => {
            console.log('Phrases downloaded! Total count: ' + phrases.val().length);
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

    sendMessage(channel, text) {
        if (!text) {
            return;
        }
        this.postMessage(channel, `_${text}_`, params);
    }

    onMessage (msgData) {
        if (msgData.type === MESSAGE) {
            if (!this.isMessageFromBot(msgData)) {
                const {keyword, target } = this.parseMessage(msgData);
                if (keyword === HELP_COMMAND) {
                    this.sendMessage(msgData.channel, this.getCommandList());
                } else {
                    this.sendMessage(msgData.channel, this.pickPhrase(keyword, target));
                }
            }
        }
    }

    parseInput (line) {
        const splitted = line.split(' ');
        const command = splitted.shift();
        let target = splitted.join(' ');
        let keyword = command.split(COMMAND_OPERATOR)[1];
        if (keyword.includes('channel') || keyword.includes('here')) {
            keyword = target = '';
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

