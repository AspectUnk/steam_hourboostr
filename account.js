const SteamUser = require('steam-user');
const readline  = require('readline-sync');
const path      = require('path');
const fs        = require('fs');

class SteamAccount
{
    constructor(index, login, password, loginkey, games)
    {
        this.index = index;
        this.login = login;
        this.games = games;

        this.isFirst = true;
        this.playingBlocked = false;
        this.countErrors = 0;

        this.accountDetails = {
            accountName: this.login,
            password : password,
            loginKey: loginkey,
            rememberPassword: true
        };

        this.writeLog('(' + this.login + ') Initialization...');

        this.client = new SteamUser();
        this.writeLog('(' + this.login + ') Successful initialization');

        this.client.on('error', (err) => {
            this.countErrors++;

            if (err.eresult === SteamUser.EResult.InvalidPassword)
            {
                this.accountDetails.loginKey = '';
            }

            this.writeLog('(' + this.login + ') ' + err + ' :\'(');
            this.writeLog('(' + this.login + ') Reconnecting ' + (this.countErrors > 2 ? '30 minutes' : '5 seconds') + '...');

            setTimeout(() => {
                if (this.countErrors > 2)
                {
                    this.countErrors = 0;
                }

                this.client.logOn(this.accountDetails);
            }, this.countErrors > 2 ? 1800000 : 5000);
        });

        this.client.on('loggedOn', () => {
            this.writeLog('(' + this.login + ') Successful authorization');
            
            if (this.isFirst)
            {
                setTimeout(() => {
                    this.boost();
                }, 5000);
                
                this.isFirst = false;
            }
        });

        this.client.on('steamGuard', (domain, callback) => {
            const code = readline.question( '(' + this.login + ') Enter Steam Guard ' + ((domain === null) ? 'from 2FA: ' : 'from mail (' + domain + '): '));
            callback(code);
        });

        this.client.on('loginKey', (key) => {
            this.writeLog('(' + this.login + ') Login key received');

            this.accountDetails.loginKey = key;

            fs.readFile(path.join(__dirname, 'data', 'accounts.json'), 'utf-8', (err, data) => {
                if (err)
                {
                    throw err;
                }

                let config = JSON.parse(data);
                config.accounts[this.index].loginkey = key;

                fs.writeFile(path.join(__dirname, 'data', 'accounts.json'), JSON.stringify(config), (err) => {
                    if (err)
                    {
                        throw err;
                    }
                });
            });
        });

        this.client.on('playingState', (blocked) => {
            this.playingBlocked = blocked;
        });

        /*this.client.on('friendMessage', (steamID, message) => {
            console.log(steamID + ': ' + message);
            this.client.chatMessage(steamID, 'Hi i\'m just trying to get many hours in games');
        });*/

        this.client.logOn(this.accountDetails);
    }

    boost()
    {
        if (!this.playingBlocked)
        {
            this.client.setPersona(SteamUser.EPersonaState.Offline);
            this.client.gamesPlayed(this.games);

            this.writeLog('(' + this.login + ') Playing games has been started');
        }
        else
        {
            this.writeLog('(' + this.login + ') Game playing blocked');
        }
    }

    restart()
    {
        this.writeLog('(' + this.login + ') Restart games');
        this.client.gamesPlayed([0]);

        setTimeout(() => {
            this.boost();
        }, 5000);
    }

    writeLog(data)
    {
        console.log(data);

        fs.appendFile(path.join(__dirname, 'data', 'latest.log'), data + '\n', (err) => {
            if (err)
            {
                throw err;
            }
        });
    }
}

module.exports = SteamAccount;