/**
 * Created by yh on 2018/9/4.
 */
import AudioMgr from '../mgr/AudioMgr';
import DataMgr from "../mgr/DataMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VideoAd extends cc.Component {


	init(successCallback, failCallback) {

		this.node.active = true;
		if (!window.wx) return;
		if (typeof window.wx.createRewardedVideoAd !== "function") return;


		if (this.videoAd) {
			return;
		}
		this.videoAd = wx.createRewardedVideoAd({
			adUnitId: 'adunit-3be2be09281de36b'
		});

		this.videoAd.onLoad(() => {
			// cc.at.audioControl.pauseAll();
			console.log('激励视频 广告加载成功');
			// cc.at.audio.pauseAll();
		});

		this.videoAd.onClose(res => {
			AudioMgr.instance.resumeAll();
			// 用户点击了【关闭广告】按钮
			// 小于 2.1.0 的基础库版本，res 是一个 undefined
			if (res && res.isEnded || res === undefined) {
				if (successCallback) {
					DataMgr.instance.videoCount += 1;
					successCallback();
				}
			} else {
				if (failCallback) {
					failCallback();
				}
				// 播放中途退出，不下发游戏奖励
			}
		});

		this.videoAd.onError(err => {
			console.log(err);
			failCallback(err);
			/*if (err.errCode == 1005) {
				UIManager.instance.getUI(SCRIPTS_NAME.UI_Tip).show("视频复活即将开放");
			} else {
				UIManager.instance.getUI(SCRIPTS_NAME.UI_Tip).show("视频广告加载失败");
				return;
			}*/
		});
	}


	show() {
		return new Promise(((resolve, reject) => {
			if (this.videoAd) {
				this.videoAd.show().then(() => {
					console.log('激励视频 广告显示');
					resolve();
				}).catch(err => {
					this.videoAd.load().then(() => this.videoAd.show())
				});
			}
		}));
	}

	onDisable() {
		// this.node.active = false;
	}


}

 
 