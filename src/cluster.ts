import Discord, { GatewayIntentBits, ActivityType, APISelectMenuOption, Options } from 'discord.js';
import { CustomClient, SlashCommandsType } from './data/typings';
import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import { CustomCacheFunctions } from './modules/utils';
import LoggerModule from './modules/logger';
import getEmojis from './data/emojis';
import { readdirSync } from 'node:fs';
import config from './data/config';
import path from 'node:path';

/* ----------------------------------- Client ----------------------------------- */

const client: CustomClient = new Discord.Client({
	shards: getInfo().SHARD_LIST,
	shardCount: getInfo().TOTAL_SHARDS,
	allowedMentions: {
		parse: [],
	},
	presence: {
		status: 'dnd',
		activities: [{
			name: 'gears booting up..',
			type: ActivityType.Watching,
		}],
	},
	intents: [
		GatewayIntentBits.Guilds,
	],
	makeCache: Options.cacheWithLimits({
		AutoModerationRuleManager: 0,
		ApplicationCommandManager: 0,
		BaseGuildEmojiManager: 0,
		GuildEmojiManager: 0,
		GuildMemberManager: 0,
		GuildBanManager: 0,
		GuildForumThreadManager: 0,
		GuildInviteManager: 0,
		GuildScheduledEventManager: 0,
		GuildStickerManager: 0,
		GuildTextThreadManager: 0,
		MessageManager: 0,
		PresenceManager: 0,
		ReactionManager: 0,
		ReactionUserManager: 0,
		StageInstanceManager: 0,
		ThreadManager: 0,
		ThreadMemberManager: 0,
		UserManager: 0,
		VoiceStateManager: 0,
	}),
});

/* ----------------------------------- Sharding ----------------------------------- */

client.cluster = new ClusterClient(client);

/* ----------------------------------- Loading ----------------------------------- */

getEmojis(undefined, false, (data) => { client.emoji = data; });

client.config = config;
client.database = { State: true };
client.slashCommands = new Map();
client._data = CustomCacheFunctions;

client.followArray = Object.entries(config.follow_channels).map(([key, value]) => {
	return { key: key, value: value };
});

client.functions = {
	error: (err: unknown) => {
		LoggerModule('Client Error', 'Check Below:', 'red'); console.error(err);
	},
	channelName: (channel: string) => {
		switch (channel) {
			case 'testing_channel': return 'Testing Channel Updates';

			case 'partners_community': return 'Discord Partners Community';
			case 'partners_product': return 'Discord Partners Product';

			case 'dac_general': return 'Discord Admin Community Important Updates';
			case 'dac_peer': return 'Discord Admin Community Peer Events';

			case 'townhall_hq': return 'Discord Townhall HQ';
			case 'discord_status': return 'Discord Status Updates';
			case 'discord_youtube': return 'Discord Youtube Videos';
			case 'discord_twitter': return 'Discord Twitter Posts';

			case 'developers_api': return 'Discord Developers API';
			case 'developers_server': return 'Discord Developers Server';
			case 'developers_github': return 'Discord Developers Github';

			case 'testers_server': return 'Discord Testers Server';
			case 'testers_discord': return 'Discord Testers Discord';

			case 'api_news': return 'Discord API News';
			case 'displace_news_blog': return 'Displace News Blog';
			case 'games_updates': return 'Discord Games Updates';

			case 'updates_datamining': return 'Datamining Updates';
			case 'community_architects': return 'Community Architects';

			case 'netcord_articles': return 'Netcord Articles';
			case 'wholesome_posts': return 'Wholesome Posts';

			case 'waya_news': return 'Waya™ News';
			default: return 'Unknown Channel';
		}
	},
	selectOptions: (SlashChannels: string[]) => {
		const options: APISelectMenuOption[] = [];

		client?.channelArray?.forEach((key: string) => {
			options.push({
				label: client.functions?.channelName(key) || key,
				value: key,
				default: !!SlashChannels?.includes(key),
				emoji: {
					name: client.emoji?.main.icons_enable?.split(':')[1],
					id: client.emoji?.main.icons_enable?.split(':')[2].replace('>', ''),
				},
			});
		});

		return options;
	},
	createArray: () => {
		const array: string[] = [];

		Object.keys(client.config?.follow_channels as { [x: string]: string }).forEach((key) => {
			if (key === 'testing_channel' && client.config?.dev.mode) array.push(key);
			else if (key !== 'testing_channel') array.push(key);
		});

		return array;
	},
	getCommand: (name: string) => {
		const command = client.slashCommands?.get(name);
		return command?.id ? `</${command.name}:${command.id}>` : `\`/${name}\``;
	},
};

client.channelArray = client.functions?.createArray();

/* ----------------------------------- Handlers ----------------------------------- */

try {
	readdirSync(path.join(__dirname, 'commands')).filter((file: string) => file.endsWith('.js')).map(async (command: string) => {
		const pull: SlashCommandsType = await import(path.join(__dirname, 'commands', command)).then((command) => command.default);

		if (pull?.name) client?.slashCommands?.set(pull.name, pull);
	});
} catch (error: unknown) {
	client.functions?.error(error);
}

try {
	readdirSync(path.join(__dirname, 'events')).filter((file: string) => file.endsWith('.js')).map(async (file: string) => {
		const pull = await import(path.join(__dirname, 'events', file)).then((event) => event.default);

		if (pull.options?.emit) {
			const argumentsFunction = (...args: unknown[]) => pull.run(client, ...args);

			if (pull.options.once) client.once(pull.name, argumentsFunction);
			else client.on(pull.name, argumentsFunction);
		}
	});
} catch (error: unknown) {
	client.functions?.error(error);
}

/* ----------------------------------- Exports & Errors ----------------------------------- */

client.rest.on('rateLimited', (info: { timeToReset: number; limit: string | number; global: boolean; route: string; url: string; method: string; }) => {
	LoggerModule('Ratelimit', `Below:\n- Timeout: ${info.timeToReset}\n- Limit: ${info.limit}\n- Global: ${info.global ? 'True' : 'False'}\n- Route: ${info.route}\n- Path: ${info.url}\n- Method: ${info.method}\n`, 'yellow');
});

export default client;
client.login(config.bot.token);

/* ----------------------------------- End ----------------------------------- */
