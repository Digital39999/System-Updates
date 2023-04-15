import { clusterIdOfGuildId } from './hybridUtils';
import { APIEmbed } from 'discord.js';
import config from '../data/config';
import LoggerModule from './logger';
import manager from '../index';

export async function sendCrossPost(message: { content: string; embeds: APIEmbed[]; files: string[]; channelId: string; }) {
	const typeFromId = manager.followArray?.find((obj) => obj.value === message.channelId);
	if (!typeFromId) return null;

	const DBGuilds = await manager._data?.getAllData({
		['channels.' + typeFromId.key]: { $exists: true, $ne: [] },
	}, true);

	if (!DBGuilds?.length) return null;

	const perClusters: { [cluster: string]: { guildId: string, channels: string[] }[] } = Object.fromEntries(Array.from({ length: manager.totalClusters }, (_, i) => [i, []]));

	for (const DBGuild of DBGuilds) {
		const cluster = clusterIdOfGuildId(DBGuild.guild, manager.totalClusters, manager.totalShards);

		if (typeof cluster !== 'number') LoggerModule('Crosspost', `Failed to get cluster of guild ${DBGuild.guild}!`, 'red', true);
		else perClusters[cluster].push({ guildId: DBGuild.guild, channels: DBGuild.channels[typeFromId.key] });
	}

	let sent = 0;

	for (const [cluster, DBGuilds] of Object.entries(perClusters)) {
		if (!DBGuilds.length) continue;

		const check = await manager.clusters.get(Number(cluster))?.request({
			type: 'crosspost',
			data: {
				DBGuilds,
				message: message,
				type: typeFromId.key,
			},
		}) as { data: number, type: string };

		if (check.data) sent += check.data;
		else LoggerModule('Crosspost', `Failed to send crosspost to cluster ${cluster}!`, 'red', true);
	}

	if (config.dev.mode) LoggerModule('Crosspost', `Sent crosspost to ${sent}/${DBGuilds.length} guilds!`, 'green');
	return sent;
}
