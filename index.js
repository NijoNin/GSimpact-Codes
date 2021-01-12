require('dotenv').config();
const axios = require('axios').default;
const cheerio = require('cheerio');
const { CronJob } = require('cron');
const Discord = require('discord.js');
const fs = require('fs');
const cron = require('cron').CronJob;

const url = "https://www.gensh.in/events/promotion-codes";
const dir = "./.data"
const path = dir + "/lastcode.json";

const hookToken = process.env.WEBHOOK_TOKEN;
const hookId = process.env.WEBHOOK_ID;

var params;

// for first time entering server or restarting bot
sendWebhook();

// Schedule when you want the function to activate, Use cron formatting to edit timing
// Every hour from minute zero of the hour '0 * * * *'.
var job = new CronJob('0 * * * *', function() {

    sendWebhook();
}, null, true, 'Pacific/Auckland');
job.start();

// The main function to find, get and send the promo code to discord server
function sendWebhook() {

    // Gets the HTML data from promo code website
    axios(url)
        .then(response => {
            
            // Collect the specific data from the website needed, specifically info in the Promo code table
            const html = response.data;
            const $ = cheerio.load(html);
            const codeTable = $('tbody').children();
            const LatestPromoCode = [];
            var isValid = true;
            var i = 0;
            var lastcode;
            var iniMsg = "";
            console.log(new Date().toLocaleString('en-US', {timeZone: 'Pacific/Auckland'}) + ": First check complete - table row test: " + codeTable.eq(0).text());
            
            // Checks if the .json file with the last code exists, if so, get the code ready to compare
            if (fs.existsSync(path)){
    
                let rawdata = fs.readFileSync(path);
                lastcode = JSON.parse(rawdata).fields[2].value;
                console.log("Successfully retrieved last code: " + lastcode);
            } else {

                // If file doesnt exist, webhook is new to server, send message saying thank you for using 
                // and first codes may have already been used as this is a starter check
                iniMsg = "Thank you for using my Genshin Promocode webhook. The first codes you see may have already been used, this is the webhook initialising";

            }
    
            // main check to test if promocode is valid or not
            while (isValid === true){
    
                if (codeTable.eq(i).children().eq(1).text().trim() === "Yes"){
    
                    isValid = false;
                    console.log('Other codes are expired')
                } else {
    
                    if (fs.existsSync(path) && codeTable.eq(i).children().eq(2).text().trim() === lastcode){
    
                        isValid = false;
                        console.log(codeTable.eq(i).children().eq(2).text().trim() + " is the same as " + lastcode + ", no need to check further")
                    } else {

                        LatestPromoCode.push({
    
                            title: "Latest Promo Code",
                            color: 0x93c8eb,
                            fields: [
                            {
                                name: "Reward",
                                value: codeTable.eq(i).children().eq(0).text().trim(),
                                inline: true,
                            },
                            {
                                name: "Expired",
                                value: codeTable.eq(i).children().eq(1).text().trim(),
                                inline: true,
                            },
                            {
                                name: "EU",
                                value: codeTable.eq(i).children().eq(2).text().trim(),
                                inline: false,
                            },
                            {
                                name: "NA",
                                value: codeTable.eq(i).children().eq(3).text().trim(),
                                inline: false,
                            },
                            {
                                name: "SEA",
                                value: codeTable.eq(i).children().eq(4).text().trim(),
                                inline: false,
                            }
                            ],
                            timestamp: new Date(),
                
                        });   

                        console.log(LatestPromoCode);
                        i++;
                    }
                    
                }
            }
            
            // if i equals 0, this means that no new codes have been uploaded to site
            if (i === 0){
    
                return;
            }
    
            console.log("Expired check: Complete, Latest code check: Complete, Embed/s Created");
            
            // Makes directory if doesn't exist.
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            // Adds latest code to the JSON file
            let data = JSON.stringify(LatestPromoCode[0], null, 2);
            fs.writeFileSync(path, data);
            console.log("Saved lastest Code to JSON");

            // Webhook post parameters
            params = {
                username: "Genshin Promo Codes Test",
                avatar_url: "",
                content: iniMsg,
                embeds: []
            }
            console.log("Webhook params created");
            
            //Dynamically adds each embed into the webhook post
            for (var x in LatestPromoCode){
    
                params.embeds.push(LatestPromoCode[x]);
            }
            console.log("Inserted latest promocode/s into webhook");
            
            // webhook client URL (webhook ID and Token in .env file), you must get your own from discord 
            // when you create a webhook on a certain channel.
            const hook = new Discord.WebhookClient(hookId,hookToken);
            console.log("initialise webhook client");
            
            // send your message/embed to the discord channel you chose
            hook.send(params);
            console.log("Webhook sent");
            
        }) 
        .catch(console.error);
}    