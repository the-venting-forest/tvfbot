import { RichEmbed } from 'discord.js';
import User from '../models/user';

/*
.......##.......##....####..######...#######..##..........###....########.########
......##.......##......##..##....##.##.....##.##.........##.##......##....##......
.....##.......##.......##..##.......##.....##.##........##...##.....##....##......
....##.......##........##...######..##.....##.##.......##.....##....##....######..
...##.......##.........##........##.##.....##.##.......#########....##....##......
..##.......##..........##..##....##.##.....##.##.......##.....##....##....##......
.##.......##..........####..######...#######..########.##.....##....##....########
*/
export const command: Command = {
    run: async (client, msg) => {
        await msg.delete();

        // get the tagged member
        const member = msg.mentions.members.first();
        if (!member) return msg.author.send('you had to mention a user in order to isolate them.');

        // get the member's document from the database
        const doc = await User.findOne({ id: member.user.id }, (err, res) => {
            if (err) return console.error(err);

            return res;
        });

        if (!doc.isolation.isolated) {
            // get an array of the member's roles
            const roles = member.roles.map(r => r.id);

            // remove the roles from the member
            await roles.forEach(role => role !== client.config.isolatedRole ? member.removeRole(role, 'Isolated.').catch(() => console.error('Rate limited.')) : null);

            // give the member the isolated role
            member.addRole(client.config.isolatedRole, 'Isolated.');

            // update and save the document
            doc.isolation.roles = roles;
            doc.isolation.isolated = true;

            doc.save().catch(error => console.error(error));

            // alert the staff
            const embed = new RichEmbed()
                .setColor('RED')
                .setTitle('Isolated')
                .setDescription(`${member.user.tag} has been isolated.`)
                .addField('Target', member.user, true)
                .addField('Isolated by', msg.author, true)

            client.channels
                .find(c => c.id === '453195365211176960')
                // @ts-ignore
                .send(embed);

            // post a message in the isolated channel
            return client.channels
                .find(c => c.id === '586251824563224576')
                // @ts-ignore
                .send(`Hey there, ${member.user}. You have been isolated. Don't worry - this doesn't necessarily mean that you have done anything wrong. We have put you here in order to help you calm down if you're feeling bad, or if you are bringing harm to other members of the server. Within this channel there is only you and the staff - feel free to talk to them.`)
        } else {
            // get the roles from the database
            const roles = doc.isolation.roles;

            // add all of the roles to the member
            roles.forEach(role => member.addRole(role, 'Un-isolated.').catch(() => console.error('Rate limited.')));

            // remove the isolated role from the member
            member.removeRole(client.config.isolatedRole, 'Un-isolated.');

            // update and save the document
            doc.isolation.roles = [];
            doc.isolation.isolated = false;

            // alert the staff
            const embed = new RichEmbed()
                .setColor('GREEN')
                .setTitle('Unisolated')
                .setDescription(`${member.user.tag} has been unisolated by ${msg.author}`);

            client.channels
                .find(c => c.id === '453195365211176960')
                // @ts-ignore
                .send(embed);

            return doc.save().catch(error => console.error(error));
        }
    },
    config: {
        name: 'isolate',
        description: 'Isolates a user!',
        mod: true
    }
}