const SlackBot = require(`../node_modules/slackbots`);
const _ = require(`lodash`);
const moment = require(`moment`);

const MESSAGE = `message`;
const TARGET_TAG = `<target>`;
const HELP_COMMAND = `help`;
const COMMAND_OPERATOR = `!`;
const params = {
    icon_emoji: `:siara:`,
};

const STANDUP_PHRASE = `standup`;
const CHANNEL_OPERATOR = `channel`;
const HERE_OPERATOR = `here`;

module.exports = class SiaraBot extends SlackBot {
    /**
     * Initialize, configure and run bot.
     * @param firebase {Object} Firebase SDK
     * @param firebaseConfig {Object} Configuration object for Firebase database
     * @returns {Promise<void>}
     */
    async init(firebase, firebaseConfig) {
        this.phrases = [];
        this._phrases = [];
        this.users = [];
        this._users = [];
        this.holidays = [];
        this.weekendDays = [];
        this.standupUrl = '';
        this.firebase = firebase;
        this.firebase.initializeApp(firebaseConfig);
        this.database = await this.firebase.database();
        moment.locale(this.locale || 'PL');
        await this.connectDb(firebaseConfig);
        await this.fetchData();
        this.runSchedule();
    }

    /**
     * Fetch data from db and store in the runtime.
     * @returns {Promise<void>}
     */
    async fetchData() {
        await this.loadLocale();
        await this.loadWeekendDays();
        await this.loadHolidays();
        await this.loadPhrases();
        await this.loadSchedule();
        await this.loadUsers();
        await this.loadStandupUrl();
    }

    /**
     * Run checkAndRunSchedule method on every second.
     * @returns {void}
     */
    runSchedule() {
        setInterval(() => this.checkAndRunSchedule(this.getTime()), 1000);
    }

    /**
     * Get current time in 24-hours format.
     * @example "19:36:37"
     * @returns {string} 24-hours time stamp
     */
    getTime() {
        return moment().format(`LTS`);
    }

    /**
     * Get a day name from the current date.
     * @example
     * "wtorek"
     * @returns {string} A weekday
     */
    getDay() {
        return moment().format(`dddd`);
    }

    /**
     * Check if today is a weekend day.
     * @example
     * this.weekendDays = ["sobota", "niedziela"]
     * @returns {boolean} True, when today is a weekend day
     */
    isWeekend() {
        return this.weekendDays.includes(this.getDay());
    }

    /**
     * Check if today's date is a holiday.
     * @example
     * this.holidays = ["01.05.2018", "03.05.2018"]
     * @returns {boolean} True, when today is a holiday
     */
    isHoliday() {
        return this.holidays.includes(moment().format(`L`));
    }

    /**
     * Loads holiday dates from the DB.
     * @example
     * this.holidays = ["01.05.2018", "03.05.2018"]
     * @returns {Promise<void>}
     */
    async loadHolidays() {
        const holidaysRef = await this.database.ref(`/holidays/`);
        holidaysRef.on(`value`, holidays => {
            this.holidays = holidays.val();
        });
    }

    /**
     * Loads phrases from the DB.
     * @returns {Promise<void>}
     */
    async loadPhrases() {
        const phrasesRef = await this.database.ref(`/phrases/`);
        phrasesRef.on(`value`, phrases => {
            // eslint-disable-next-line no-console
            console.log(`Phrases downloaded! Total count: ${phrases.val().length}`);
            this._phrases = this.phrases = phrases.val();
        });
    }

    /**
     * Loads weekend days from the DB.
     * @example ["sobota", "niedziela"]
     * @returns {Promise<void>}
     */
    async loadWeekendDays() {
        const weekendDaysRef = await this.database.ref(`/weekdays/`);
        weekendDaysRef.on(`value`, weekdays => {
            this.weekendDays = weekdays.val();
        });
    }

    /**
     * Loads stanup's url from the DB.
     * @example "http://my-standup-link.com"
     * @returns {Promise<void>}
     */
    async loadStandupUrl() {
        const weekdaysRef = await this.database.ref(`/standupUrl/`);
        weekdaysRef.on(`value`, standupUrl => {
            this.standupUrl = standupUrl.val();
        });
    }

    /**
     * Loads locale setup from the DB.
     * @example "PL"
     * @returns {Promise<void>}
     */
    async loadLocale() {
        const localeRef = await this.database.ref(`/locale/`);
        localeRef.on(`value`, locale => {
            this.locale = locale.val();
        });
    }

    /**
     * Loads a schedule.
     * @example
     * Array of scheduled tasks
     * [{
          "channel": "standup",
          "phrase": "standup",
          "time": "08:13:00"
        }]
     * @returns {Promise<void>}
     */
    async loadSchedule() {
        const scheduleRef = await this.database.ref(`/schedule/`);
        scheduleRef.on(`value`, schedule => {
            this.schedule = schedule.val();
        });
    }

    /**
     * Load Slack's users list. Users names from the list are randomly used when stand-up reminder arrives.
      * @returns {Promise<void>}
     */
    async loadUsers() {
        const usersRef = await this.database.ref(`/users/`);
        usersRef.on(`value`, async users => {
            this._users = this.users = users.val();
        });
    }

    /**
     * Get a Slack's username tag.
     * @param name {string} Pure user name value
     * @returns {string} Slack's username tag
     */
    userByName(name) {
        return `<@${name}>`;
    }

    /**
     * Get random user name from the users list.
     * @returns {string} Slack's user name
     */
    getRandomUser() {
        this.users = this.users.length ? this.users : this._users;
        const number = this.getRandomNumber(0, this.users.length - 1);
        const randomUser = this.users[number];
        this.users = this.users.filter(user => user !== randomUser);
        return this.userByName(randomUser);
    }

    /**
     * Checks schedule queue and run task on a specific time.
     * @example "19:36:37"
     * @param time {string} time
     */
    checkAndRunSchedule(time) {
        if (this.isWeekend() || this.isHoliday()) {
            return;
        }
        this.schedule.forEach((item, index) => {
            if (item.time === time) {
                if (item.phrase === STANDUP_PHRASE) {
                    this.postMessageToChannel(this.schedule[index].channel, this.getMessage(this.schedule[index].phrase, this.getRandomUser()), item.phrase);
                } else {
                    this.postMessageToChannel(this.schedule[index].channel, this.getMessage(this.schedule[index].phrase), undefined, undefined);
                }
            }
        });
    }

    /**
     * Connect to the Firebase database.
     * @param cfg
     * @returns {firebase.Promise<any>}
     */
    connectDb(cfg) {
        return this.firebase.auth().signInWithEmailAndPassword(cfg.email, cfg.password);
    }

    /**
     * Format message text based on the target(optional).
     * @param text {string}
     * @param target {string}
     * @returns {string} Formatted message text
     */
    formatMessage(text, target) {
        const markCharacter = `^`;
        const newTarget = target || markCharacter;
        let message;
        const messageWithTarget = text.replace(TARGET_TAG, newTarget);
        if (messageWithTarget === text) {
            message = `${newTarget} ${text}`;
        } else {
            message = messageWithTarget;
        }
        return message.replace(`${markCharacter} `, ``);
    }

    /**
     * Get command item object on given "command".
     * @param command {string} Word that bot understand
     * @example "kilim", "brawo"
     * @param phrases
     * @returns {Object} CommandItem object
     */
    getCommandItem(command, phrases = this.phrases) {
        return Object.assign({}, _.find(phrases, phrase => phrase.name === command));
    }

    /**
     * Get all commands list.
     * @returns {string}
     */
    getCommandList() {
        return `*Dostępne komendy:* ${this._phrases.map(phrase => phrase.name).toString()}`;
    }

    /**
     * Returns random number for given min/max range.
     * @param min{number} Start range
     * @param max{number} End range
     * @returns {number} Random value between min and max
     */
    getRandomNumber(min, max) {
        const minVal = Math.ceil(min);
        const maxVal = Math.floor(max);
        return Math.floor(Math.random() * (maxVal - minVal)) + minVal;
    }

    /**
     * Check if message was send from the bot itself.
     * @param msgData{Object} Message object that stores message meta-data.
     * @returns {boolean}
     */
    isMessageFromBot(msgData) {
        return msgData.user === this.self.id || msgData.username === this.name;
    }

    /**
     * Parse a message.
     *
     * @returns {Object} Object with `command` and `target` keys that stores extracted values
     */
    parseMessage(message) {
        const re = /![a-zA-Z].*/g;
        const result = re.exec(message.text);
        if (!result) {
            return {
                command: '',
                target: '',
            };
        }
        const { command, target } = this.extractCommandAndTarget(result[0]);
        // eslint-disable-next-line consistent-return
        return {
            command,
            target,
        };
    }

    /**
     * Posts message to a specific channel.
     * @param {string} channel Specific Slack's channel name
     * @param {string} text Message text
     * @param {string} command Command
     * @returns {void}
     */
    postMessageToChannel(channel, text, command) {
        if (!text) {
            return;
        }
        if (command === STANDUP_PHRASE) {
            this.postMessage(channel, `_${text}_ ${this.standupUrl}`, params);
        } else {
            this.postMessage(channel, `_${text}_`, params);
        }
    }

    /**
     * Messages listener callback function.
     * When a new message is posted on the Slack channel and a command is matched it sends new message based on the command.
     * @param {Object} msgData Message object that stores message meta-data.
     * @returns {Object}  Object with `command` and `target` keys that stores extracted values
     */
    onMessage(msgData) {
        if (msgData.type === MESSAGE) {
            if (!this.isMessageFromBot(msgData)) {
                const { command, target } = this.parseMessage(msgData);
                if (command === HELP_COMMAND) {
                    this.postMessageToChannel(msgData.channel, this.getCommandList(), command);
                } else {
                    this.postMessageToChannel(msgData.channel, this.getMessage(command, target), command);
                }
            }
        }
    }

    /**
     * Parses Slacks messages and extracts `command` and `target` values.
     * @param {string} textLine
     * @returns {Object}  Object with `command` and `target` keys that stores extracted values
     */
    extractCommandAndTarget(textLine) {
        const splitted = textLine.split(` `);
        const leftPart = splitted.shift();
        let target = splitted.join(` `);
        let command = leftPart.split(COMMAND_OPERATOR)[1];
        if (command.includes(CHANNEL_OPERATOR) || command.includes(HERE_OPERATOR)) {
            command = target = ``;
        }
        return {
            command,
            target,
        };
    }

    /**
     * For given `command` and `target` it gets a message text that is send later to the specific Slack channel.
     * @param {string} command
     * @param {string} target
     * @returns {string} Message text
     */
    getMessage(command, target) {
        this.currentCommandItem = this.getCommandItem(command);
        if (!this.currentCommandItem.texts) {
            return;
        }

        if (!this.currentCommandItem.texts.length) {
            this.resetTexts(this.currentCommandItem.name);
        }
        const randomText = this.getRandomText();
        this.updateTexts(randomText);
        // eslint-disable-next-line consistent-return
        return this.formatMessage(randomText, target);
    }

    /**
     * Returns random text.
     * @type string
     * @returns {string} Random text for current phrase
     */
    getRandomText() {
        const randomNumber = this.getRandomNumber(0, this.currentCommandItem.texts.length);
        return this.currentCommandItem.texts[randomNumber];
    }

    /**
     * After all texts were used for given `command` method resets texts array with initial values.
     * @param command
     * @type string
     * @returns {void}
     */
    resetTexts(command) {
        const searchedPhrase = this.getCommandItem(command);
        const originalPhrase = this.getCommandItem(command, this._phrases);
        this.phrases = this.phrases.map(phrase => {
            if (phrase.name === searchedPhrase.name) {
                return originalPhrase;
            }
            return phrase;
        });
        this.currentCommandItem = this.getCommandItem(command);
    }

    /**
     *  It disallow using texts repeatedly (twice in a row). Method removes last used text from "currentCommandItem.texts" array and update phrases array.
     *  When there's no more texts, "bot.resetTexts" method is called to bring initial values.
     * @param text
     * @type string
     * @returns {void}
     */
    updateTexts(text) {
        this.currentCommandItem.texts = _.filter(this.currentCommandItem.texts, item => item !== text);
        this.phrases = this._phrases.map(phrase => {
            if (phrase.name === this.currentCommandItem.name) {
                return this.currentCommandItem;
            }
            return phrase;
        });
    }
};

