import { CommandInteraction, CommandInteractionOptionResolver, PermissionsString, StringSelectMenuInteraction } from 'discord.js';
import { CH, CustomClient, ExtendedHandlerOptions, GuildStructureType, SlashCommandsType } from '../data/typings';
import { createEmoji, errorHandlerMenu, quickCollector } from '../modules/utils';
import getEmojis from '../data/emojis';

export default {
	name: 'updates',
	description: 'View all available updates from System Updates.',
	bot_premissions: ['ReadMessageHistory', 'EmbedLinks', 'ViewChannel', 'SendMessages'],
	user_permissions: ['ManageGuild'],
	options: [{
		name: 'channel',
		description: 'To which channel would you like to follow updates?',
		type: 7,
		required: true,
		channel_types: [0, 5, 10, 11, 12],
	}, {
		name: 'hidden',
		description: 'Would you like to make your configuration private?',
		type: 5,
		required: false,
	}],

	run: async (client: CustomClient, interaction: CommandInteraction) => {
		const hidden: boolean = (interaction.options as CommandInteractionOptionResolver).getBoolean('hidden') as boolean;
		await interaction.deferReply({ ephemeral: hidden ?? false });

		const channel = (interaction.options as CommandInteractionOptionResolver).getChannel('channel');

		await updatesHandlerExtended({
			client, interaction, slashData: {
				channelId: channel?.id as string,
			},
		});
	},
} as SlashCommandsType;

async function updatesHandlerExtended({ client, interaction, slashData }: ExtendedHandlerOptions): Promise<void> {
	const DBGuild = await client._data?.getData({ guild: interaction.guildId }, true);
	let list = '', perms = '';

	if (!slashData?.channels) slashData.channels = DBGuild?.channels || {} as GuildStructureType['channels'];
	const listOfItemsThatHaveChannel: string[] = [], listOfItemsThatDontHaveChannel: string[] = [];

	Object.entries(slashData.channels as GuildStructureType['channels'] || {})?.forEach(([key, value]: [string, string[]]) => {
		if (value?.includes(slashData?.channelId)) listOfItemsThatHaveChannel.push(key);
		if (value?.includes(slashData?.channelId)) listOfItemsThatDontHaveChannel.push(key);

		if (slashData?.channels?.[key as CH]?.includes(slashData?.channelId)) list += `+ ${client.functions?.channelName(key)}\n`;
	});

	const options = client.functions?.selectOptions(listOfItemsThatHaveChannel);

	const missingPerms = interaction.guild?.members.me?.permissionsIn(slashData.channelId).missing(['ViewChannel', 'SendMessages', 'EmbedLinks', 'ReadMessageHistory', 'AttachFiles', 'UseExternalEmojis']);
	if ((missingPerms?.length || 0) > 0) perms = `${getEmojis('fromMyServer.warn')} Missing permissions (<#${slashData.channelId}>): ${missingPerms?.map((perm: PermissionsString) => `\`${perm}\``).join(', ')}.`;

	await quickCollector(interaction, {
		embeds: [{
			title: 'System Updates • Current Updates',
			color: client.config?.embed.base_color,
			thumbnail: {
				url: client.user?.displayAvatarURL() as string,
			},
			description: `> Currently followed updates in <#${slashData?.channelId}>.\n> Use menu below to add or remove updates.\n\n\`\`\`md\n${list?.length < 1 ? '+ No Updates Following' : list}\`\`\`\n\n${perms}`,
		}],
		components: [{
			type: 1,
			components: [{
				type: 3,
				customId: 'options',
				options: options,
				placeholder: 'Manage Followed Updates',
				minValues: 0,
				maxValues: options?.length ?? 1,
			}],
		}, {
			type: 1,
			components: [{
				type: 2,
				style: 3,
				label: 'Save & Exit',
				emoji: createEmoji('fromMyServer.correct'),
				custom_id: 'save',
			}, {
				type: 2,
				style: 5,
				label: 'Support Server',
				emoji: createEmoji('fromMyServer.link'),
				url: client.config?.link.support as string,
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
	}, async (click) => {
		if (click === 1) return; if (!click) return errorHandlerMenu(client, interaction);

		switch (click.customId) {
			case 'options': {
				click.deferUpdate().catch((): unknown => null);

				if ((click as StringSelectMenuInteraction)?.values?.length < 1 && slashData?.channels) {
					Object.keys(slashData?.channels as GuildStructureType['channels']).forEach((key: string) => {
						if (slashData.channels?.[key as CH]) slashData.channels[key as CH] = slashData.channels?.[key as CH]?.filter((channel: string) => (channel !== slashData?.channelId)) as string[];
					});
				} else {
					Object.entries(slashData?.channels || {}).forEach(([key, value]: [string, string[]]) => {
						if (value?.includes(slashData?.channelId) && slashData?.channels?.[key as CH]) {
							slashData.channels[key as CH] = slashData.channels[key as CH].filter((channel: string) => (channel !== slashData?.channelId));
						}
					});

					(click as StringSelectMenuInteraction).values.forEach((value: string) => {
						if (slashData.channels?.[value as CH]) {
							slashData.channels[value as CH] = slashData.channels[value as CH] ?? [];
							slashData.channels[value as CH].push(slashData?.channelId);
						} else slashData.channels = { ...slashData.channels, [value as CH]: [slashData?.channelId] } as GuildStructureType['channels'];
					});
				}

				await updatesHandlerExtended({ client, interaction, slashData });
				break;
			}
			case 'save': {
				click.deferUpdate().catch((): unknown => null);

				await client._data?.updateData({ guild: interaction.guildId as string }, { channels: slashData?.channels });

				await interaction.editReply({
					content: getEmojis('fromMyServer.correct') + ' • Successfully exited the menu.',
					components: [], embeds: [],
				}).catch(() => null);

				break;
			}
		}
	});
}