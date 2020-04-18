const fs = require("fs");
const readline = require("readline-sync");
const SteamUser = require("steam-user");

const client = new SteamUser();

let account = {};
let accounts = JSON.parse(fs.readFileSync('config.json').toString());

account.games = [730,440,570,304930];

account.login = readline.question('Login: ');
account.password = readline.questionNewPassword('Password: ');

client.on('error', (err) => {
    console.log(err + ' :\'(');
});

client.logOn({
    accountName: account.login,
    password : account.password,
    loginKey: account.loginkey,
    rememberPassword: true
});

client.on('loggedOn', () => {
    console.log('Successful authorization, please wait...');
});

/*client.on('sentry', (sentry) => {
    console.log('New sentry file received');
    fs.writeFileSync('sentry/' + account.login + '.bin', sentry);
});*/

client.on('steamGuard', (domain, callback) => {
    const code = readline.question('Enter Steam Guard ' + ((domain === null) ? 'from 2FA: ' : 'from mail (' + domain + '): '));
    callback(code);
});

client.on('loginKey', (key) => {
    console.log('Login key received');
    account.loginkey = key;
    accounts.accounts.push(account);
    fs.writeFileSync('config.json', JSON.stringify(accounts));
    client.logOff();
});