export default {
  name: 'hug',
  description: 'Hug another user in the server',
  module: 'Fun',
  args: true,
  usage: 'hug <@user>',
  examples: ['hug @newt#1234'],
  run: async (tvf, msg, args) => {
    // find the mentioned member
    const member = tvf.checkForMember(msg, args).user;

    // make the embed
    const embed = tvf.createEmbed({ thumbnail: false })
      .setThumbnail(member.avatarURL())
      .setImage((await tvf.ksoft.images.random('hug', { nsfw: false})).url)
      .setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL());

    // if the mentioned user was the author
    if (member === msg.author) return msg.channel.send(embed.setTitle(`${msg.author.username} hugged themselves ${tvf.emojis.hug}`));

    // if the mentioned user was the bot
    if (member === tvf.bot.user) return msg.channel.send(embed.setTitle(`${msg.author.username} hugged me ${tvf.emojis.hug}`));

    // else
    return msg.channel.send(embed.setTitle(`${msg.author.username} hugged ${member.username} ${tvf.emojis.hug}`));
  }
} as Command;
