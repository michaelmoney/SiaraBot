<img src="https://travis-ci.org/michaelmoney/SiaraBot.svg?branch=master">

# SiaraBot 

*A Slack bot that **brings fun and joy to your everyday slack's communication**.*


## Description
**SiaraBot** was designed to bring joy and fun into Slack's channels conversations. Depending on the situation.
"Siara" **welcomes, motivates, amuses, teaches or blames** team members.

**SiaraBot** is a Node.js bot based on polish comedy movie "Kiler" character - **Stefan "Siara" Siarzewski**. 
The main concept of the bot was inspired from <a href="https://github.com/yougov/pmxbot" target="_blank"> YouGov's "pmxbot"</a>.

<img src="http://michaelmoney.pl/apps/siarabot/siara-logo-new.png" alt="siara">


### To motivate someone:
<img src="http://michaelmoney.pl/apps/siarabot/brawo.gif" alt="brawo">

### To blame someone:
<img src="http://michaelmoney.pl/apps/siarabot/chmurka.gif" alt="chmurka">

### To welcome someone:
<img src="http://michaelmoney.pl/apps/siarabot/dziendobry.gif" alt="dziendobry">


## Before you start


**1. Clone repository:**

```
git clone https://github.com/michaelmoney/SiaraBot.git
```

**2. Install all dependencies via NPM:**

```
npm install
```

**NOTE: Current version of SiaraBot uses ES6 features. Node version  6.x.x is required.**

**3. Setup you local variable `BOT_TOKEN` variable with token:**

```
export BOT_TOKEN=YOUR_SLACK_TOKEN
```

**4. (Optional) To veriify if token is set-up, type:**

```
echo  $BOT_TOKEN
```

### How to run SiaraBot?

Just run in the terminal:
```
npm start 
```
## Can I customise SiaraBot?

### 1.Can I add my own phrases? 

Yes. SiaraBot's texts can be easily modified by changing <a href="https://github.com/michaelmoney/SiaraBot/blob/master/assets/phrases.json">`phrases.json`</a> file.

### 2.Can I use different name and different avatar icon for SiaraBot?
Yes. You setup different name, for example **SuperManBot** and upload different avatar icon.

## How to print all available phrases?

**In the Slack's message input, type:**

```
!help
``` 

## Supported commands (keywords):
- !piwo
- !standup
- !kilim
- !brawo
- !pomylka
- !doroboty
- !zmiana
- !spadam
- !tonieja
- !dzieki
- !ufam
- !gdzie
- !zarobiony
- !dziendobry
- !niewiem

## Where to deploy SiaraBot?
SiaraBot could be run on any Node web server. It's very easy to deploy and use SiaraBot on following cloud platforms:
- Heroku
- Amazon Web Services (AWS)


## How to add SiaraBot into my Slack team?
If you have already deployed SiaraBot and have an instance running it's very simple.
In the Slack settings, you need to create a new bot and retreive a token.

To add a  new bot please read following description:
https://api.slack.com/bot-users

To keep your token safe (outside repo), `SiaraBot` load token from the ENV variable.

<img src="http://michaelmoney.pl/apps/siarabot/setup-1.jpg" alt="setup bot" style="width:60%">

<img src="http://michaelmoney.pl/apps/siarabot/setup-2.png" alt="setup bot" style="width:60%">

## Example of usage SiaraBot

### How to print all available phrases?

To see all available phrases, type:

```
!help
``` 

### SiaraBot example keywords

Inside Slack window type a keyword beginning with "!", optionally adding `@user` at the end of command:

**To motivate someone:**
```
!doroboty @user
``` 
**Outputs:** 
```

Od tej pory, @user masz mieć w dupie paragrafy! Masz być jak bulterier! Jak wściekły byk!
Jak Tommy Lee Jones w Ściganym!
```

**To ask someone "where have you been?":**

```
!gdzie @user
``` 
**Outputs:** 

```
@user Gdzieś była, lafiryndo?
```

**To praise someone:**

```
!brawo
``` 
**Outputs:**

```
Ty wiesz kto to jest? Ty wiesz kto to jest?! To jest @user! On se może jeść Chateau, może se jeść ostrygę, może se jeść co chce,
a nie twoje rozpaćkane kanapki!
```

**To welcome someone:**

```
!dziendobry
``` 

**Outputs:** 

```
Dzień dobry Panie Komisarzu
```

**To blame somebody:**

```
!kilim @user
``` 

**Outputs:**
```
Jako pragmatyk i realista, przedkładam interes ponad osobiste porachunki,
dlatego nie zabiłem Cię, @user chociaż powinienem.
```

### Links:
- "Kiler" movie https://en.wikipedia.org/wiki/Kiler
- "pmxbot" https://github.com/yougov/pmxbot/tree/master/pmxbot
