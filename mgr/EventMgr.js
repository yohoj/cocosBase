/**
 * Created by yh on 2018/8/15
 * 事件管理类
 */
export const EVENT_ID = {
	EVENT_FEED: 0,//喂食
	EVENT_FIX: 1,//治疗
	EVENT_ATTACK: 2,//掠夺
	EVENT_LEVELUP: 3,//升级
	EVENT_UPDATE_FISH: 4,//小鱼更新
	EVENT_UPDATE_KUN: 5,//鲲更新
	EVENT_ADD_GOLD: 6,//增加金币
	EVENT_BATTLE_FINISH: 7,//战斗结束
	EVENT_USER_INFO_UPDATE: 8,//人物信息更新
	EVENT_BOX_RECEIVE: 9,//宝箱领取
	EVENT_UPDATE_ATTACK_COUNT: 10,//刷新战斗次数
	EVENT_SIGN_SUCCESS:11,//签到成功
	EVENT_LOTTO_SUCCESS:12,//转盘结束
	EVENT_HIDE_OTHER_GAME:13,//隐藏其它游戏
	EVENT_SHOW_OTHER_GAME:14,// 显示其它游戏

	EVENT_LEVEL_UP_ING: 99,//升级中
	EVENT_GUIDE_PLUNDER: 100,//掠夺战斗结束
	EVENT_GUIDE_LEVEL_UP: 101,//升级结束结束
	EVENT_GUIDE_LEVEL_UP_CLOSE: 102,//关闭升级界面
	EVENT_GUIDE_FEED: 103,//喂养及特效

	EVENT_HARRY_WORLD:104,// 掠夺陌生人

	EVENT_RANK_OPEN:105,// 打开排行榜
	EVENT_SIGN_UPDATE:106,//签到图标更新
	EVENT_INVITE_LOTTO:107,//签到图标更新
	EVENT_BADGE_DATA_CHANGE: 200,//红点更新
	EVENT_BADGE_DATA_MODIFY:201,//红点更新
}


const {ccclass, property} = cc._decorator;

@ccclass
export default class EventMgr {
	static _instance = null;

	static get instance() {
		if (!this._instance) {
			this._instance = new EventMgr();
		}
		return this._instance;
	}

	handlers = {};
	oneHander = [];

	onAddHandler(event, fn) {
		// let eventId = null;
		// for (let i = 0; i <  this.oneHander.length; i++) {
		//     if (this.oneHander[i] !== handler) {
		//         eventId = handler;
		//         break;
		//     }
		// }
		// this.oneHander.push(eventId);
		// this.handlers[event] = this.oneHander;
		if (!this.handlers[event]) {
			this.handlers[event] = [];
		}
		if (this.getEvent(event, fn)) {
			return;
		}
		this.handlers[event].push(fn);
	}

	
	onRemoveHandler(event, callback) {
		if (this.handlers[event]) {
			this.handlers[event].some((fun, index) => {
				if (fun == callback) {
					this.handlers[event].splice(index, 1);
				}
			})
		}
	}

	onDispatchHandler(event, data) {
		// console.log("dispatch:function " + event);
		if (this.handlers[event]) {
			this.handlers[event].forEach(fun => {
				fun && fun(data);
			})
		} else {
			cc.error("event not registered : " + event);
		}
	}

	getEvent(event, fn) {
		return this.handlers[event].some(ev => {
			if (ev == fn) {
				return true;
			}
		})
	}

}
    