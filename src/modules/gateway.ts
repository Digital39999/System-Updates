import { sendCrossPost } from './crosspost';
import { evalExecute } from '../index';
import { APIEmbed } from 'discord.js';
import config from '../data/config';
import LoggerModule from './logger';
import WebSocket from 'ws';

export default class GatewayClient {
	private socket?: WebSocket;
	private lastHeartbeat?: number;
	private reconectInterval?: NodeJS.Timeout;
	private heartbeatInterval?: NodeJS.Timeout;

	constructor() {
		try {
			this.socket = new WebSocket(config.gateway.url, { protocolVersion: 13 });
			this.connect();
		} catch (error) {
			LoggerModule('Gateway', 'Failed to connect to the gateway server.\n', 'red');
		}
	}

	private tryReconnect() {
		this.reconectInterval = setInterval(() => {
			try {
				this.socket = new WebSocket(config.gateway.url, { protocolVersion: 13 });
				this.connect();
			} catch (error) {
				LoggerModule('Gateway', 'Failed to reconnect to the gateway server.\n', 'red');
			}
		}, 10000); // 10 seconds
	}

	private connect() {
		this.socket?.on('open', () => this.socket?.send(JSON.stringify({ type: 'auth', data: config.gateway.key })));
		this.loadHeartbeat();

		this.socket?.on('message', (message) => {
			const { type, data } = JSON.parse(message.toString());

			if (type === 'heartbeat') this.lastHeartbeat = Date.now();
			else if (type === 'eval') this.handleEval(data);
			else if (type === 'restart') this.handleEval('process.exit(0)');
			else if (type === 'systemMessage') this.processSystemMessage(data);
			else if (type === 'auth') {
				if (data) LoggerModule('Gateway', 'Successfully authenticated to the gateway server.\n', 'magenta');
				else LoggerModule('Gateway', 'Failed to authenticate to the gateway server.\n', 'red');

				if (this.reconectInterval) {
					clearInterval(this.reconectInterval);
					this.reconectInterval = undefined;
				}
			}
		});

		this.socket?.on('close', () => {
			LoggerModule('Gateway', 'Gateway connection closed.\n', 'red');
			setTimeout(() => this.tryReconnect(), 5000); // 5 seconds
			this.socket?.removeAllListeners();

			if (this.heartbeatInterval) {
				clearInterval(this.heartbeatInterval);
				this.heartbeatInterval = undefined;
			}
		});

		this.socket?.on('error', (error) => {
			LoggerModule('Gateway', `An error has occurred while connecting to the gateway server.\n${error}`, 'red');
			setTimeout(() => this.connect(), 10000); // 10 seconds
			this.socket?.removeAllListeners();
		});
	}

	private loadHeartbeat() {
		this.lastHeartbeat = Date.now();

		this.heartbeatInterval = setInterval(() => {
			this.socket?.send(JSON.stringify({ type: 'heartbeat' }));

			if (this.lastHeartbeat && Date.now() - this.lastHeartbeat > 90000) { // 1 minute 30 seconds
				this.socket?.close();
			}
		}, 45000); // 45 seconds
	}

	private async handleEval(code: string) {
		const result = await evalExecute(code);
		this.socket?.send(JSON.stringify({ type: 'eval', data: result }));
	}

	private processSystemMessage(data: { content: string; embeds: APIEmbed[]; files: string[]; channelId: string; }) {
		sendCrossPost(data);
	}
}
