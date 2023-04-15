import { ActivityType, ApplicationCommand, ApplicationCommandDataResolvable, Collection, PermissionsBitField } from 'discord.js';
import { CustomClient, EventType, SlashCommandsType } from '../data/typings';
import { loadClientIPCMessages } from '../modules/listener';
import LoggerModule from '../modules/logger';

export default {
	name: 'ready',
	options: {
		emit: true,
		once: true,
	},

	run: async (client: CustomClient) => {
		LoggerModule(`Cluster ${client.cluster?.id}`, `Watching in ${client.guilds.cache.size} guilds.`, 'green');
		changeStatus(); setInterval(() => changeStatus(), 3600000);

		function changeStatus() {
			client.user?.setPresence({
				status: client.config?.dev.mode ? 'idle' : 'online',
				activities: [{
					name: client.config?.dev.mode ? `gears turning.. • ${client?.cluster?.id}` : `your services.. /help • ${client?.cluster?.id}`,
					type: ActivityType.Watching,
				}],
			});
		}

		await loadClientIPCMessages(client);

		if (!client.config?.dev.slash) LoggerModule(`Cluster ${client.cluster?.id}`, 'Slash commands are disabled.', 'grey');
		else {
			const interactionsData: SlashCommandsType[] = [];

			Array.from(client?.slashCommands?.values() || []).map((command: SlashCommandsType) => {
				const sendData: SlashCommandsType = { name: command.name };

				if (command?.context) {
					interactionsData.push({
						name: command.name,
						type: command.type,
					});
				} else if (command?.register !== false) {
					if (command.id) sendData.id = command.id;
					if (command.type) sendData.type = command.type;
					if (command.name) sendData.name = command.name;
					if (command.options) sendData.options = command.options;
					if (command.description) sendData.description = command.description;
					if (command.dm_permission) sendData.dm_permission = command.dm_permission || false;
					if (command.permissions?.user) sendData.default_permission = parseInt(new PermissionsBitField().add(command.permissions?.user).bitfield.toString());

					interactionsData.push(sendData);
				}
			});

			await client.application?.commands.set(interactionsData as ApplicationCommandDataResolvable[]).then((getOutput: Collection<string, ApplicationCommand>) => {
				getOutput.map((command: ApplicationCommand) => {
					const commandData: SlashCommandsType = client?.slashCommands?.get(command.name) as SlashCommandsType;
					if (!commandData) return;

					commandData.id = command.id; client?.slashCommands?.set(command.name, commandData);
				});
			});
		}
	},
} as EventType;
