import { APISelectMenuOption, ApplicationCommandOptionType, ApplicationCommandType, ButtonInteraction, ChannelSelectMenuInteraction, ChatInputCommandInteraction, Client, ClientEvents, CommandInteraction, ContextMenuCommandInteraction, Message, MessageContextMenuCommandInteraction, ModalSubmitInteraction, PermissionResolvable, RoleSelectMenuInteraction, SelectMenuInteraction, UserSelectMenuInteraction } from 'discord.js';
import { ClusterClient, ClusterManager, DjsDiscordClient } from 'discord-hybrid-sharding';
import { CustomCacheFunctions } from '../modules/utils';
import DataManager from '../modules/dataManager';
import GatewayClient from '../modules/gateway';
import { EmojiType } from './emojis';

export type ConfigType = typeof import('./config').default;
export type GuildStructureType = import('./structures').inputGuildType;
export type ActionTypes = 'createData' | 'getData' | 'updateData' | 'deleteData' | 'getAllData';
export type ConnectionState = 'Disconnected' | 'Connected' | 'Connecting' | 'Disconnecting' | 'Uninitialized';
export type ExtendedHandlerOptions = { client: CustomClient; interaction: CommandInteraction; message?: Message; slashData: SlashData; };
export type AllInteractionTypes = CommandInteraction | ContextMenuCommandInteraction | ButtonInteraction | ModalSubmitInteraction | SelectMenuInteraction | ChatInputCommandInteraction | MessageContextMenuCommandInteraction | ChannelSelectMenuInteraction | UserSelectMenuInteraction | RoleSelectMenuInteraction;

export interface CustomManager extends ClusterManager {
	_data?: DataManager;

	followArray?: { key: keyof ConfigType['follow_channels']; value: string; }[]; // Array of channels to follow (key = channel name, value = channel id)
	gatewayClient?: GatewayClient;

	database?: {
		State?: boolean;
		Connection?: ConnectionState | null;
	}
}

export interface CustomError extends Error {
    reason?: string;
    msg?: string;
}

export interface CustomClient extends Client {
	config?: ConfigType;
	emoji?: EmojiType;

	cluster?: ClusterClient<DjsDiscordClient>;
	slashCommands?: { data: Map<string, SlashCommandsType>; reload?: (client: CustomClient) => void; }

	_data?: typeof CustomCacheFunctions;

	database?: {
		State: boolean;
		Connection?: string | null;
	}

	channelArray?: string[];
	followArray?: { key: string; value: string; }[];

	functions?: {
		channelName: (channel: string) => string;
		selectOptions: (slashChannels: string[]) => APISelectMenuOption[];
		createArray: () => string[];
		getCommand: (name: string) => string;
	}
}

export type EventType = {
	name: keyof ClientEvents & 'raw';
	options: {
		emit: boolean;
		once: boolean;
	}

	run: <T extends keyof ClientEvents>(client: CustomClient, ...args: ClientEvents[T]) => unknown;
}

export type TextCommandsType = {
	name: string;
	aliases?: string[];
	permissions?: {
		user?: PermissionResolvable[];
		client?: PermissionResolvable[];
	}

	run: (client: CustomClient, message: Message, args: string[]) => unknown;
}

export type SlashCommandsType = {
	id?: string;
	name: string;
	usage?: string;
	register?: boolean;
	type?: ApplicationCommandType;
	context?: boolean;
	default_permission?: number;
	description?: string;
	dm_permission?: boolean;
	options?: {
		name?: string;
		description?: string;
		required?: boolean;
		type?: ApplicationCommandOptionType;
		min_value?: number;
		max_value?: number;
		choices?: {
			name?: string;
			value?: string;
		}[];
	}[];
	permissions?: {
		user?: PermissionResolvable[];
		client?: PermissionResolvable[];
	}

	run?: (client: CustomClient, interaction: CommandInteraction | ContextMenuCommandInteraction) => unknown;
}

export type SlashData = {
    channels?: GuildStructureType['channels'];
    channelId: string;
}

export type CH = keyof GuildStructureType['channels']
