const dev = process?.platform === 'win32';

export default {
	bot: {
		token: dev ? '' : '',
	},

	link: {
		topgg: 'https://top.gg/bot/872501852644704337',
		invite: 'https://discord.com/api/oauth2/authorize?client_id=872501852644704337&permissions=137439341632&scope=bot%20applications.commands',
		support: 'https://discord.gg/4rphpersCa',
		website: 'https://updates.crni.xyz',
		status: 'https://statusbot.us',
		tutorial: 'https://updates.crni.xyz/tutorials',
	},

	sharding: {
		shards: 1,
		clusters: 1,
		shardsPerCluster: 1,
	},

	embed: {
		color: 0x5c6ceb,
		base_color: 0x5c6ceb,
		offline: 0x999999,
		online: 0x7bcba7,
		stream: 0x9676ca,
		idle: 0xfcc061,
		dnd: 0xf17f7e,
	},

	database: `mongodb+srv://username:pass@host/${dev ? 'System-Updates-Canary' : 'System-Updates'}`,
	gateway: {
		url: 'wss://gateway.crni.xyz/',
		key: '',
	},

	dev: {
		mode: dev,
		cache: true,
		slash: false,
		users: ['797012765352001557'],
	},

	follow_channels: {
		testing_channel: '1008447145713602560',

		partners_community: '936570266237149235',
		partners_product: '936570282867564564',

		dac_general: '1094661817197936640',
		dac_peer: '1096873512020475963',

		townhall_hq: '1008447307836043264',
		discord_status: '1008447328379732058',
		discord_youtube: '1008447355571425411',
		discord_twitter: '1008447382645641389',

		developers_api: '1008447418880229546',
		developers_server: '1008447452644397168',
		developers_github: '1008447482356826116',

		api_news: '1008447595699523674',
		displace_news_blog: '1008447699550470145',
		games_updates: '1008447735021711481',

		updates_datamining: '1008447786938794004',
		community_architects: '1008667324741595239',

		netcord_articles: '1008447824897257512',
		wholesome_posts: '1008667474922848316',

		waya_news: '1022540019765878864',
	},
};
