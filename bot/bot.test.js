/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-shorthand */
const db = require('../db.json');
const Bot = require('./bot');

const firebase = require(`firebase`);

const ref = jest.fn().mockReturnValue(
    {
        on: function (a, b) {
            b.call(this, { val: () => [] });
        },
    });
firebase.initializeApp = jest.fn();
firebase.database = jest.fn().mockReturnValue({ ref });
firebase.auth = jest.fn().mockReturnValue({ signInWithEmailAndPassword: jest.fn() });

const bot = new Bot(
    {
        token: `token`,
        name: `Siara`,
    },
);

// TODO: Write more tests!
describe(`When bot is initialized`, () => {
    beforeEach(() => {
        bot.phrases = bot._phrases = db.phrases;
    });
    test(`Instance of Bot should be defined`, () => {
        expect(bot instanceof Bot).toBeTruthy();
    });
});

describe(`When 'getCommandItem()' is called`, () => {
    beforeEach(() => {
        bot.phrases = bot._phrases = db.phrases;
    });
    test(`it should return a commandItem (phrase) object`, () => {
        expect(bot.getCommandItem(`standup`)).toBeDefined();
        expect(bot.getCommandItem(`standup`).name).toBeDefined();
        expect(bot.getCommandItem(`standup`).type).toBeDefined();
        expect(Array.isArray(bot.getCommandItem(`standup`).texts)).toBeTruthy();
    });
});

describe(`When 'getRandomNumber' is called`, () => {
    test(`it should return random number within chosen range`, () => {
        expect(bot.getRandomNumber(0, 5)).toBeGreaterThanOrEqual(0);
        expect(bot.getRandomNumber(0, 5)).toBeLessThanOrEqual(5);
        expect(bot.getRandomNumber(0, 5)).not.toBeGreaterThanOrEqual(15);
    });
});

describe(`When 'getMessage' is called`, () => {
    beforeEach(() => {
        bot.phrases = bot._phrases = db.phrases;
        bot.getMessage(`standup`, `bar`);
    });
    test(`texts array should be reduced`, () => {
        const originalTexts = +bot.currentCommandItem.texts.length;
        bot.getMessage(`standup`, `bar`);
        const newTexts = +bot.currentCommandItem.texts.length;
        expect(originalTexts).toBeGreaterThan(newTexts);
    });
});

describe(`When 'init' is called`, async () => {
    beforeEach(async () => {
        bot.phrases = bot._phrases = db.phrases;
        bot.schedule = [];
        await bot.init(firebase, {});
    });

    test(`all variables should be defined & initialized`, () => {
        expect(bot._phrases.length).toEqual(0);
        expect(bot.phrases.length).toEqual(0);
        expect(bot.weekendDays.length).toEqual(0);
        expect(bot.holidays.length).toEqual(0);
        expect(bot.users.length).toEqual(0);
        expect(bot._users.length).toEqual(0);
    });
    test(`firebase.initializeApp() method should be called`, () => {
        expect(bot.firebase.initializeApp).toHaveBeenCalled();
    });
    test(`firebase.database() method should be called`, () => {
        expect(bot.firebase.initializeApp).toHaveBeenCalled();
    });
    test(`Firebases should auth`, () => {
        expect(bot.firebase.auth).toHaveBeenCalled();
    });
    test(`Firebases should auth and signin`, () => {
        expect(bot.firebase.auth().signInWithEmailAndPassword).toHaveBeenCalled();
    });
    test(`should load "locale"`, () => {
        expect(bot.database.ref).toHaveBeenCalledWith(`/locale/`);
    });
    test(`should load "schedule"`, () => {
        expect(bot.database.ref).toHaveBeenCalledWith(`/schedule/`);
    });
    test(`should load "users"`, () => {
        expect(bot.database.ref).toHaveBeenCalledWith(`/users/`);
    });
    test(`should load "standupUrl"`, () => {
        expect(bot.database.ref).toHaveBeenCalledWith(`/standupUrl/`);
    });
    test(`should load "weekdays"`, () => {
        expect(bot.database.ref).toHaveBeenCalledWith(`/weekdays/`);
    });
    test(`should load "phrases"`, () => {
        expect(bot.database.ref).toHaveBeenCalledWith(`/phrases/`);
    });
    test(`should load "holidays"`, () => {
        expect(bot.database.ref).toHaveBeenCalledWith(`/holidays/`);
    });
});

