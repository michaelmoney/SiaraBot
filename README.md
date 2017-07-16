# SiaraBot. A Slack bot that brings fun and joy to your everyday slack's communication
## Description
SiaraBot is a bot based on polish comedy movie "Kiler" character - Stefan "Siara" Siarzewski. 
It was inspired from YouGov's "pmxbot".
Siara was designed to bring joy and fun into Slack's channels conversations. Depending on the situation
Siara welcomes, motivates, amuses, teaches or blames team members.

NOTE: Currently SiaraBot supports only polish commands and phrases (taken mostly from the "Kiler" comedy),
but it can be easily modified by changing `phrases.json` file.

##Supported commands (keywords):
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
To add a  new bot please read following description:
https://api.slack.com/bot-users

## Example of usage SiaraBot

#### How to print all available phrases?

To see all available phrases, type:

```
!help
``` 

#### SiaraBot example keywords

Inside Slack window type a keyword beginning with "!", optionally adding `@user` at the end of command:

To motivate someone:
```
!doroboty @user
``` 
Outputs: 
```

Od tej pory, @user masz mieć w dupie paragrafy! Masz być jak bulterier! Jak wściekły byk!
Jak Tommy Lee Jones w Ściganym!
```

To ask someone "where have you been?":

```
!gdzie @user
``` 
Outputs: 

```
@user Gdzieś była, lafiryndo?
```

To praise someone:

```
!brawo
``` 
Outputs: 

```
Ty wiesz kto to jest? Ty wiesz kto to jest?! To jest @user! On se może jeść Chateau, może se jeść ostrygę, może se jeść co chce,
a nie twoje rozpaćkane kanapki!
```

To welcome someone:

```
!dziendobry
``` 

Outputs: 

```
Dzień dobry Panie Komisarzu
```

To blame somebody:

```
!kilim @user
``` 

Outputs: 
```
Jako pragmatyk i realista, przedkładam interes ponad osobiste porachunki,
dlatego nie zabiłem Cię, @user chociaż powinienem.
```

### Links:
- "Kiler" movie https://en.wikipedia.org/wiki/Kiler
- "pmxbot" https://github.com/yougov/pmxbot/tree/master/pmxbot
