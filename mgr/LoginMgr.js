/**
 * Created by yh on 2018/9/6.
 */
import WxSdk from "../wx/WxSdk";
import HttpMgr from "./HttpMgr";
import DataMgr from "./DataMgr";
import AudioMgr from "./AudioMgr";
import ConfigMgr from "./ConfigMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginMgr extends cc.Component {
	static _instance = null;
	static get instance(){
		if(!this._instance){
			this._instance = new LoginMgr();
		}
		return this._instance;
	}

	constructor(){
		super();
		this.init();
	}

	init(){
		console.log('wx init');
		WxSdk.onShow(res=>{
			AudioMgr.instance.resumeAll();
			let query = res.query;
			let roomId = '';
		});
		WxSdk.onHide(()=>{
			console.log('hide');
			AudioMgr.instance.pauseAll();
		});
		let launch = WxSdk.getLaunchOptionsSync();
		console.log('')
	}

	login(callback) {
		return new Promise(((resolve, reject) => {
			WxSdk.checkSession().then(()=>{
				this.createUserInfoButton(callback,resolve,reject);
			}).catch(()=>{
				WxSdk.login().then(res => {
					console.log('login success:',res);
					this.createUserInfoButton(callback,resolve,reject);
				}).catch(err => {
					reject(err);
				});
			});
		}));
	}

	createUserInfoButton(callback,resolve,reject){
		let query = WxSdk.getLaunchOptionsSync();
		console.log('query:',query);
		let userInfo = null;
		WxSdk.createUserInfoButton((res) => {
			if(userInfo){
				return;
			}
			userInfo = res.userInfo;
			if(!userInfo){
				return;
			}
			callback && callback();
			HttpMgr.instance.reqConfig().then(res=>{
				DataMgr.instance.serverConfig = res;
			});
			HttpMgr.instance.reqLoginGame(res, query).then(userInfo => {
				DataMgr.instance.userInfo = userInfo;
				resolve && resolve();
			}).catch(err => {
				reject(err);
				this.createUserInfoButton(callback,resolve,reject);
				throw new Error(err);
			});
		});
	}

}
 
 