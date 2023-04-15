import mongoose from 'mongoose';

export type inputGuildType = {
    guild: string;

    channels: {
        testing_channel: string[];

        partners_community: string[];
        partners_product: string[];

		dac_general: string[];
		dac_peer: string[];

        townhall_hq: string[];
        discord_status: string[];
        discord_youtube: string[];
        discord_twitter: string[];

        developers_api: string[];
        developers_server: string[];
        developers_github: string[];

        api_news: string[];
        displace_news_blog: string[];
        games_updates: string[];

        updates_datamining: string[];
        community_architects: string[];

        netcord_articles: string[];
        wholesome_posts: string[];

        waya_news: string[];
    }
};

export const GuildModel = mongoose.model<inputGuildType>('guild', new mongoose.Schema<inputGuildType>({
	guild: { type: String, required: true, unique: true },

	channels: {
		testing_channel: { type: [String], default: [] },

		partners_community: { type: [String], default: [] },
		partners_product: { type: [String], default: [] },

		dac_general: { type: [String], default: [] },
		dac_peer: { type: [String], default: [] },

		townhall_hq: { type: [String], default: [] },
		discord_status: { type: [String], default: [] },
		discord_youtube: { type: [String], default: [] },
		discord_twitter: { type: [String], default: [] },

		developers_api: { type: [String], default: [] },
		developers_server: { type: [String], default: [] },
		developers_github: { type: [String], default: [] },

		api_news: { type: [String], default: [] },
		displace_news_blog: { type: [String], default: [] },
		games_updates: { type: [String], default: [] },

		updates_datamining: { type: [String], default: [] },
		community_architects: { type: [String], default: [] },

		netcord_articles: { type: [String], default: [] },
		wholesome_posts: { type: [String], default: [] },

		waya_news: { type: [String], default: [] },
	},
}));
