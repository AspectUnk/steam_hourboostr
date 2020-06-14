const steamAccount = require('./account');
const path         = require('path');
const fs           = require('fs');

console.log('(>) Created by AspectUnk <https://vk.com/id9830484>');

fs.readFile(path.join(__dirname, 'data', 'accounts.json'), 'utf-8', (err, data) => {
    if (err)
    {
        throw err;
    }

    let config = JSON.parse(data);
    let accounts = [];

    if (config.accounts.length < 1)
    {
        console.log('(!) There are no accounts to run');
        process.exit(0);
    }

    config.accounts.forEach((account, index) => {
        accounts.push(new steamAccount(index, account.login, account.password, account.loginkey, account.games));
    });

    setInterval(() => {
        accounts.forEach((account) => {
            account.restart();
        });
    }, 1800000);
});