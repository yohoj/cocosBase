/**
 * Created by yh on 2018/9/7.
 */
import {PANEL_PATH, SCENE_PATH} from "../utils/ResourcePath";
import {OPEN_OTHER_GAME} from "../views/panels/PanelOtherGameJump";

const {ccclass, property} = cc._decorator;

export const CONFIG_DATA = {
	// SERVER_URL: 'http://192.168.6.100:31370',
	SERVER_URL: 'https://rogame.51dataedu.com/https/feedfish/va',


	CONFIG_VERSION: 'va',
	GO_FISH_APP_ID: 'wx45f2afece40af560',

	// GO_FISH_APP_ID:'wx97f8b779f9d4e433',
}

export const SHARE_TYPE = cc.Enum({
	NONE: 0,//只有领取
	VIDEO: 1,//纯视频
	SHARE: 2,//纯分享
	DOUBLE: 3,//5次视频后在分享
});

export const SHARE_MODULE = cc.Enum({
	SYSTEM: 1,//转发
	OFFLINE: 2,//离线翻倍
	LEVEL_UP: 3,//升级砍价
	FIGHT: 4,//战斗失败分享
	POWER: 5,//体力恢复分享
	BANNER: 6,//banner
	CHANNEL: 7, //导量用户
	SIGN: 8,//签到
	LOTTO: 9,//转盘
	RED_BAG: 10,//红包
	OTHER_GAME: 11, //导量游戏
	FREE_FIX: 12,//免费治疗
	FIGHT_VICTORY: 13,//战斗胜利
	LOTTO_SHARE: 14,//转盘翻倍分享
	STORAGE: 100,
	SHARE_GROUP: 101,
});

export const STORAGE_TYPE = cc.Enum({
	VIDEO_COUNT: 0,//视频
	RED_BAG_COUNT: 2,//红包
});


export const FIGHT_PERCENT = {
	HUNGER: 0.75,
	DEAD: 0.5,
};

export const GOLD_PERCENT = {
	HUNGER: 0.6,
	DEAD: 0.03,
	HURT: 0.5,
};

export const VIDEO_MAX_COUNT = 5;

export const ATTACK_COUNT = 10;
export const ADD_ATTACK_COUNT = 3;
export const LOADING_IGNORE_LIST = [PANEL_PATH.PANEL_GUIDE, PANEL_PATH.PANEL_OTHER_GAME_JUMP, SCENE_PATH.SCENE_LOADING, SCENE_PATH.SCENE_GAME];
export const BANNER_AD_IGNORE_LIST = [SCENE_PATH.SCENE_LOADING, PANEL_PATH.PANEL_PHOTO];
export const SHOW_APP_LIST = [
	{path: SCENE_PATH.SCENE_GAME, id: OPEN_OTHER_GAME.PANEL_GAME, delay: 0},
	{path: PANEL_PATH.PANEL_OTHERS, id: OPEN_OTHER_GAME.PANEL_OTHER_NEAR_SEA, delay: 0.2},
	{path: PANEL_PATH.PANEL_HISTORY, id: OPEN_OTHER_GAME.PANEL_HISTORY_DEFENSE, delay: 0.2},
	{path: PANEL_PATH.PANEL_RANK_LIST, id: OPEN_OTHER_GAME.PANEL_RANK_LIST_FIGHT, delay: 0.2}
];
export const FEEDBACK_LIST = [SCENE_PATH.SCENE_GAME];


@ccclass
export default class ConfigMgr extends cc.Component {
	static _instance = null;
	static get instance() {
		if (!this._instance) {
			this._instance = new ConfigMgr();
		}
		return this._instance;
	}

	_kuns = null;


	//加载配置表文件
	loadConfig(callback) {
		cc.loader.loadRes("configs/config", (err, configSource) => {
			if (err) {
				return;
			}
			this._kuns = configSource.kuns;
			callback && callback();
		});
	}


	getKuns() {
		return this._kuns;
	}

	getKunById(id) {
		return this._kuns[id];
	}

	getKunByLevel(id, level) {
		let result = null;
		let levels = this._kuns[id].levels;
		levels.some(config => {
			if (config.level == level) {
				result = config;
				return true;
			}
		});
		return result;
	}


	getKunByExp(id, exp, nextKun = false) {
		let result = null;
		let levels = this._kuns[id].levels;
		let sum = 0;
		let index = 0;
		for (let i = 1; i < levels.length; ++i) {
			let kun = levels[i];
			sum += parseInt(kun.exp);
			if (exp < sum) {

				index = i - 1;
				break;
			}
			else if (exp >= sum && i == levels.length - 1) {
				index = i;
			}

		}
		result = levels[nextKun ? index + 1 : index];
		return result;
	}


	getNeedExp(id, level) {//(传入的等级都是预计下个 需要的经验若 求26级则就是顶级了）
		let result = 0;
		let levels = this._kuns[id].levels;
		if (level == levels.length + 1) { //达到最高等级的展示(传入)
			console.log("已达最高等级");
			return -1;
		}
		level = Math.min(level, levels.length);
		for (let i = 1; i < levels.length; ++i) {
			let kun = levels[i];
			result += parseInt(kun.exp);
			if (parseInt(kun.level) >= level) {
				break;
			}

		}
		return result;
	}

	getKunByLevel(id, level) {
		let result = null;
		let levels = this._kuns[id].levels;
		if (level == levels.length + 1) { //达到最高等级的展示(传入)
			console.log("已达最高等级");
			return null;
		}
		levels.some(obj => {
			if (parseInt(obj.level) == level) {
				result = obj;
				return true;
			}
		});
		return result;
	}


}
 
 