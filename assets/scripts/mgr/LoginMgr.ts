/**
 * Created by yh on 2018/9/6.
 */
import WxSdk from "../wx/WxSdk";
import DataMgr from "./DataMgr";
import AudioMgr from "./AudioMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginMgr extends cc.Component {
	static _instance = null;
	static get instance() {
		if (!this._instance) {
			this._instance = new LoginMgr();
		}
		return this._instance;
	}

	constructor() {
		super();
	}

	_query = null;

	init(): Promise<Object> {
		cc.log('wx init');
		WxSdk.setKeepScreenOn();
		WxSdk.onShow(res => {
			cc.log('onShow:', res);
			AudioMgr.instance.resumeAll();
			//todo
		});
		WxSdk.onHide(() => {
			cc.log('hide');
			AudioMgr.instance.pauseAll();
			//todo
		});
		let data = WxSdk.getLaunchOptionsSync();
		if (data) {
			this._query = data.query;
		}
		let channel = data && data.query && data.query.channel ? data.query.channel : '';
		let referrerInfo = data ? data.referrerInfo : null;
		let querySource = (data && data.query) ? data.query.source : '';
		let referrerSource = (referrerInfo && referrerInfo.extraData) ? referrerInfo.extraData.source : '';
		return new Promise(((resolve, reject) => {
			WxSdk.onShareAppMessage();
			WxSdk.showShareMenu();
			//todo请求配置文件
			resolve();
		}));
	}

	login(callback): Promise<Object> {
		return new Promise(((resolve, reject) => {
			if (!CC_WECHATGAME) {
				//todo
				resolve();
				/*this.setUserInfo(res);
				this.initReq().then(() => {
					resolve && resolve();
				}).catch(err => {
					reject(err);
				});*/
			}
			else {
				WxSdk.login().then((res: any) => {
					cc.log('login success:', res);
					DataMgr.instance.code = res.code;
					this.createUserInfoButton(callback, resolve, reject);
				}).catch(err => {
					reject(err);
				});
			}
		}));
	}

	createUserInfoButton(callback, resolve, reject) {
		let button = WxSdk.createUserInfoButton((res) => {
				cc.log('userInfo:',res);
		});
	}

	/**
	 * 登陆失败处理
	 * */
	reLogin(button,resolve,reject){
		WxSdk.login().then((res: any) => {
			cc.log('login success:', res);
			DataMgr.instance.code = res.code;
			button.show();
		}).catch(err => {
			reject(err);
		});
	}

	setUserInfo(res) {
		DataMgr.instance.userInfo = Object.assign({}, DataMgr.instance.userInfo, res);
		cc.log('req userInfo:', DataMgr.instance.userInfo);
	}

	/**
	 * 初始化请求
	 * */
	initReq() {
		return Promise.all([]);
	}

}
 
 