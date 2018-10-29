/**
 * Created by user on 2018/10/25.
 */
import SceneBase from './SceneBase';
import WxSdk from "../../wx/WxSdk";
import DragonBonesMgr from "../../mgr/DragonBonesMgr";
import UIManager from "../../mgr/UIManager";
import {PANEL_PATH, SCENE_PATH} from "../../utils/ResourcePath";
import ConfigMgr from "../../mgr/ConfigMgr";
import LoginMgr from "../../mgr/LoginMgr";
import DataMgr from "../../mgr/DataMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SceneLoading extends SceneBase {
	@property(cc.ProgressBar)
	progressBar = null;
	@property(cc.Label)
	labProgress = null;
	@property(cc.Node)
	nodeLoading = null;
	@property(cc.Label)
	labUpdate = null;

	_totalCount = 3;
	_completeCount = 0;

	onLoad() {
	}

	show() {
		super.show();
		this.labUpdate.node.active = true;
		this.nodeLoading.active = false;
		this.labUpdate.string = '检查更新中...';
		WxSdk.getUpdateManager(this.successCallback, this.failCallback);
		this.init();
	}


	init() {
		this._completeCount = 0;
		this._totalCount = 1;
		this.progressBar.progress = 0;
		this.labProgress.string = '0%';
	}

	successCallback = () => {
		this.labUpdate.node.active = false;
		LoginMgr.instance.init().then(() => {
			LoginMgr.instance.login(this.showLoading).then(() => {
				this.loadGame();
			}).catch(err => {
				UIManager.instance.showTip(err.message);
				throw new Error(err);
			});
		});
	};

	showLoading = () => {
		this.nodeLoading.active = true;
		this.progressBar.progress.active = true;
	};

	failCallback = () => {
		this.labUpdate.string = '更新失败，请重启应用重试';
	};

	loadGame = () => {
		this._completeCount++;
		if (this._completeCount >= this._totalCount) {
				UIManager.instance.show(SCENE_PATH.SCENE_MAIN, null, () => {
					this.close();
				});
		}
	};
}
 
 