const config = require("../config.json")
const wait = require('node:timers/promises').setTimeout;
const chalk = require('chalk');
const { Discord, MessageEmbed } = require('discord.js');
const db = require("quick.db");
module.exports = async (client, message) => {
    let blacklisted = db.get(`blacklist_${message.author.id}`);
    if(message.author?.bot) return
    

    if(message.channel.id == "1003689744720461848") return;
//    if(message.channel.type == "DM") return client.channels.cache.get(config.logs.dms).send(`${message.author.tag} (${message.author.id}): ${message.content}`)

if(message.author.id === config.settings.owner && message.content.toLowerCase().startsWith('eval')) return client.commands.get('eval').run(client, message, message.content.split(/ +/))

   if(message.channel.type == "DM") return client.channels.cache.get(config.logs.dms).send(`${message.author.tag} (${message.author.id}): ${message.content}`)
    
    if(message.author.id === config.settings.owner && message.content.toLowerCase().startsWith('eval')) return client.commands.get('eval').run(client, message, message.content.split(/ +/))
    
    if(blacklisted == true) return;

    const array = require(`../scam.json`)
    if (array.some(word => message.content.toLowerCase().includes(word))) {
        try {
        message.delete({ reason: 'AntiScam' });
        message.member.timeout(100 * 60 * 1000)
        const logEmbedDesc = 'Scam link blocked!'
        .replace(/{MENTION}/g, message.author.tag)
        .replace(/{ID}/g, message.author.id)
        .replace(/{MESSAGE}/g, message.content)
        .replace ("://", ": //");
        const logChannel = client.channels.cache.get(config.channelID.logs)
        const logEmbed = new MessageEmbed()
        .setColor(`RED`)
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(logEmbedDesc)
        .setTimestamp()
        .addFields([{ name: 'Action', value: 'Timeout for 1 hour' }]);
        await logChannel.send({ embeds: [logEmbed] });
       }
      catch (error){
        console.error(error);
        await logChannel.send(error);
      }
    }
    
    if(message.channel.id === config.channelID.suggestions && !message.content.startsWith('>')){
        message.react('👍')
        await wait(500)
        message.react('👎')
        return 
    }


    if(config.settings.maintenance === true && !message.member.roles.cache.has(config.roleID.administrator)) return
    if(!message.content.toLowerCase().startsWith(config.bot.prefix) || message.author.bot) return;
    if(message.content.length <= config.bot.prefix.length) return 

    const args = message.content.slice(config.bot.prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
    try{
   
         if(cmd === 'staff'){
            if(!message.member.roles.cache.has(config.roleID.support || config.roleID.admin )) return
            try{
                if(!args[0]) return require('../commands/staff/help.js')(client, message, args)
                await console.log(chalk.red(`[#${message.channel.name}]`) + chalk.yellow(` ${message.author.tag} (${message.author.id})`) + chalk.green(` ${message.content}`))
                require(`../commands/staff/${args[0]}.js`)(client, message, args)
            }catch(err){console.log(err).toString()}
            return
        }else if(cmd === 'music'){
            try{
                if(!args[0]) return require('../commands/music/help.js')(client, message, args)
                await console.log(chalk.red(`[#${message.channel.name}]`) + chalk.yellow(` ${message.author.tag} (${message.author.id})`) + chalk.green(` ${message.content}`))
                require(`../commands/music/${args[0]}.js`)(client, message, args)
            }catch(err){console.log(err).toString()}
            return
        }


        if(!command) return
        await console.log(chalk.red(`[#${message.channel.name}]`) + chalk.yellow(` ${message.author.tag} (${message.author.id})`) + chalk.green(` ${message.content}`))
        command.run(client, message, args);
    }catch(err){}
}
