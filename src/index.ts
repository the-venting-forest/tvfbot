// imports
import { Client, RichEmbed } from 'discord.js';
import { config as dotenv } from 'dotenv';
import { BotClient } from './interfaces';

// dotenv
dotenv();

/*
.......##.......##.....######..########.########.##.....##.########.
......##.......##.....##....##.##..........##....##.....##.##.....##
.....##.......##......##.......##..........##....##.....##.##.....##
....##.......##........######..######......##....##.....##.########.
...##.......##..............##.##..........##....##.....##.##.......
..##.......##.........##....##.##..........##....##.....##.##.......
.##.......##...........######..########....##.....#######..##.......
*/
// @ts-ignore
const client: BotClient = new Client();

client.config = {
    // config
    prefix: 'tvf ',

    // authentication
    token: process.env.DISCORD
};

client.login(client.config.token);

// events
client.on('ready', () => {
    client.user.setActivity('over you cuties <3', {
        type: 'WATCHING'
    });

    return console.log('I am ready.');
});

client.on('message', msg => {
    // ignore messages from other bots
    if (msg.author.bot) return undefined;

    /*
    .......##.......##.....######...#######..##.....##.##.....##....###....##....##.########...######.
    ......##.......##.....##....##.##.....##.###...###.###...###...##.##...###...##.##.....##.##....##
    .....##.......##......##.......##.....##.####.####.####.####..##...##..####..##.##.....##.##......
    ....##.......##.......##.......##.....##.##.###.##.##.###.##.##.....##.##.##.##.##.....##..######.
    ...##.......##........##.......##.....##.##.....##.##.....##.#########.##..####.##.....##.......##
    ..##.......##.........##....##.##.....##.##.....##.##.....##.##.....##.##...###.##.....##.##....##
    .##.......##...........######...#######..##.....##.##.....##.##.....##.##....##.########...######.
    */
    if (msg.content.startsWith(client.config.prefix)) {
        // get the args and command name
        const args = msg.content.slice(client.config.prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();
        if (commandName === 'ping') {
            return msg.reply('pong!');
        }
    }

    /*
    .......##.......##....########.########..####..######....######...########.########...######.
    ......##.......##........##....##.....##..##..##....##..##....##..##.......##.....##.##....##
    .....##.......##.........##....##.....##..##..##........##........##.......##.....##.##......
    ....##.......##..........##....########...##..##...####.##...####.######...########...######.
    ...##.......##...........##....##...##....##..##....##..##....##..##.......##...##.........##
    ..##.......##............##....##....##...##..##....##..##....##..##.......##....##..##....##
    .##.......##.............##....##.....##.####..######....######...########.##.....##..######.
    */
    if (msg.mentions.roles.first() && msg.mentions.roles.first().id === '481130628344184832') {
        msg.reply('stay put, a helper will arive shortly.');

        const helperChannel = client.channels.find(c => c.id === '471799568015818762');
        const embed = new RichEmbed();
        
        embed
            .setTitle('Help Requested!')
            .setDescription(`${msg.author} needs help!`)
            .setColor('RANDOM')
            .addField('Where?', msg.channel, true)
            .addField('Message:', msg.content.replace(`<@&${msg.mentions.roles.first().id}>`, ''), true);

        // @ts-ignore
        return helperChannel.send(embed);
    }
});