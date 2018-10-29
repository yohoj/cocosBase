/**
 * Created by yh on 2018/9/4.
 */
import AudioMgr from '../mgr/AudioMgr';
import DataMgr from "../mgr/DataMgr";
import UIManager from "../mgr/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VideoAd extends cc.Component {
	_successCallback = null;
	_failCallback = null;

	_flag = false;

	videoAd = null;
	init() {

		this.node.active = true;
		if (!window.wx) return;
		if (typeof window.wx.createRewardedVideoAd !== "function") return;


		if (this.videoAd) {
			return;
		}
		this.videoAd = wx.createRewardedVideoAd({
			adUnitId: 'adunit-6c3fb88b35c82a79'
		});

		this.videoAd.onLoad(() => {
			// cc.at.audioControl.pauseAll();
			console.log('激励视频 广告加载成功');
			// cc.at.audio.pauseAll();
		});

		this.videoAd.onClose(res => {
			this._flag = false;
			AudioMgr.instance.resumeAll();
			// 用户点击了【关闭广告】按钮
			// 小于 2.1.0 的基础库版本，res 是一个 undefined
			if (res && res.isEnded || res === undefined) {
				DataMgr.instance.videoCount += 1;
				this._successCallback && this._successCallback();
			} else {
				this._failCallback && this._failCallback();
				// 播放中途退出，不下发游戏奖励
			}
		});

		this.videoAd.onError(err => {
			console.log(err);
			this._flag = false;
			this._successCallback && this._successCallback();
			DataMgr.instance.videoCount += 1;
			/*if (err.errCode == 1005) {
				UIManager.instance.showTip("视频广告即将开放");
			} else {

				// UIManager.instance.showTip("视频广告加载失败");
				return;
			}*/
		});
	}


	show(successCallback,failCallback) {
		return new Promise(((resolve, reject) => {
			if(!CC_WECHATGAME){
				successCallback && successCallback();
				resolve();
			}
			if (this.videoAd && !this._flag) {
				this._flag = true;
				this.videoAd.show().then(() => {
					console.log('激励视频 广告显示');
					this._successCallback = successCallback;
					this._failCallback = failCallback;
					resolve();
				}).catch(err => {
					this._flag = false;
					this.videoAd.load().then(() => this.videoAd.show())
				});
			}
		}));
	}

	onDisable() {
		// this.node.active = false;
	}


}

 
 