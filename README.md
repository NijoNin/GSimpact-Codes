# GSimpact-Codes
A Discord Webhook Webscraper that finds the latest Promo Codes for Genshin Impact

## Features
- Checks for latest Genshin Promo codes on the hour every hour (default) from the site [gensh.in](https://www.gensh.in/)

## Requirements
- Node
- NPM

## Installation
```bash
# Clone the repository
git clone https://github.com/NijoNin/GSimpact-Codes.git

# Install the dependencies
npm install
```

## Configuration
After installation you will need to get your discord webhook url. The webhook id and token should be in the url you copy when you create a webhook on your discord server. 
e.g. `https://discord.com/api/webhooks/*-----ID-HERE----*/*----------TOKEN-HERE-----------*`
Copy the ID and Token into the respective variables in the `.env.example` file. After that rename the file to `.env`, exactly like that and you should be good.

### Starting the bot
```bash
node index.js
```

### Hosting on Repl (Free)
*Full tutorial coming soon*

In the `package.json` file, change `"start": "node index.js"` to `"start": "node index-repl.js"`, this will start up the webserver in repl ready for it to be pinged by the website [UptimeRobot](https://uptimerobot.com/). You will need to make an account on here and set up the ping for every 5 mins (*full details on how later*).

### Common issues
Just make sure all the dependencies are up to date. This should usually solve any issues.

## Author
 Josh Lawson (NijoNin)
