const BaseClient = require('./structures/Client');
require('dotenv').config();
const client = new BaseClient(process.env.TOKEN),
    dialogflow = require('dialogflow'),
    { MessageEmbed } = require('discord.js');
async function init() { return await client.start(); };
init();
client.on('message', async message => {
    const prefixRegex = new RegExp(`^<@!?${client.user.id}>\\s*`);
    if(!prefixRegex.test(message.content)) return;
    const [matchedPrefix] = message.content.match(prefixRegex),
        args = message.content.trim().slice(matchedPrefix.length).split(/\s+/g),
        msg = args.join(' ');
    return await diag(message.channel, msg);
});
client.on('ready', _ => client.user.setActivity('@Hidan hi', {type: 'WATCHING'}).then(_ => console.log(`Logged in as ${client.user.tag}...`)));
client.on('error', console.error);
const projectID = process.env.DIALOGFLOW_PROJECT_ID;
const sessionID = '123456';
const config = {
    credentials: { private_key: process.env.DIALOGFLOW_PRIVATE_KEY, client_email: process.env.DIALOGFLOW_CLIENT_EMAIL }
};
const sessionClient = new dialogflow.SessionsClient(config);
const sessionPath = sessionClient.sessionPath(projectID, sessionID);
const languageCode = 'en-US';
const sendMessage = async (channel, text) => await channel.send(text).catch(console.error);
const diag = async (channel, message) => {
    const request = { session: sessionPath, queryInput: { text: { text: message, languageCode: languageCode, } }};
    const [response] = await sessionClient.detectIntent(request),
        result = response.queryResult;
    if(!response || !result) return await sendMessage(channel, 'Sorry, I didn\'t get that!');
    if(result.fulfillmentText.includes('‌‌ ')) { // Invisible character used as spaces
        const { author, desc, ...intents } = JSON.parse(result.fulfillmentText),
            embed = new MessageEmbed()
                .setAuthor(author)
                .setDescription(`${desc}\n${intents.join('\n')}`)
                .setColor('#8b818f');
        return await sendMessage(channel, embed);
    }
    return await sendMessage(channel, result.fulfillmentText);
};