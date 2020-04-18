const fs = require("fs");
const Account = require("./account");

let accounts = [];
let config = JSON.parse(fs.readFileSync('config.json').toString());

if (config.accounts.length === 0) {
    console.log('(!) There are no accounts to run');
    process.exit(0);
}

config.accounts.forEach((account, index) => {
    accounts.push(new Account(index, account.login, account.password, account.loginkey, account.games));
});

setInterval(() => {
    accounts.forEach((account) => {
        account.restart();
    });
}, 1800000);