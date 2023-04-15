import { Awaitable, evalOptions, Serialized } from 'discord-hybrid-sharding';
import { CustomClient, CustomManager } from '../data/typings';
import { ShardClientUtil } from 'discord.js';

/* ----------------------------------- General ----------------------------------- */

export function clusterIdOfShardId(shardId: number | undefined, totalClusters: number, totalShards: number): number | undefined {
	if (typeof shardId !== 'number' || shardId > totalShards) return;

	const middlePart = shardId === 0 ? 0 : Array.isArray(shardId) ? shardId[0] : shardId / Math.ceil(totalShards / totalClusters);
	return shardId === 0 ? 0 : (Math.ceil(middlePart) - (middlePart % 1 !== 0 ? 1 : 0));
}

export function clusterIdOfGuildId(guildId: string, totalClusters: number, totalShards: number): number | undefined {
	if (!guildId || !/^(?<id>\d{17,20})$/.test(guildId)) return;
	return clusterIdOfShardId(shardIdOfGuildId(guildId, totalShards), totalClusters, totalShards);
}

export function shardIdOfGuildId(guildId: string, totalShards: number): number | undefined {
	if (!guildId || !/^(?<id>\d{17,20})$/.test(guildId)) return;
	return ShardClientUtil.shardIdForGuildId(guildId, totalShards);
}

/* ----------------------------------- Manager ----------------------------------- */

export async function managerEvalOnGuild<T>(manager: CustomManager, callbackFunction: () => void, guildId: string, totalClusters: number, totalShards: number, options: evalOptions<T> = {}): Promise<unknown> {
	if (!guildId || !/^(?<id>\d{17,20})$/.test(guildId)) throw new Error('Provided GuildId, is not a valid GuildId');
	if (typeof options !== 'object') throw new Error('Provided Options, must be an object!');

	(options as object & { cluster: number | undefined}).cluster = clusterIdOfGuildId(guildId, totalClusters, totalShards);
	return await manager.broadcastEval(callbackFunction, options);
}

/* ----------------------------------- Client ----------------------------------- */

export async function clientEvalOnGuild<T, P>(client: CustomClient, callbackFunction: (client: CustomClient, context: Serialized<P>) => Awaitable<T>, guildId: string, totalClusters: number, totalShards: number, options: { context: P, cluster?: number }): Promise<Serialized<T>[]> {
	if (!guildId || !/^(?<id>\d{17,20})$/.test(guildId)) throw new Error('Provided GuildId, is not a valid GuildId');
	if (typeof options !== 'object') throw new Error('Provided Options, must be an object!');

	options.cluster = clusterIdOfGuildId(guildId, totalClusters, totalShards);
	return await client.shard?.broadcastEval<T, P>(callbackFunction, options) as Serialized<T>[];
}
