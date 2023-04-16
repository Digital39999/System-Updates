import { AllInteractionTypes, CustomClient, EventType } from '../data/typings';
import { PermissionsBitField } from 'discord.js';
import { catchClientError } from '../cluster';

export default {
	name: 'interactionCreate',
	options: {
		emit: true,
		once: false,
	},

	run: async (client: CustomClient, interaction: AllInteractionTypes) => {
		if (interaction.isChatInputCommand()) {
			const command = client.slashCommands?.data?.get(interaction.commandName);

			if (!command) return interaction.reply({
				content: client.emoji?.fromMyServer.error + ` • I cannot find that command in my cache, [contact](${client.config?.link.support}) developers for help.`,
				ephemeral: true,
			});

			if (!interaction.guild && interaction.commandName !== 'help') return interaction.reply({
				content: client.emoji?.fromMyServer.error + ' • Guild only command.',
				ephemeral: true,
			});

			try {
				if (command?.permissions?.user) if (!(interaction.member?.permissions as PermissionsBitField)?.has(command?.permissions?.user) && !client.config?.dev.users.includes(interaction.user.id)) return interaction.reply({
					content: client.emoji?.fromMyServer.error + ` • You need \`${(command?.permissions?.user as unknown as string[]).join(', ')}\` permission(s) to use this command.`,
					ephemeral: true,
				});

				if (command?.permissions?.client) if (!interaction.guild?.members.me?.permissions.has(command?.permissions?.client)) return interaction.reply({
					content: client.emoji?.fromMyServer.error + ` • I need \`${(command?.permissions?.client as unknown as string[])?.join(', ')}\` permission(s) to display this command.`,
					ephemeral: true,
				});

				if (command?.run) await command.run(client, interaction);
			} catch (error: unknown) {
				if (error?.toString().includes('Unknown')) return;
				else catchClientError(error as Error);

				try {
					return interaction.reply({
						content: client.emoji?.fromMyServer.error + ` • Error while loading command, please [contact](${client.config?.link.support}) developer.`,
						ephemeral: true,
					});
				} catch {
					return interaction.editReply({
						content: client.emoji?.fromMyServer.error + ` • Error while loading command, please [contact](${client.config?.link.support}) developer.`,
					});
				}
			}
		}

		if (interaction.isButton()) {
			if (interaction.customId === 'help_tutorial') return interaction.reply({
				content: client.emoji?.fromMyServer.correct + ' • ' + client.config?.link.tutorial,
				ephemeral: true,
			});
		}
	},
} as EventType;
