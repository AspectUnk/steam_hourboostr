const SteamUser = require('steam-user');
const readline  = require('readline-sync');
const path      = require('path');
const fs        = require('fs');

const client = new SteamUser();

let account = {};
let accounts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'accounts.json')).toString());

account.games = [730,440,570,304930];
account.login = readline.question('Login: ');
account.password = readline.questionNewPassword('Password: ');
account.loginkey = '';

client.on('error', (err) => {
    console.log(err + ' :\'(');
});

client.on('loggedOn', () => {
    console.log('Successful authorization, please wait...');

    setTimeout(() => {
        accounts.accounts.push(account);
        fs.writeFileSync(path.join(__dirname, 'data', 'accounts.json'), JSON.stringify(accounts));
        console.log('Account has been saved');
        process.exit(0);
    }, 15000);
});

client.on('steamGuard', (domain, callback) => {
    const code = readline.question('Enter Steam Guard ' + ((domain === null) ? 'from 2FA: ' : 'from mail (' + domain + '): '));
    callback(code);
});

client.on('loginKey', (key) => {
    console.log('Login key received');

    account.loginkey = key;
    accounts.accounts.push(account);

    fs.writeFileSync(path.join(__dirname, 'data', 'accounts.json'), JSON.stringify(accounts));

    client.logOff();
    process.exit(0);
});

client.logOn({
    accountName: account.login,
    password : account.password,
    loginKey: account.loginkey,
    rememberPassword: true
});