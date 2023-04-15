import { ActionTypes, ConfigType, ConnectionState, CustomManager, GuildStructureType } from './data/typings';
import { Cluster, ClusterManager, HeartbeatManager } from 'discord-hybrid-sharding';
import LoggerModule, { LoggerBoot } from './modules/logger';
import { convertObjectIdsToStrings } from './modules/utils';
import connectMongoose from './modules/database';
import DataManager from './modules/dataManager';
import GatewayClient from './modules/gateway';
import { ObjectId } from 'mongoose';
import config from './data/config';

/* ----------------------------------- Process ----------------------------------- */

process.env.NODE_NO_WARNINGS = '1';
process.on('warning', (warning) => catchError(warning));
process.on('uncaughtException', (error) => catchError(error));
process.on('unhandledRejection', (error) => catchError(error as Error));

/* ----------------------------------------- Logging ----------------------------------------- */

console.clear(); LoggerBoot(); LoggerModule('Client', 'System Updates is booting up.. please wait..', 'cyan');
config.dev.mode ? LoggerModule('Client', 'Developer mode is enabled, some features may not work properly.\n', 'cyan') : console.log('\n');

/* ----------------------------------- Manager ----------------------------------- */

const manager: CustomManager = new ClusterManager(`${__dirname}/cluster.js`, {
	token: config.bot.token,
	totalShards: config.sharding.shards,
	totalClusters: config.sharding.clusters,
	shardsPerClusters: config.sharding.shardsPerCluster,
	mode: 'worker',
}) as CustomManager;

manager.extend(new HeartbeatManager({
	interval: 30000, // 30 seconds
	maxMissedHeartbeats: 5,
}));

/* ----------------------------------- Database ----------------------------------- */

async function mongoCheck(manager: CustomManager) {
	await connectMongoose(manager).then((Mongo: { State: boolean; Connection: ConnectionState | null; }) => {
		if (!Mongo.State) {
			LoggerModule('Database', 'Failed to connect to the database, shutting down..', 'red', true); process.exit(1);
		}

		manager.database = { State: Mongo.State, Connection: Mongo.Connection };
	});
}

export default manager;

/* ----------------------------------- Utils ----------------------------------- */

startLoading(manager);

async function startLoading(manager: CustomManager) {
	await mongoCheck(manager);

	manager._data = new DataManager(manager);
	manager.gatewayClient = new GatewayClient();

	setTimeout(() => loadClusters(manager), 3000); // 3 seconds
}

export function catchError(error: Error) {
	if (error?.name?.includes('ExperimentalWarning') || error?.name?.includes('Unknown interaction')) return;

	LoggerModule('Client', 'An error has occurred.', 'red');
	console.error(error);
}

export async function evalExecute(code: string) {
	try {
		const result = function (str: string) { return eval(str); }.call(manager, code);
		return JSON.stringify(result, null, 5);
	} catch (error) {
		if (typeof error === 'string') return error;
		if (error instanceof EvalError) return `EvalError: ${error.message}`;

		try {
			return error?.toString();
		} catch (e) {
			return 'Failed to get error message, check console for more information.';
		}
	}
}

/* ----------------------------------- Internal ----------------------------------- */

manager.followArray = Object.entries(config.follow_channels).map(([key, value]) => {
	return { key: key as keyof ConfigType['follow_channels'], value: value as string };
});

/* ----------------------------------- Clusters ----------------------------------- */

async function loadClusters(manager: CustomManager) {
	let clusterReadyCounter = 0;
	const clusterDiedCounter: { [x: string]: number } = {};

	manager.on('clusterCreate', (cluster: Cluster) => {
		LoggerModule('Clusters', `Launched Cluster ${cluster.id}.`, 'yellow');

		cluster.on('ready', () => {
			clusterReadyCounter++;

			if (clusterReadyCounter === config.sharding.shards) {
				setTimeout(() => {
					LoggerModule('Standby', 'All clusters are ready, Logging:\n', 'white', true);
				}, 1200);
			}
		});

		cluster.on('reconnecting', () => {
			LoggerModule('Clusters', `Cluster ${cluster.id} is reconnecting.`, 'yellow');
		});

		cluster.on('disconnect', async () => {
			LoggerModule('Clusters', `Cluster ${cluster.id} disconnected.`, 'red');

			if (!clusterDiedCounter[cluster.id]) clusterDiedCounter[cluster.id] = 0; clusterDiedCounter[cluster.id]++;
			if (clusterDiedCounter[cluster.id] < 3) await cluster.respawn().catch(() => LoggerModule('Clusters', `Failed to respawn cluster ${cluster.id}.`, 'red'));
		});

		cluster.on('error', async (error) => {
			LoggerModule('Clusters', `Error on cluster ${cluster.id}.`, 'red'); catchError(error);

			if (!clusterDiedCounter[cluster.id]) clusterDiedCounter[cluster.id] = 0; clusterDiedCounter[cluster.id]++;
			if (clusterDiedCounter[cluster.id] < 3) await cluster.respawn().catch(() => LoggerModule('Clusters', `Failed to respawn cluster ${cluster.id}.`, 'red'));
		});

		cluster.on('death', async () => {
			LoggerModule('Clusters', `Cluster ${cluster.id} died.`, 'red');

			if (!clusterDiedCounter[cluster.id]) clusterDiedCounter[cluster.id] = 0; clusterDiedCounter[cluster.id]++;
			if (clusterDiedCounter[cluster.id] < 3) await cluster.respawn().catch(() => LoggerModule('Clusters', `Failed to respawn cluster ${cluster.id}.`, 'red'));
		});

		cluster.on('message', async (message) => {
			if ((message as object & { raw: { cachePassword: string }})?.raw?.cachePassword) {
				const messageRaw = (message as object & { raw: { cachePassword: string; actionType: ActionTypes; inputDataOptions: Partial<GuildStructureType>; arg1: boolean; arg2: boolean; dataToUpdate: Partial<GuildStructureType>; }}).raw;
				let outputData = null;

				switch (messageRaw.actionType as ActionTypes) {
					case 'createData': { outputData = await manager._data?.createData(messageRaw.inputDataOptions); break; }
					case 'getData': { outputData = await manager._data?.getData(messageRaw.inputDataOptions, messageRaw.arg1); break; }
					case 'deleteData': { outputData = await manager._data?.deleteData(messageRaw.inputDataOptions, messageRaw.arg1); break; }
					case 'updateData': { outputData = await manager._data?.updateData(messageRaw.inputDataOptions, messageRaw.dataToUpdate); break; }
					case 'getAllData': { outputData = await manager._data?.getAllData(messageRaw.inputDataOptions, messageRaw.arg1, messageRaw.arg2); break; }
				}

				try {
					return (message as object & { reply: (data: { password: string, data: string | null }) => void }).reply({ password: messageRaw.cachePassword, data: JSON.stringify((typeof outputData === 'object' && (outputData as unknown as { _id: ObjectId })?._id) ? convertObjectIdsToStrings(outputData) : outputData) });
				} catch (error) {
					LoggerModule('Manager', 'Error while trying to send data.', 'red'); console.error(error);
					return (message as object & { reply: (data: { password: string, data: string | null }) => void }).reply({ password: messageRaw.cachePassword, data: null });
				}
			}
		});
	});

	manager.spawn({ timeout: -1, delay: 7000 }).then(() => {
		setInterval(() => manager.broadcastEval('this.ws.status && this.isReady() ? this.ws.reconnect() : 0'), 300000);
	});
}

/* ----------------------------------- End Of File ----------------------------------- */
