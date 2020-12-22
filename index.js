require('dotenv').config();
const axios = require('axios').default;
const cheerio = require('cheerio');
const { CronJob } = require('cron');
const Discord = require('discord.js');
const fs = require('fs');
const cron = require('cron').CronJob;

const url = "https://www.gensh.in/events/promotion-codes";
const path = "./.data/lastcode.json";

const hookToken = process.env.WEBHOOK_TOKEN;
const hookId = process.env.WEBHOOK_ID;

var params;

// Schedule when you want the function to activate, Use cron formatting to edit timing
var job = new CronJob('* * * * *', function() {

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
            console.log("First check complete - table row test: " + codeTable.eq(0).text());
            
            // Checks if the .json file with the last code exists, if so, get the code ready to compare
            if (fs.existsSync(path)){
    
                let rawdata = fs.readFileSync(path);
                lastcode = JSON.parse(rawdata).fields[2].value;
            }
    
            // remember to remove '&& i < 4' in while condition (testing purposes)
            while (isValid === true && i < 4){
    
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
    
                        i++;
                    }
                    
                }
            }
            
            // if i equals 0, this means that no new codes have been uploaded to site
            if (i === 0){
    
                return;
            }
    
            console.log(LatestPromoCode);
            console.log("Expired check: Complete, Latest code check: Complete, Embed/s Created");
            
            // Adds latest code to the JSON file
            let data = JSON.stringify(LatestPromoCode[0], null, 2);
            fs.writeFileSync(path, data);
            
            // Webhook post parameters
            params = {
                username: "Genshin Promo Codes Test",
                avatar_url: "",
                content: "",
                embeds: []
            }
            
            //Dynamically adds each embed into the webhook post
            for (var x in LatestPromoCode){
    
                params.embeds.push(LatestPromoCode[x]);
            }
            
            // webhook client URL (webhook ID and Token in .env file), you must get your own from discord 
            // when you create a webhook on a certain channel.
            const hook = new Discord.WebhookClient(hookId,hookToken);
            
            // send your message/embed to the discord channel you chose
            hook.send(params);
            
        }) 
        .catch(console.error);
}, null, true, 'Pacific/Auckland');
job.start();

    