describe(`when getTime() method is called`, () => {
    test('it should return a string', () => {
        expect(typeof bot.getTime()).toBe(`string`);
    });
    test('length should equal 8 for "PL" locale', () => {
        expect(bot.getTime().length).toEqual(8);
    });
});

describe(`when formatMessage method is called`, () => {
    describe('and the target value is defined', () => {
        test(`it should replace <target> tag with the target value`, () => {
            const target = `<@U4PKYTACS>`;
            const originalMsg = `A idź mi z tą wichurą <target>`;
            const formattedMsg = `A idź mi z tą wichurą <@U4PKYTACS>`;
            expect(bot.formatMessage(originalMsg, target)).toEqual(formattedMsg);
        });
        test(`it should replace <target> tag with the target value`, () => {
            const target = `<@U4PKYTACS> <@U6AAHFB70>`;
            const originalMsg = `A idź mi z tą wichurą <target>`;
            const formattedMsg = `A idź mi z tą wichurą <@U4PKYTACS> <@U6AAHFB70>`;
            expect(bot.formatMessage(originalMsg, target)).toEqual(formattedMsg);
        });
        test(`it should add target on the beginning event if text doesn't have <target> tag inside`, () => {
            const target = `<@U4PKYTACS>`;
            const originalMsg = `No tak, lunch bez gitary to jak Lipski bez Siary!`;
            const formattedMsg = `<@U4PKYTACS> ${originalMsg}`;
            expect(bot.formatMessage(originalMsg, target)).toEqual(formattedMsg);
        });
    });

    describe(`and the target value is undefined`, () => {
        test(`original message should be the same as formatted message when <target> is in the beginning`, () => {
            const target = undefined;
            const originalMsg = `<target> No właśnie, i gdzie on jest?`;
            const formattedMsg = `No właśnie, i gdzie on jest?`;
            expect(bot.formatMessage(originalMsg, target)).toEqual(formattedMsg);
        });
        test(`original message should be the same as formatted message when <target> is in the middle`, () => {
            const target = undefined;
            const originalMsg = `Pytanie pierwsze. <target> Zawsze sikasz przez zapięty rozporek?`;
            const formattedMsg = `Pytanie pierwsze. Zawsze sikasz przez zapięty rozporek?`;
            expect(bot.formatMessage(originalMsg, target)).toEqual(formattedMsg);
        });
    });
});

describe(`When getRandomUser() method is called`, () => {
    beforeEach(() => {
        bot.users = [`mike`, `johny`, `ernest`];
    });
    test(`it should return a user name from the list`, () => {
        const expectedUsers = bot.users.map(user => bot.userByName(user));
        const randomUser = bot.getRandomUser();
        expect(expectedUsers.includes(randomUser)).toBeTruthy();
    });
});

describe(`When postMessageToChannel() method is called`, () => {
    describe(`and "text" parameter is undefined`, () => {
        test(`it should return "undefined"`, () => {
            expect(bot.postMessageToChannel('channel', undefined, 'command')).toEqual(undefined);
        });
    });
    describe(`and "text" parameter is defined and command is NOT a "standup command"`, () => {
        test(`"postMessage" method should be called with defined parameters`, () => {
            const postMessageSpy = jest.spyOn(bot, 'postMessage');
            const params = ['channel', 'some text', 'no-standup-command'];
            const botParams = {
                icon_emoji: `:siara:`,
            };
            bot.postMessageToChannel(...params);
            expect(postMessageSpy).toHaveBeenCalledWith(params[0], `_${params[1]}_`, botParams);
        });
    });
    describe(`and "text" parameter is defined and command is a "standup command" with "standupUrl"`, () => {
        test(`"postMessage" method should be called with defined parameters`, () => {
            const postMessageSpy = jest.spyOn(bot, 'postMessage');
            bot.standupUrl = `https://myStandupLink.com`;
            const params = ['channel', 'some text', 'standup'];
            const botParams = {
                icon_emoji: `:siara:`,
            };
            bot.postMessageToChannel(...params);
            expect(postMessageSpy).toHaveBeenCalledWith(params[0], `_${params[1]}_ ${bot.standupUrl}`, botParams);
        });
    });
});

