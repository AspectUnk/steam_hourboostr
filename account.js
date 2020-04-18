const fs = require("fs");
const readline = require("readline-sync");
const SteamUser = require("steam-user");

module.exports = class SteamAccount {
    constructor(index, login, password, loginkey, games) {
        this.index = index;
        this.login = login;
        this.password = password;
        this.loginkey = loginkey;
        this.games = games;

        this.isFirst = true;
        this.playingBlocked = false;
        this.countErrors = 0;

        this.accountDetails = {
            accountName: this.login,
            password : this.password,
            loginKey: this.loginkey,
            rememberPassword: true
        };

        console.log('(' + this.login + ') Initialization...');
        this.writeLog('(' + this.login + ') Initialization...');
        this.client = new SteamUser();
        console.log('(' + this.login + ') Successful initialization');
        this.writeLog('(' + this.login + ') Successful initialization');

        this.client.on('error', (err) => {
            this.countErrors++;

            if (err.eresult === SteamUser.EResult.InvalidPassword)
                this.loginkey = '';

            console.log('(' + this.login + ') ' + err + ' :\'(');
            this.writeLog('(' + this.login + ') ' + err + ' :\'(');
            console.log('(' + this.login + ') Reconnecting ' + ((this.countErrors > 1) ? '30 minutes' : '5 seconds') + '...');

            setTimeout(() => {
                if (this.countErrors > 1)
                    this.countErrors = 0;

                this.client.logOn(this.accountDetails);
            }, ((this.countErrors > 1) ? 1800000 : 5000));
        });

        this.client.logOn(this.accountDetails);

        this.client.on('loggedOn', () => {
            this.writeLog('(' + this.login + ') Successful authorization');
            if (this.isFirst) {
                setTimeout(() => {
                    this.boost();
                }, 5000);
                this.isFirst = false;
            }
        });

        this.client.on('steamGuard', (domain, callback) => {
            const code = readline.question( '(' + this.login + ') Enter Steam Guard ' + ((domain === null) ? 'from 2FA: ' : 'from mail (' + domain + '): '));
            this.writeLog('(' + this.login + ') Enter Steam Guard ' + ((domain === null) ? 'from 2FA: ' : 'from mail (' + domain + '): '));
            callback(code);
        });

        this.client.on('loginKey', (key) => {
            console.log('(' + this.login + ') Login key received');
            this.writeLog('(' + this.login + ') Login key received');
            let config = JSON.parse(fs.readFileSync('config.json').toString());
            config.accounts[this.index].loginkey = key;
            fs.writeFileSync('config.json', JSON.stringify(config));
        });

        this.client.on('playingState', (blocked) => {
            this.playingBlocked = blocked;
        });

        /*this.client.on('friendMessage', (steamID, message) => {
            console.log(steamID + ': ' + message);
            this.client.chatMessage(steamID, 'Hi i\'m just trying to get many hours in games');
        });*/
    }

    boost() {
        if (!this.playingBlocked) {
            this.client.setPersona(SteamUser.EPersonaState.Offline);
            this.client.gamesPlayed(this.games);
            console.log('(' + this.login + ') Playing games has been started');
            this.writeLog('(' + this.login + ') Playing games has been started');
        } else {
            console.log('(' + this.login + ') Game playing blocked');
            this.writeLog('(' + this.login + ') Game playing blocked');
        }
    }

    restart() {
        console.log('(' + this.login + ') Restart games');
        this.writeLog('(' + this.login + ') Restart games');
        this.client.gamesPlayed([0]);
        setTimeout(() => {
            this.boost();
        }, 5000);
    }

    writeLog(ntext) {
        var text = fs.readFileSync('log.log').toString();
        text += (ntext + "\n");
        fs.writeFileSync('log.log', text);
    }
}