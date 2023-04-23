import { CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { CustomClient } from '../data/typings';
import { createEmoji } from '../modules/utils';

export default {
	name: 'help',
	description: 'Show all information about System Updates, its commands, preview and demonstrations.',
	options: [{
		name: 'hidden',
		description: 'Would you like to make your configuration private?',
		type: 5,
	}],

	run: async (client: CustomClient, interaction: CommandInteraction) => {
		const hidden: boolean = (interaction.options as CommandInteractionOptionResolver).getBoolean('hidden') as boolean;
		await interaction.deferReply({ ephemeral: hidden ?? false });

		interaction.editReply({
			embeds: [{
				title: 'System Updates • Help',
				description: '> Hellow, im bot that can get you any Discord Updates.\n> Not sure how it looks like? Join our [support server](' + client.config?.link.support + ') and check it out!',
				color: client.config?.embed.base_color,
				thumbnail: {
					url: client.user?.displayAvatarURL() as string,
				},
				footer: { text: 'Please have in note that all channels are not specifically active 24/7.' },
				fields: [{
					name: client.emoji?.main.icons_search + ' • Commands',
					value: '> ' + client.functions?.getCommand('help') + ' • Spawns this help embed.\n> ' + client.functions?.getCommand('updates') + ' - Manage all updated channels.',
					inline: false,
				}, {
					name: client.emoji?.main.icons_gift + ' • Credits',
					value: '> Thanks to [Icons](https://blog.iconsdiscord.xyz/) for all icons used in commands.',
					inline: false,
				}],
			}],
			components: [{
				type: 1,
				components: [{
					type: 2,
					label: 'Invite Me',
					emoji: createEmoji('fromMyServer.link'),
					style: 5,
					url: client.config?.link.invite as string,
				}, {
					type: 2,
					label: 'Support Server',
					emoji: createEmoji('fromMyServer.link'),
					style: 5,
					url: client.config?.link.support as string,
				}, {
					type: 2,
					label: 'Upvote Me',
					emoji: createEmoji('fromMyServer.link'),
					style: 5,
					url: client.config?.link.topgg as string,
				}],
			}, {
				type: 1,
				components: [{
					type: 2,
					label: 'Website',
					emoji: createEmoji('fromMyServer.link'),
					style: 5,
					url: client.config?.link.website as string,
				}, {
					type: 2,
					label: 'Checkout Status Bot',
					emoji: createEmoji('fromMyServer.link'),
					style: 5,
					url: client.config?.link.status as string,
				}],
			}, {
				type: 1,
				components: [{
					type: 2,
					label: 'View Quick Setup Tutorial',
					emoji: createEmoji('fromMyServer.link'),
					style: 1,
					custom_id: 'help_tutorial',
				}],
			}],
		});
	},
};
