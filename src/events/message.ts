import * as Discord from 'discord.js';
import Client from '../Client';
import _ from 'lodash';

export default async (tvf: Client, msg: Discord.Message) => {
	// ignore messages from other bots
	if (msg.author.bot) return undefined;

 	// helper ping
	if (msg.mentions.roles.first() && msg.mentions.roles.first().id === tvf.const.roles.community.helper.id && msg.channel.id != tvf.const.channels.community.helper.id && tvf.isProduction) {
		const embed = tvf.createEmbed()
			.setTitle(`${msg.author.username} needs help!`)
			.addFields([
				{
					name: 'Where?',
					value: `<#${msg.channel.id}>`,
				},
				{
					name: 'Message',
					value: _.truncate(msg.content, { length: tvf.embedLimit.field.value }),
				},
			]);

		tvf.const.channels.community.helper.send(embed);

		return msg.reply(
			`Please wait, a helper will arrive shortly. If it's an emergency, call the number in <#${tvf.const.channels.resources}>. You can also request a one-on-one private session with a staff by using the \`tvf private\` command in any channel. If possible, please do provide a reason by typing the reason after the command.`,
		);
	}

	// prefix matching
	const prefixRegex = new RegExp(`^(<@!?${tvf.user.id}> |${_.escapeRegExp(tvf.prefix)})\\s*`);
	const prefix = msg.content.toLowerCase().match(prefixRegex) ? msg.content.toLowerCase().match(prefixRegex)[0] : null;

	if (prefix) {
		// get the args and command name
		const args = msg.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();

		// find the command
		const command = tvf.commands.get(commandName) || tvf.commands.find(c => c.aliases && c.aliases.includes(commandName));
		if (!command) return undefined;

	    // checks
		if (command.staffAccess) {
			let access = [];
			command.staffAccess.forEach(role => access.push(tvf.isUser(role, msg.member)));

			if (!access.includes(true)) {
				return msg.channel.send(tvf.emojiMessage(tvf.const.emojis.cross, 'You are not allowed to run that command!'));
			}
		}

		// if a command isn't allowed to be run in general, delete the message
		if (!command.allowGeneral && msg.channel.id === tvf.const.channels.general.id) {
			await msg.delete();
			return msg.author.send(tvf.emojiMessage(tvf.const.emojis.cross, 'You can not run that command in general!'));
		}

		// if there are certain permissions required to run a command
		if (command.permissions) {
			let missingPermissions = [];

			// for every permission listed, check if the user has it
			for (let i = 0; i < command.permissions.length; i++) {
				if (!msg.member.hasPermission(command.permissions[i])) missingPermissions.push(command.permissions[i]);
			}

			// if there are any permissions missing, inform the user
			if (missingPermissions.length > 0) {
				const list = msg.member.permissions.toArray();

				let newList: string[] = [];
				for (let perm of list) {
					newList.push(tvf.const.friendlyPermissions[perm]);
				}

				msg.author.send(tvf.emojiMessage(tvf.const.emojis.grimacing, `You are missing these permissions in **${tvf.server.name}** to run **${command.name}**\n\`\`\`${newList.join('\n')}\`\`\``));
				return msg.channel.send(tvf.emojiMessage(tvf.const.emojis.grimacing, 'You do not have permission to run that command! I have sent you a DM containing all of the permissions you are missing.'));
			}
		}

		// if the command requires arguments but hasn't been given any
		if (command.args && args.length === 0) {
			let reply = tvf.emojiMessage(tvf.const.emojis.cross, 'You did not provide any arguments!');

			// if the usage is listed for the command, append it to the reply
			if (command.usage) {
				reply += `\n**${tvf.const.emojis.square}  |**  The correct usage would be: \`${prefix}${command.usage}\``;
			}

			return msg.channel.send(reply);
		}

		// execute the command
		try {
			return command.run(tvf, msg, args, { prefix });
		}
		catch (error) {
			tvf.logger.error(error);
			return msg.reply(
				'there was an error trying to execute that command.',
			);
		}
	} else {
		if (tvf.config.levelling && !tvf.talkedRecently.has(msg.author.id)) {
			const doc = await tvf.userDoc(msg.author.id); // get the user's document
			doc.xp += Math.floor(Math.random() * 25) + 15; // 15-25 xp per message

			// level up!
			if (doc.xp >= tvf.xpFor(doc.level + 1)) {
				doc.level++;
				msg.author.send(`Congratulations! Your magical ability has advanced to **Level ${doc.level}** in The Venting Forest!`);
			}

			tvf.saveDoc(doc);

			if (doc.level % 2 === 0 && doc.level <= 100) {
				const newRole = tvf.const.levelRoles.find(r => r.level === doc.level);
				const oldRole = tvf.const.levelRoles[tvf.const.levelRoles.indexOf(newRole) - 1];

				const member = msg.guild.member(msg.author.id);
				if (doc.level !== 2) member.roles.remove(oldRole.role, `Levelled up to ${newRole.level}!`);
			 	member.roles.add(newRole.role, `Levelled up to ${newRole.level}!`);
			}

			// put them on timeout for a minute
			if (msg.author.id !== tvf.const.roles.other.kaizen.members.first().id) tvf.talkedRecently.add(msg.author.id);
			setTimeout(() => tvf.talkedRecently.delete(msg.author.id), 60000);
		}
	}
};
