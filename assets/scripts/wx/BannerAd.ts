/**
 * Created by yh on 2018/9/4.
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class BannerAd extends cc.Component {

// 接口文档：https://developers.weixin.qq.com/minigame/dev/document/open-api/game-club/wx.createGameClubButton.html

	_bannerAd_Interval = 30;

	bannerAd = null;

	onLoad() {

	};

	show(config, index) {
		// console.log("ad_config_show", config);
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}

		// this._adUnitId = config.bannerAd_adUnitId;
		// this._bannerAd_Interval = config.bannerAd_Interval;
		this.node.active = true;

		// this.node.setPosition(config.bannerAd_pos[index].xPos, config.bannerAd_pos[index].yPos);
		// this.node.width = config.bannerAd_pos[index].widthX;
		// this.node.height = config.bannerAd_pos[index].heightY;

		this.create();

		// this.schedule(this.create, this._bannerAd_Interval);

	}


	onDisable() {
		this.node.active = false;
		console.log("bannerAd is disable!");
		if(!this.bannerAd){
			return;
		}

		this.bannerAd.hide();
		this.unschedule(this.create);
	}


	// onHide(){
	//    this.onSetActive();
	// },


	// 创建
	create = ()=> {
		let vis = cc.view.getVisibleSize();
		let fra = cc.view.getFrameSize();
		let scaleX = fra.width / vis.width;
		let scaleY = fra.height / vis.height;
		let width = this.node.width * scaleX;
		let height = this.node.height * scaleY;
		let top = (fra.height / 2 - this.node.y * scaleY) - height / 2;
		let left = (fra.width / 2 + this.node.x * scaleX) - width / 2-20;
		// console.log(left,top,width,height);
		if (this.bannerAd) {
			this.bannerAd.destroy();
		}

		this.bannerAd = wx.createBannerAd({
			adUnitId: 'adunit-d00b7d3ede10f449',
			style: {
				left: left,
				top: top,
				width: width,
				height: height,
			}
		});
		this.bannerAd.show();
	}


}
