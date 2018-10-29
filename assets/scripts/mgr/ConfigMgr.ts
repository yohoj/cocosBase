/**
 * Created by yh on 2018/9/7.
 */
import {PANEL_PATH, SCENE_PATH} from "../utils/ResourcePath";
import DataMgr from "./DataMgr";

const {ccclass, property} = cc._decorator;

export const CONFIG_DATA = {
	// SERVER_URL: 'http://192.168.6.100:31370',
	SERVER_URL: 'https://rogame.51dataedu.com/https/feedfish/va',


	CONFIG_VERSION: 'va',
};

export const SHARE_TYPE = cc.Enum({
	NONE: 0,//只有领取
	VIDEO: 1,//纯视频
	SHARE: 2,//纯分享
	DOUBLE: 3,//5次视频后在分享
});

/*视频最大观看次数*/
export const VIDEO_MAX_COUNT = 5;

/*加载动画忽略界面*/
export const LOADING_IGNORE_LIST:any = [];
/*广告banner忽略界面*/
export const BANNER_AD_IGNORE_LIST:any = [];
/*投诉按钮忽略界面*/
export const FEEDBACK_LIST:any = [];


@ccclass
export default class ConfigMgr extends cc.Component {
	static _instance = null;
	static get instance() {
		if (!this._instance) {
			this._instance = new ConfigMgr();
		}
		return this._instance;
	}

	_config = null;


	//加载配置表文件
	loadConfig() {
		return new Promise((resolve, reject) => {
			cc.loader.loadRes("configs/config", (err, configSource) => {
				if (err) {
					reject(err);
					return;
				}
				this._config = configSource.json;
				DataMgr.instance.serverConfig = this._config.serverConfig;
				resolve();
			});
		});
	}

}
 
 