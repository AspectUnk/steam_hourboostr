# HourBoostr
Program for emulating the launch of games on Steam

### Usage

All accounts are added to the `config.json` file
By default boost games: CS:GO, Dota 2, Team Fortress 2, Unturned. The boosted game can be changed by editing the `config.json`

```bash
# Start hourboostr
npm run start

# Add account
npm run add
```

### Installation

```bash
apt-get update -yq
apt-get install -yq git make curl
curl -L https://git.io/n-install | N_PREFIX=~/.n bash -s -- -y latest
npm install -g pm2
cd ~
git clone https://github.com/AspectUnk/steam_hourboostr.git
cd steam_hourboostr
```