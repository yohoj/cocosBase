/**
 * Created by yh on 2018/9/6.
 */
/**
 * Created by yh on 2018/7/28.
 */
import UIManager from "../../mgr/UIManager";
import EventMgr from "../../mgr/EventMgr";
import AudioMgr from "../../mgr/AudioMgr";
import Loader from "../../mgr/loader/Loader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PanelBase extends cc.Component {
	private _events:any[] = [];

	private _loader: Loader = null

	get loader ():Loader {
		return this._loader;
	}

	initLoader (loader: Loader) {
		this._loader = loader;
		return this;
	}

	release () {
		if (this._loader) {
			this._loader.release();
			this._loader = null;
		}
	}
	show() {
		this.node.opacity = 0;
		this.node.scaleX = 0;
		this.node.scaleY = 0;
		let panelNode = UIManager.instance.panelNode;
		panelNode.addChild(this.node);
		let action:any = cc.spawn(cc.scaleTo(0.5, 1, 1), cc.fadeTo(0.5, 255));
		action.easing(cc.easeIn(3.0));
		this.node.runAction(action);
	}

	close() {
		AudioMgr.instance.playCommonBtn();
		this.node.stopAllActions();
		let action = cc.sequence(cc.spawn(cc.scaleTo(0.5, 0, 0), cc.fadeTo(0.5, 0)), cc.callFunc(() => {
			// this.node.removeFromParent(true);
			this.node.destroy();
		}));
		action.easing(cc.easeOut(3.0));
		this.node.runAction(action);
	}

	registerEvent(eventId,callback,target){
		if(target){
			EventMgr.instance.onAddHandler(eventId,callback.bind(target));
			return;
		}
		if(!this.getEvent(eventId)){
			this._events.push({eventId:eventId,callback:callback,target:target})
		}
		EventMgr.instance.onAddHandler(eventId,callback);
	}

	dispatchEvent(eventId,params){
		EventMgr.instance.onDispatchHandler(eventId,params);
	}

	removeEvent(){
		this._events.forEach(ev => {
			EventMgr.instance.onRemoveHandler(ev.eventId,ev.callback,ev.target);
		});
		// this._events.splice(0);
	}

	onEnable(){
		this._events.forEach(ev => {
			EventMgr.instance.onAddHandler(ev.eventId,ev.callback,ev.target);
		})
	}

	onDisable(){
		this.removeEvent();
		this.release();
	}

	getEvent(eventId){
		return this._events.some(ev=>{
			if(ev.eventId == eventId){
				return true;
			}
		})
	}


}



 
 