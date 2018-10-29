import {PANEL_PATH, SCENE_PATH} from "../utils/ResourcePath";
import WxSdk from "../wx/WxSdk";
import VideoAd from "../wx/VideoAd";
import BannerAd from "../wx/BannerAd";
import {BANNER_AD_IGNORE_LIST, FEEDBACK_LIST, LOADING_IGNORE_LIST} from "./ConfigMgr";
import DataMgr from "./DataMgr";
import Loader from "./loader/Loader";
import ConfigMgr from "./ConfigMgr";

const {ccclass, property} = cc._decorator;
/*
*UI管理类  create 2018-8-14
*/
@ccclass
export default class UIManager extends cc.Component {

	@property(cc.Node) //todo...
	sceneNode = null;

	@property(cc.Node) //todo...
	panelNode = null;

	@property(cc.Node) //todo...
	guideNode = null;

	@property(cc.Node) //todo...
	loadingNode = null;

	@property(cc.Node)
	tipNode = null;

	@property(cc.Node)
	adNode = null;
	
	@property(cc.Sprite)
	sprLoad = null;

	@property(cc.Node)
	promt = null;

	@property(cc.Label)
	labContent = null;

	@property(cc.Node)
	bannerNode = null;

	@property(cc.Node)
	videoNode = null;

	@property(cc.Node)
	scrollTipNode = null;

	_feedBackBtn = null;

	_MainLoader = null;

	static _instance;


	static get instance() {
		return this._instance;
	}

	static set instance(value) {
		this._instance = value;
	}

	onLoad() {
		UIManager.instance = this;
		this._MainLoader = new Loader().rootLoader;
		this.videoNode.getComponent(VideoAd).init();
		this.startInit();
	}
	/**
	 * 加载配置文件以及进入开始界面
	 * */
	async startInit(){
		await ConfigMgr.instance.loadConfig();
		this.show(SCENE_PATH.SCENE_START);
	}

	show(prefabPath, params=null, onProgress=null, onComplete=null) {
		if (!onComplete) {
			onComplete = onProgress;
			onProgress = null;
		}
		this.showBannerAd(prefabPath);
		this.showFeedbackBtn(prefabPath);
		let arr = prefabPath.split('/');
		let scriptName = arr[arr.length - 1];
		let loader = this._MainLoader.createSubLoader();
		if (!LOADING_IGNORE_LIST.includes(prefabPath)) {
			this.showLoading();
		}
		loader.load(prefabPath, cc.Prefab, (prefabs) => {
			let prefab: cc.Prefab = prefabs[0];
			let uiNode = cc.instantiate(prefab);
			if (!uiNode) {
				return;
			}
			uiNode.setContentSize(cc.winSize);
			uiNode.setPosition(0, 0);
			let obj:any = <any>uiNode.getComponent(scriptName);
			obj.initLoader(loader);
			obj.show(params);
			if (onComplete) {
				this.hideLoading();
				onComplete();
			}
			else {
				if (scriptName.indexOf('Panel') >= 0) {
					this.scheduleOnce(() => {
						this.hideLoading();
					}, 0.2);
				}
				else {
					this.hideLoading();
				}
			}
		}, (err:Error)=>{
			loader.release();
		},0,()=>{

		});
	}


	closePanel() {
		for (let i = 0; i < this.panelNode.children.length; ++i) {
			let child = this.panelNode.children[i];
			if (child.getComponent(child.name)) {
				child.stopAllActions();
				this.panelNode.removeChild(child, false);
				i--;
			}
		}
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
		let parent = this.sceneNode;
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
		if (this.loadingNode.active) {
			return;
		}
		this.loadingNode.active = true;
		this.playLoadingAction();
	}

	hideLoading() {
		this.loadingNode.active = false;
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
	showTip(content, delay = 1) {
		this.labContent.string = content;
		this.playTipAction(delay);
	}

	playTipAction(delay) {
		this.promt.stopAllActions();
		this.tipNode.active = true;
		this.promt.active = true;
		this.promt.opacity = 0;
		let action1 = cc.fadeIn(0.3);
		let action2 = cc.delayTime(delay);
		let action3 = cc.fadeOut(0.3);
		this.promt.runAction(cc.sequence(action1, action2, action3, cc.callFunc(() => {
			this.tipNode.active = false;
			this.promt.active = false;
			this.promt.opacity = 0;
		})));
	}

	isGuideShow() {
		return !!this.guideNode.children[0];

	}

	showBannerAd(prefabPath) {
		if (DataMgr.instance.bInGuide()) {
			this.bannerNode.active = false;
			return;
		}
		if (BANNER_AD_IGNORE_LIST.includes(prefabPath)) {
			this.bannerNode.active = false;
			return;
		}
		this.bannerNode.getComponent(BannerAd).show();
	}

	showVideoAd(successCallback, failCallback) {
		this.videoNode.getComponent(VideoAd).show(successCallback, failCallback);
	}
	/**投诉按钮控制*/
	showFeedbackBtn(prefabPath) {
		if (DataMgr.instance.bInGuide()) {
			return;
		}
		if (FEEDBACK_LIST.includes(prefabPath)) {
			if (!this._feedBackBtn) {
				this._feedBackBtn = WxSdk.createFeedbackButton();
				return;
			}
			this._feedBackBtn.show();
		}
		else {
			this.hideFeedBackBtn();
		}
		if (DataMgr.instance.sceneGameModel == 1) {
			this.hideFeedBackBtn();
		}
	}

	hideFeedBackBtn() {
		if (this._feedBackBtn) {
			this._feedBackBtn.hide();
		}
	}

}



