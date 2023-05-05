import { sendCrossPost } from './crosspost';
import { evalExecute } from '../index';
import { APIEmbed } from 'discord.js';
import LoggerModule from './logger';
import config from '../data/config';
import WebSocket from 'ws';

export type EventTypes = StripeEvents | 'systemMessage';
export type StripeEvents = 'started' | 'ended' | 'canceled' | 'unpaid' | 'other' | 'oneTimePaid';
export type MessageTypes = 'shutdown' | 'restart' | 'auth' | 'requireReply' | 'stripeEvent' | 'eval' | 'raw';
export type BaseMessage = { type: MessageTypes; data: { eventData: object | string | boolean | number; eventType?: EventTypes; }; key?: string; };

abstract class BaseGatewayClient {
	private socket?: WebSocket;
	private lastHeartbeat?: number;
	private reconectInterval?: NodeJS.Timeout;
	private heartbeatInterval?: NodeJS.Timeout;
	private reconnect: {
		tries: number;
		isActive: boolean;
	};

	// Add custom functions, and continue in extending class.
	abstract handleReply(message: BaseMessage): void;

	constructor() {
		this.connect();
		this.reconnect = {
			tries: 0,
			isActive: false,
		};
	}

	/* ----------------------------------- Internal ----------------------------------- */

	public connect() {
		try {
			this.socket = new WebSocket(config.gateway.url, {
				headers: {
					'Authorization': config.gateway.key,
				},
			});

			this.loadConnection();
		} catch {
			LoggerModule('Gateway', 'Failed to reconnect to the gateway server.\n', 'red');
		}
	}

	private tryReconnect() {
		this.socket?.removeAllListeners();
		this.reconectInterval = setInterval(() => {
			if (this.reconnect.tries > 3) {
				clearInterval(this.reconectInterval);
				return LoggerModule('Gateway', 'Failed to reconnect 3 times, reconnect menually.\n', 'red');
			} else this.reconnect.tries++;

			this.connect();
		}, 30000); // 30 seconds
	}

	private loadConnection() {
		this.loadHeartbeat();

		this.socket?.on('message', (message) => {
			const { type, data, key } = JSON.parse(message.toString()) as BaseMessage;
			switch (type) {
				case 'shutdown': case 'restart': {
					process.exit(0);
					break; // eslint why?
				}
				case 'auth': {
					if (data.eventData) LoggerModule('Gateway', 'Successfully authenticated to the gateway server.\n', 'magenta');
					else LoggerModule('Gateway', 'Failed to authenticate to the gateway server.\n', 'red');

					if (this.reconectInterval) {
						clearInterval(this.reconectInterval);
						this.reconectInterval = undefined;
					}

					break;
				}
				case 'eval': {
					this.handleEval(data.eventData, key);

					break;
				}
				case 'requireReply': case 'stripeEvent': {
					this.handleReply({ type, data });
					this.socket?.send(JSON.stringify({ type: 'requireReply', data: { eventData: true }, key } as BaseMessage)); // Send reply as confirmation.

					break;
				}
			}
		});

		this.socket?.on('pong', () => (this.lastHeartbeat = Date.now()));

		this.socket?.on('error', (error) => {
			LoggerModule('Gateway', `An error has occurred while connecting to the gateway server.\n${error}`, 'red');
			if (!this.reconnect.isActive) this.tryReconnect();
		});

		this.socket?.on('close', () => {
			LoggerModule('Gateway', 'Gateway connection closed.\n', 'red');
			if (!this.reconnect.isActive) this.tryReconnect();

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

	private async handleEval(code: unknown, key?: string) {
		const result = await evalExecute(code);
		this.socket?.send(JSON.stringify({ type: 'eval', data: result, key }));
	}
}

export default class GatewayClient extends BaseGatewayClient {
	constructor() {
		super();
	}

	async handleReply(message: BaseMessage) {
		switch (message.data.eventType) {
			case 'systemMessage': {
				sendCrossPost(message.data.eventData as { content: string; embeds: APIEmbed[]; files: string[]; channelId: string; });
			}
		}
	}
}
