const Bot = require('./bot');

const bot = new Bot(
    {
        token: `token`,
        name: `Siara`,
    }
);
describe(`When bot is initialized`, () => {
    test(`Instance of Bot should be defined`, () => {
        expect(bot instanceof Bot).toBeTruthy();
    });

    test(`Bot token should be defined`, () => {
        expect(bot.token).toEqual(`token`);
    });

    test(`Bot name should be defined`, () => {
        expect(bot.name).toEqual(`Siara`);
    });

    test(`Phrases should be loaded`, () => {
        expect(bot.phrases.length).toBeGreaterThan(0);
    });

    test(`Phrases should be loaded`, () => {
        expect(bot.currentPhrase).toEqual(``);
    });
});

describe(`When 'findPhrase()' is called`, () => {
    test(`it should return a phrase object`, () => {
        expect(bot.findPhrase(`help`)).toBeDefined();
        expect(bot.findPhrase(`help`).name).toBeDefined();
        expect(bot.findPhrase(`help`).type).toBeDefined();
        expect(Array.isArray(bot.findPhrase(`help`).texts)).toBeTruthy();
    });
});

describe(`When 'getRandomNumber' is called`, () => {
    test(`it should return random number within chosen range`, () => {
        expect(bot.getRandomNumber(0, 5)).toBeGreaterThanOrEqual(0);
        expect(bot.getRandomNumber(0, 5)).toBeLessThanOrEqual(5);
        expect(bot.getRandomNumber(0, 5)).not.toBeGreaterThanOrEqual(15);
    })
});

describe(`When 'getTarget' is called`, () => {
    test(`it should return Slack message receiver (target) string`, () => {
        expect(bot.getTarget(`foo bar`)).toEqual(`bar`);
    })
});

describe(`When 'pickPhrase' is called`, () => {
    test(`it should return Slack message text`, () => {
         expect(typeof bot.pickPhrase(`standup`, `bar`)).toBe(`string`);
    })
    test(`texts array should be reduced`, () => {
        const texts = bot.findPhrase(`standup`).texts;
        bot.pickPhrase(`standup`, `bar`);
        const newTexts = bot.findPhrase(`standup`).texts;
        expect(Array.isArray(texts)).toBeTruthy();
        expect(texts > newTexts).toBeTruthy();
    })
});
