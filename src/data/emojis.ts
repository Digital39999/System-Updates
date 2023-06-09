let websiteData: EmojiType;

/* ----------------------------------- Functions ----------------------------------- */

export default function getEmojis<T extends string | undefined>(specific?: T, refresh?: boolean, callback?: (data: EmojiType) => void): (T extends string ? string : EmojiType) {
	if (!websiteData || refresh) getWebsiteData(callback);
	if (specific) return getPropertyByPath(websiteData, specific) as unknown as (T extends string ? string : EmojiType);

	return (websiteData || {}) as unknown as (T extends string ? string : EmojiType);
}

function getWebsiteData(callback?: (data: EmojiType) => void): void {
	fetch('https://api.crni.xyz/emojis').then((res) => res.json()).then((data) => {
		websiteData = data.data; if (callback) callback(data.data);
	}).catch(() => {
		throw new Error('Failed to fetch emojis from api.crni.xyz.');
	});
}

function getPropertyByPath(object: Record<string, Record<string, string>>, path: string): string {
	let value: Record<string, Record<string, string>> | Record<string, string> | string = object;

	for (const key of path.split('.')) {
		if (!Object.prototype.hasOwnProperty.call(value, key)) return '';
		value = value[key];
	}

	return value as unknown as string;
}

/* ----------------------------------- Type ----------------------------------- */

