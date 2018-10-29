import DataMgr from "./DataMgr";
import {CONFIG_DATA, SHARE_TYPE, VIDEO_MAX_COUNT} from "./ConfigMgr";
import UIManager from "./UIManager";
import WxSdk from "../wx/WxSdk";

/**
 * Created by yh on 2018/9/18.
 * 分享控制
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class ShareMgr extends cc.Component {
	static _instance = null;
	static get instance() {
		if (!this._instance) {
			this._instance = new ShareMgr();
		}
		return this._instance;
	}

	setShareConfig(noneCallback, otherCallback) {
		let shareConfig = DataMgr.instance.serverConfig.backStage_toggle.share_config;
		switch (shareConfig) {
			case SHARE_TYPE.NONE://只有一个领取
				noneCallback && noneCallback();
				break;
			case SHARE_TYPE.VIDEO://纯视频
			case SHARE_TYPE.SHARE://纯分享
			case SHARE_TYPE.DOUBLE://
				otherCallback && otherCallback();
				break;
		}
	}

	bOpen() {
		let verify = DataMgr.instance.serverConfig.backStage_toggle.verify[CONFIG_DATA.CONFIG_VERSION];
		switch (verify) {
			case 0://关
				return false;
			case 1://开
				return true;
		}
	}

	shareDeal(moduleId, typeId, successCallback, failCallback) {
		let shareConfig = DataMgr.instance.serverConfig.backStage_toggle.share_config;
		switch (shareConfig) {
			case SHARE_TYPE.NONE:
				successCallback && successCallback();
				break;
			case SHARE_TYPE.VIDEO://纯视频
				UIManager.instance.showVideoAd(() => {
					successCallback && successCallback();
				}, () => {
					failCallback && failCallback();
				});
				break;
			case SHARE_TYPE.SHARE://纯分享
				WxSdk.shareAppMessage(moduleId, typeId).then((res) => {
					WxSdk.isShareGroup(res).then((result) => {
						switch (result) {
							case 0:
								successCallback && successCallback();
								break;
							case 1:
								failCallback && failCallback();
								UIManager.instance.showTip('请分享到群');
								break;
							case 2:
								failCallback && failCallback();
								UIManager.instance.showTip('换个群试试');
								break;
						}
					});
				}).catch(() => {
					failCallback && failCallback();
				});
				break;
			case SHARE_TYPE.DOUBLE://
				if (DataMgr.instance.videoCount >= VIDEO_MAX_COUNT) {
					WxSdk.shareAppMessage(moduleId, typeId).then((res) => {
						WxSdk.isShareGroup(res).then((result) => {
							switch (result) {
								case 0:
									successCallback && successCallback();
									break;
								case 1:
									failCallback && failCallback();
									UIManager.instance.showTip('请分享到群');
									break;
								case 2:
									failCallback && failCallback();
									UIManager.instance.showTip('换个群试试');
									break;
							}
						});
					}).catch(() => {
						failCallback && failCallback();
					});
				}
				else {
					UIManager.instance.showVideoAd(() => {
						successCallback && successCallback();
					}, () => {
						failCallback && failCallback();
					});
				}
				break;
		}
	}
}
 
 