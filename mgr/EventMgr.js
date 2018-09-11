/**
 * Created by yh on 2018/8/15
 * 事件管理类
 */
export const EVENT_ID = {
	EVENT_ATTACK: 0,
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
    