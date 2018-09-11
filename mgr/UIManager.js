import {SCENE_PATH} from "../utils/ResourcePath";
import WxSdk from "../wx/WxSdk";
import AudioMgr from "./AudioMgr";

const {ccclass, property} = cc._decorator;
/*
*UI管理类  create 2018-8-14
*/
@ccclass
export default class UIManager extends cc.Component {

	@property(cc.Node) //todo...
	uiParentNode = null;

	@property(cc.Node) //todo...
	uiExParentNode = null;

	@property(cc.Node) //todo...
	uiLoadingNode = null;

	@property(cc.Sprite)
	sprLoad = null;

	@property(cc.Node)
	uiTipNode = null;

	@property(cc.Node)
	promt = null;

	@property(cc.Label)
	labContent = null;


	_UI_Map = {};//所有的UI对象数组

	static _instance;

	static get instance() {
		return this._instance;
	}

	static set instance(value) {
		this._instance = value;
	}

	onLoad() {
		UIManager.instance = this;
		this.showUI(SCENE_PATH.SCENE_LOADING);
	}

	//uiName = EnumType_UI.UI_GAME;
	showUI(prefabPath, params, onProgress, onComplete) {
		if (!onComplete) {
			onComplete = onProgress;
			onProgress = null;
		}
		let arr = prefabPath.split('/');
		let scriptName = arr[arr.length - 1];
		// console.log("open getScript = ", getScriptName);
		// let uiName = getScriptName;
		if (Object.keys(this._UI_Map).length > 0) {
			for (let key in this._UI_Map) {
				if (key == scriptName) {
					if (scriptName.indexOf('Panel') >= 0) {
						this.showLoading();
						this.scheduleOnce(() => {
							this.hideLoading();
						}, 0.5);
					}
					this._UI_Map[scriptName].show(params);
					return;
				}
			}
		}
		cc.loader.loadRes(prefabPath, (completeCnt, totalCnt) => {
			if (onProgress) {
				onProgress(completeCnt, totalCnt);
			}
			if (scriptName.indexOf('SceneGame') < 0) {
				this.showLoading();
			}
		}, (err, prefab) => {
			if (prefab == null) {
				console.error("找不到prefab uiName=", prefabPath);
				return null;
			}
			let uiNode = cc.instantiate(prefab);
			/*if(prefabPath.indexOf('Scene') >= 0){
				this.uiParentNode.addChild(uiNode);
			}
			else if(prefab.indexOf('Panel') >= 0){
				this.uiExParentNode.addChild(uiNode);
			}*/
			uiNode.setContentSize(cc.winSize);
			uiNode.setPosition(0, 0);
			this._UI_Map[scriptName] = uiNode.getComponent(scriptName);
			this._UI_Map[scriptName].show(params);
			if (onComplete) {
				onComplete();
			}
			else {
				if (scriptName.indexOf('Panel') >= 0) {
					this.scheduleOnce(() => {
						this.hideLoading();
					}, 0.5);
				}
				else {
					this.hideLoading();
				}
			}
		});

	}


	_arr = [];

	push(name, node) {
		let result = this.get(name);
		if (!result) {
			this._arr.push({name, node});
		}
		else {
			this._arr.splice(result.index, 1);
			this._arr.push({name, node});
		}
		this.hideCurrentNode();
	}

	hideCurrentNode() {
		if (this._arr.length > 1) {
			let child = this._arr[this._arr.length - 2];
			if (child) {
				child.node.removeFromParent();
			}
		}
	}

	showCurrentNode() {
		let parent = this.uiParentNode;
		let child = this._arr[this._arr.length - 1].node;
		parent.addChild(child);
	}


	deleteByName(name) {
		this._arr.some((obj, index) => {
			if (obj.name == name) {
				this._arr.splice(index, 1);
				return false;
			}
		});
	}


	pop() {
		this._arr.pop();
		this.showCurrentNode();
	}

	get(name) {
		let result = null;
		this._arr.forEach((obj, index) => {
			if (obj.name == name) {
				result = {obj: obj, index: index};
			}
		});
		return result;
	}

	showLoading() {
		this.uiLoadingNode.active = true;
		this.playLoadingAction();
	}

	hideLoading() {
		this.uiLoadingNode.active = false;
		this.stopLoadingAction();
	}

	playLoadingAction() {
		this.stopLoadingAction();
		let action = cc.repeatForever(cc.sequence(cc.rotateTo(0.3, 180), cc.rotateTo(0.3, 360)));
		this.sprLoad.node.runAction(action);
	}

	stopLoadingAction() {
		this.sprLoad.node.stopAllActions();
		this.sprLoad.node.rotation = 0;
	}
	//提示
	showTip(content,delay = 1){
		this.labContent.string = content;
		this.playTipAction(delay);
	}

	playTipAction(delay) {
		this.promt.stopAllActions();
		this.uiTipNode.active = true;
		this.promt.active = true;
		this.promt.opacity = 0;
		let action1 = cc.fadeIn(0.3);
		let action2 = cc.delayTime(delay);
		let action3 = cc.fadeOut(0.3);
		this.promt.runAction(cc.sequence(action1, action2, action3, cc.callFunc(() => {
			this.uiTipNode.active = false;
			this.promt.active = false;
			this.promt.opacity = 0;
		})));
	}

}



