const SlackBot = require(`../node_modules/slackbots`);
const loadedPhrases = require(`../assets/phrases.json`);
const _ = require(`lodash`);

const MESSAGE = `message`;
const TARGET_TAG = `<target>`;
const HELP_COMMAND = `help`;
const COMMAND_OPERATOR = `!`;
const params = {
    icon_emoji: `:siara:`,
};

module.exports = class SiaraBot extends SlackBot {
    constructor(cfg) {
        super(cfg);
        this.loadPhrases();
        this.currentPhrase = ``;
    }
    composeMessage(text, target) {
        let message;
        if (text.replace(TARGET_TAG, target) === text) {
            message = `${target} ${text}`;
        } else {
            message = text.replace(TARGET_TAG, target);
        }
        return message;
    }
    findPhrase(command, phrases = this.phrases) {
        return Object.assign({}, _.find(phrases, phrase => phrase.name === command));
    }
    getCommandList() {
        return `Dostępne komendy: _${this.phrases.map(phrase => phrase.name).toString()}_`;
    }
    getRandomNumber(min, max) {
        const minVal = Math.ceil(min);
        const maxVal = Math.floor(max);
        return Math.floor(Math.random() * (maxVal - minVal)) + minVal;
    }
    getTarget(text) {
        let target;
        const args = text.split(` `);
        if (args.length >= 2) {
            args.shift();
            args.forEach((word) => {
                target = target ? `${target} ${word}` : `${word}`;
            });
        } else {
            target = ``;
        }
        return target;
    }
    isMessageFromBot(data) {
        return data.user === this.self.id || data.username === this.name;
    }
    loadPhrases() {
        this.phrases = loadedPhrases;
    }
    onMessage(msgData) {
        if (msgData.type === MESSAGE) {
            if (!this.isMessageFromBot(msgData)) {
                const re = /![a-zA-Z].*/g;
                const result = re.exec(msgData.text);
                if (!result) {
                    return;
                }
                const { command, target } = this.parseInput(result);
                if (command === HELP_COMMAND) {
                    this.postMessage(msgData.channel, `${this.getCommandList()}`, params);
                } else {
                    this.postMessage(msgData.channel, `_${this.pickPhrase(command, target)}_`, params);
                }
            }
        }
    }
    parseInput(line) {
        const text = line[0].split(COMMAND_OPERATOR)[1];
        const command = text.split(` `)[0];
        const target = this.getTarget(text);
        return {
            command,
            target,
        };
    }
    pickPhrase(command, target) {
        this.currentPhrase = this.findPhrase(command);
        if (!this.currentPhrase.texts.length) {
            this.resetPhraseTexts(this.currentPhrase.name);
        }
        const pickedText = this.pickText();
        this.updatePhraseTexts(pickedText);
        return this.composeMessage(pickedText, target);
    }
    pickText() {
        const randomNumber = this.getRandomNumber(0, this.currentPhrase.texts.length);
        return this.currentPhrase.texts[randomNumber];
    }
    resetPhraseTexts(command) {
        const searchedPhrase = this.findPhrase(command);
        const originalPhrase = this.findPhrase(command, phrases);
        this.phrases = this.phrases.map((phrase) => {
            if (phrase.name === searchedPhrase.name) {
                return originalPhrase;
            }
            return phrase;
        });
        this.currentPhrase = this.findPhrase(command);
    }
    updatePhraseTexts(text) {
        this.currentPhrase.texts = _.filter(this.currentPhrase.texts, item => item !== text);
        this.phrases = this.phrases.map((phrase) => {
            if (phrase.name === this.currentPhrase.name) {
                return this.currentPhrase;
            }
            return phrase;
        });
    }
};

