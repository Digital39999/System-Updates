import { APIEmbed, AttachmentBuilder, TextBasedChannel } from 'discord.js';
import { CustomClient } from '../data/typings';

export async function loadClientIPCMessages(client: CustomClient): Promise<void> {
	client.cluster?.on('message', async (message) => {
		const { DBGuilds, message: data, type } = (message as { data: { type: string, DBGuilds: { guildId: string; channels: string[]; }[], message: { content: string; embeds: APIEmbed[]; files: string[]; channelId: string; }} }).data;
		if (!DBGuilds.length) return;

		let sent = 0, i = 0;
		const files: AttachmentBuilder[] = [];

		for await (const file of data.files) {
			const fileExtension = file.match(/(?<=\.)[a-z]+$/i)?.[0] || 'webp';

			const fileData = await fetch(file).then((res) => res.arrayBuffer());
			const buffer = Buffer.from(fileData);

			files.push(new AttachmentBuilder(buffer, { name:  `file${i++}.${fileExtension}` }));
		}

		const typeMessage = '**<:follow:1009199559186063411> | ' + client.functions?.channelName(type) + '**\n\n';

		for (const DBGuild of DBGuilds) {
			for (const channel of DBGuild.channels) {
				const ch = (client.channels.cache.get(channel) || client.guilds.cache.get(DBGuild.guildId)?.channels.cache.get(channel)) as TextBasedChannel;
				if (!ch) continue;

				const msg = await ch.send({
					content: typeMessage + data.content || '',
					embeds: data.embeds,
					files: files,
				}).catch(() => null);
				if (msg) sent++;
			}
		}

		(message as { reply: (data: object) => void }).reply({ type: 'crosspost', data: sent });
	});
}
