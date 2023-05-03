import { sendCrossPost } from './crosspost';
import { evalExecute } from '../index';
import { APIEmbed } from 'discord.js';
import config from '../data/config';
import LoggerModule from './logger';
import WebSocket from 'ws';

export type EventTypes = StripeEvents | 'systemMessage';
export type MessageTypes = 'shutdown' | 'restart' | 'auth' | 'requireReply' | 'eval' | 'raw';
export type StripeEvents = 'started' | 'ended' | 'canceled' | 'unpaid' | 'other' | 'oneTimePaid';
export type BaseMessage = { type: MessageTypes; subType?: EventTypes; data: object | boolean | string | number; key?: string; };

abstract class BaseGatewayClient {
	private socket?: WebSocket;
	private lastHeartbeat?: number;
	private reconectInterval?: NodeJS.Timeout;
	private heartbeatInterval?: NodeJS.Timeout;
	private reconnectTries: number;

	// Add custom functions, and continue in extending class.
	abstract handleReply(message: BaseMessage): void;

	constructor() {
		this.connect();
		this.reconnectTries = 0;
	}

	/* ----------------------------------- Internal ----------------------------------- */

	public connect() {
		try {
			this.socket = new WebSocket(config.gateway.url);
			this.loadConnection();
		} catch (error) {
			LoggerModule('Gateway', 'Failed to reconnect to the gateway server.\n', 'red');
		}
	}

	private tryReconnect() {
		this.socket?.removeAllListeners();
		this.reconectInterval = setInterval(() => {
			if (this.reconnectTries > 3) {
				clearInterval(this.reconectInterval);
				return LoggerModule('Gateway', 'Failed to reconnect 3 times, reconnect menually.\n', 'red');
			} else this.reconnectTries++;

			this.connect();
		}, 30000); // 30 seconds
	}

	private loadConnection() {
		this.socket?.on('open', () => this.socket?.send(JSON.stringify({ type: 'auth', key: config.gateway.key })));
		this.loadHeartbeat();

		this.socket?.on('message', (message) => {
			const { type, data, key, subType } = JSON.parse(message.toString()) as BaseMessage;

			switch (type) {
				case 'shutdown': case 'restart': {
					process.exit(0);
					break; // eslint why?
				}
				case 'auth': {
					if (data) LoggerModule('Gateway', 'Successfully authenticated to the gateway server.\n', 'magenta');
					else LoggerModule('Gateway', 'Failed to authenticate to the gateway server.\n', 'red');

					if (this.reconectInterval) {
						clearInterval(this.reconectInterval);
						this.reconectInterval = undefined;
					}

					break;
				}
				case 'eval': {
					this.handleEval(JSON.stringify(data));

					break;
				}
				case 'requireReply': {
					this.handleReply({ type, data, subType });
					this.socket?.send(JSON.stringify({ type: 'requireReply', data: true, key }));

					break;
				}
			}
		});

		this.socket?.on('pong', () => (this.lastHeartbeat = Date.now()));

		this.socket?.on('error', (error) => {
			LoggerModule('Gateway', `An error has occurred while connecting to the gateway server.\n${error}`, 'red');
			this.tryReconnect();
		});

		this.socket?.on('close', () => {
			LoggerModule('Gateway', 'Gateway connection closed.\n', 'red');
			this.tryReconnect();

			if (this.heartbeatInterval) {
				clearInterval(this.heartbeatInterval);
				this.heartbeatInterval = undefined;
			}
		});
	}


	private loadHeartbeat() {
		this.lastHeartbeat = Date.now();

		this.heartbeatInterval = setInterval(() => {
			this.socket?.ping();

			if (this.lastHeartbeat && Date.now() - this.lastHeartbeat > 90000) this.socket?.close(); // 1 minute 30 seconds
		}, 45000); // 45 seconds
	}

	private async handleEval(code: string) {
		const result = await evalExecute(code);
		this.socket?.send(JSON.stringify({ type: 'eval', data: result }));
	}
}

export default class GatewayClient extends BaseGatewayClient {
	constructor() {
		super();
	}

	async handleReply(message: BaseMessage) {
		switch (message.subType) {
			case 'systemMessage': {
				sendCrossPost(message.data as { content: string; embeds: APIEmbed[]; files: string[]; channelId: string; });
			}
		}
	}
}
