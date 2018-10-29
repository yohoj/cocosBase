/**
 * Created by yh on 2018/9/6.
 */
import UIManager from "../../mgr/UIManager";
import EventMgr from "../../mgr/EventMgr";
import Loader from "../../mgr/loader/Loader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SceneBase extends cc.Component {
	private _events = [];
	private _loader: Loader = null;

	get loader ():Loader {
		return this._loader;
	}

	initLoader (loader: Loader) {
		this._loader = loader;
		return this;
	}

	onDestroy () {
		if (this._loader) {
			this._loader.release();
			this._loader = null;
		}
	}
	show() {
		let sceneNode = UIManager.instance.sceneNode;
		sceneNode.addChild(this.node);
		UIManager.instance.push(this.node.name, this.node);
	}

	back() {
		this.node.destroy();
		// UIManager.instance.showCurrentNode();
		UIManager.instance.pop();
	}

	close() {
		this.node.destroy();
		UIManager.instance.deleteByName(this.node.name);
	}

	registerEvent(eventId, callback, target) {
		if (target) {
			EventMgr.instance.onAddHandler(eventId, callback.bind(target));
			return;
		}
		if (!this.getEvent(eventId)) {
			this._events.push({eventId: eventId, callback: callback, target: target})
		}
		EventMgr.instance.onAddHandler(eventId, callback);
	}

	dispatchEvent(eventId, params) {
		EventMgr.instance.onDispatchHandler(eventId, params);
	}

	removeEvent() {
		this._events.forEach(ev => {
			EventMgr.instance.onRemoveHandler(ev.eventId, ev.callback, ev.target);
		});
		// this._events.splice(0);
	}

	onEnable() {
		this._events.forEach((ev:any) => {
			EventMgr.instance.onAddHandler(ev.eventId, ev.callback, ev.target);
		})
	}

	onDisable() {
		this.removeEvent();
	}

	getEvent(eventId) {
		return this._events.some(ev => {
			if (ev.eventId == eventId) {
				return true;
			}
		})
	}

}
 
 