export type EmojiType = {
	function: {
		off: string;
		on: string;
		warn: string;
		cross: string;
		default: string;
		emergency: string;
		pending: string;
		tick: string;
	};
	customBadges: {
		staff: string;
		support: string;
		verified: string;
		beta: string;
		member: string;
	};
	discordBadges: {
		bug: string;
		staff: string;
		bug2: string;
		supporter: string;
		partner: string;
		hype: string;
		dev: string;
		mod: string;
	};
	fromMyServer: {
		settings: string;
		correct: string;
		error: string;
		follow: string;
		link: string;
		warn: string;
		dot: string;
	};
	yuna: {
		angry: string;
		cry: string;
		cry2: string;
		happy: string;
		hehe: string;
		hide: string;
		hide2: string;
		kill: string;
		love: string;
		meh: string;
		what: string;
		panic: string;
		pf: string;
		scary: string;
		sip: string;
		uwu: string;
		think: string;
		tongue: string;
		wow: string;
	};
	status: {
		online: string;
		idle: string;
		dnd: string;
		offline: string;
		streaming: string;
	};
	main: {
		icons_activities: string
		icons_announce: string
		icons_archive: string
		icons_audiodisable: string
		icons_audioenable: string
		icons_award: string
		icons_awardcup: string
		icons_backforward: string
		icons_badping: string
		icons_ban: string
		icons_bank: string
		icons_birdman: string
		icons_box: string
		icons_bright: string
		icons_Bugs: string
		icons_bulb: string
		icons_calendar1: string
		icons_callconnect: string
		icons_calldecline: string
		icons_calldisconnect: string
		icons_channel: string
		icons_clock: string
		icons_coin: string
		icons_colorboostnitro: string
		icons_colornitro: string
		icons_colorserverpartner: string
		icons_colorserververified: string
		icons_colorstaff: string
		icons_connect: string
		icons_Correct: string
		icons_creditcard: string
		icons_customstaff: string
		icons_dblurple: string
		icons_delete: string
		icons_dfuchsia: string
		icons_dgreen: string
		icons_discover: string
		icons_djoin: string
		icons_dleave: string
		icons_dollar: string
		icons_Download: string
		icons_downvote: string
		icons_dred: string
		icons_dwhite: string
		icons_dyellow: string
		icons_edit: string
		icons_emojiguardian: string
		icons_eventcolour: string
		icons_exclamation: string
		icons_file: string
		icons_fire: string
		icons_forum: string
		icons_forumNFSW: string
		icons_frontforward: string
		icons_gitbranch: string
		icons_gitcommit: string
		icons_gitmerge: string
		icons_gitpullrequest: string
		icons_globe: string
		icons_goodping: string
		icons_hammer: string
		icons_headphone: string
		icons_headphonedeafen: string
		icons_hyphen: string
		icons_idelping: string
		icons_illustrator: string
		icons_info: string
		icons_invite: string
		icons_join: string
		icons_kick: string
		icons_kick1: string
		icons_leave: string
		icons_link: string
		icons_linked: string
		icons_live: string
		icons_loading: string
		icons_magicwand: string
		icons_mashroomman: string
		icons_mentalhealth: string
		icons_mic: string
		icons_micmute: string
		icons_monitor: string
		icons_musicstop: string
		icons_newmembers: string
		icons_night: string
		icons_nitro: string
		icons_nitroboost: string
		icons_owner: string
		icons_paintpadbrush: string
		icons_pause: string
		icons_paypal: string
		icons_pen: string
		icons_people: string
		icons_Person: string
		icons_photoshop: string
		icons_pin: string
		icons_ping: string
		icons_play: string
		icons_plus: string
		icons_podcast: string
		icons_premiumchannel: string
		icons_reminder: string
		icons_repeat: string
		icons_repeatonce: string
		icons_reply: string
		icons_rightarrow: string
		icons_saturn: string
		icons_screenshare: string
		icons_search: string
		icons_sentry: string
		icons_servermute: string
		icons_settings: string
		icons_share: string
		icons_shine1: string
		icons_shine2: string
		icons_shine3: string
		icons_splash: string
		icons_star: string
		icons_store: string
		icons_text1: string
		icons_text2: string
		icons_text3: string
		icons_text4: string
		icons_text5: string
		icons_text6: string
		icons_timeout: string
		icons_transferownership: string
		icons_upvote: string
		icons_verified: string
		icons_video: string
		icons_Wrong: string
		icons_wumpus: string
		iconslogo: string
		icons_bookmark: string
		icons_busy: string
		icons_camera: string
		icons_clouddown: string
		icons_code: string
		icons_control: string
		icons_downarrow: string
		icons_education: string
		icons_flag: string
		icons_folder: string
		icons_fword: string
		icons_games: string
		icons_gif: string
		icons_gift: string
		icons_heart: string
		icons_hi: string
		icons_id: string
		icons_idle: string
		icons_image: string
		icons_leftarrow: string
		icons_list: string
		icons_loadingerror: string
		icons_message: string
		icons_music: string
		icons_notify: string
		icons_off: string
		icons_offline: string
		icons_on: string
		icons_online: string
		icons_outage: string
		icons_premium: string
		icons_question: string
		icons_quotes: string
		icons_richpresence: string
		icons_rules: string
		icons_slashcmd: string
		icons_spark: string
		icons_speaker: string
		icons_speakerlock: string
		icons_speakerlow: string
		icons_speakermute: string
		icons_stickers: string
		icons_stream: string
		icons_ticket: string
		icons_tilde: string
		icons_todolist: string
		icons_uparrow: string
		icons_update: string
		icons_view: string
		icons_vip: string
		icons_addreactions: string
		icons_aka: string
		icons_behance: string
		icons_beta: string
		icons_bots: string
		icons_clean: string
		icons_defaultperms: string
		icons_discordbotdev: string
		icons_discordbughunter: string
		icons_discordhypesquard: string
		icons_discordmod: string
		icons_discordnitro: string
		icons_discordpartner: string
		icons_discordstaff: string
		icons_dislike: string
		icons_earlysupporter: string
		icons_fb: string
		icons_figma: string
		icons_files: string
		icons_friends: string
		icons_github: string
		icons_hoursglass: string
		icons_HSbalance: string
		icons_HSbravery: string
		icons_HSbrilliance: string
		icons_instagram: string
		icons_kicking: string
		icons_kofi: string
		icons_like: string
		icons_locked: string
		icons_loop: string
		icons_menu: string
		icons_MSvisualcode: string
		icons_musicstop1: string
		icons_New: string
		icons_partner: string
		icons_patreon: string
		icons_pause1: string
		icons_pings: string
		icons_play1: string
		icons_queue: string
		icons_reddit: string
		icons_serverpartner: string
		icons_serververified: string
		icons_snapchat: string
		icons_supportteam: string
		icons_twitter: string
		icons_unlock: string
		icons_youtube: string
		icons_banmembers: string
		icons_channelfollowed: string
		icons_createcategory: string
		icons_createchannel: string
		icons_createchannels: string
		icons_createemoji: string
		icons_createintegration: string
		icons_createrole: string
		icons_createsticker: string
		icons_createthread: string
		icons_createwebhook: string
		icons_deletechannel: string
		icons_deleteemoji: string
		icons_deleteevent: string
		icons_deleteintegration: string
		icons_deleterole: string
		icons_deletesticker: string
		icons_deletethread: string
		icons_deletewebhook: string
		icons_disable: string
		icons_Discord: string
		icons_enable: string
		icons_endstage: string
		icons_generalinfo: string
		icons_growth: string
		icons_linkadd: string
		icons_linkrevoke: string
		icons_linkupdate: string
		icons_markasread: string
		icons_notificationsettings: string
		icons_OAuth2: string
		icons_roles: string
		icons_scheduleevent: string
		icons_serverinsight: string
		icons_startstage: string
		icons_swardx: string
		icons_threadchannel: string
		icons_unbanmember: string
		icons_updatechannel: string
		icons_updateemoji: string
		icons_updateevent: string
		icons_updateintegration: string
		icons_updatemember: string
		icons_updaterole: string
		icons_updateserver: string
		icons_updatestage: string
		icons_updatesticker: string
		icons_updatethread: string
		icons_updatewebhook: string
		icons_0: string
		icons_1: string
		icons_10: string
		icons_2: string
		icons_3: string
		icons_4: string
		icons_5: string
		icons_6: string
		icons_7: string
		icons_8: string
		icons_9: string
		icons_a: string
		icons_amogus: string
		icons_b: string
		icons_bday: string
		icons_book: string
		icons_c: string
		icons_d: string
		icons_e: string
		icons_f: string
		icons_fingerprint: string
		icons_g: string
		icons_Guardian: string
		icons_h: string
		icons_he_him: string
		icons_i: string
		icons_j: string
		icons_k: string
		icons_l: string
		icons_library: string
		icons_m: string
		icons_n: string
		icons_o: string
		icons_p: string
		icons_q: string
		icons_r: string
		icons_s: string
		icons_she_her: string
		icons_statsdown: string
		icons_t: string
		icons_tada: string
		icons_they_them: string
		icons_translate: string
		icons_u: string
		icons_v: string
		icons_vpn: string
		icons_w: string
		icons_x: string
		icons_y: string
		icons_z: string
		icons_18: string
		icons_bigender: string
		icons_calender: string
		icons_calenderdate: string
		icons_cmd: string
		icons_discordjs: string
		icons_Female: string
		icons_gay: string
		icons_gender: string
		icons_hetero: string
		icons_jpg: string
		icons_js: string
		icons_lesbian: string
		icons_Male: string
		icons_moderationhig: string
		icons_moderationhighest: string
		icons_moderationlow: string
		icons_moderationmedium: string
		icons_moderationnone: string
		icons_nodejs: string
		icons_png: string
		icons_radmins: string
		icons_rartists: string
		icons_rboosters: string
		icons_rbots: string
		icons_rcamera: string
		icons_rdevelopers: string
		icons_revents: string
		icons_rfire: string
		icons_rguardians: string
		icons_rhelpers: string
		icons_rmembers: string
		icons_rmods: string
		icons_rowner: string
		icons_rpodcast: string
		icons_rsdonator: string
		icons_rspartner: string
		icons_rsstaffs: string
		icons_rstaff: string
		icons_rverification: string
		icons_rverified: string
		icons_rVIP: string
		icons_snowflake: string
		icons_tiktok: string
		icons_transgender: string
		icons_twitch: string
		icons_vklogo: string
		icons_warning: string
		icons_wave: string
		icons_webp: string
	};
}
