/**
 * Created by yh on 2018/9/6.
 */
import WxSdk from "../wx/WxSdk";
import HttpMgr,{RECORD_TYPE} from "./HttpMgr";
import DataMgr from "./DataMgr";
import AudioMgr from "./AudioMgr";
import ConfigMgr, {CONFIG_DATA,SHARE_MODULE} from "./ConfigMgr";
import EventMgr, {EVENT_ID} from "./EventMgr";
import UIManager from "./UIManager";

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

	init() {
		console.log('wx init');
		WxSdk.setKeepScreenOn();
		WxSdk.onShow(res => {
			console.log('onShow:', res);
			AudioMgr.instance.resumeAll();
			if (res.referrerInfo) {//&& res.referrerInfo.extraData && res.referrerInfo.extraData.refresh
				console.log('refresh');
				//重新请求用户信息
				HttpMgr.instance.reqUserInfo(DataMgr.instance.userInfo.openId).then(res => {
					this.setUserInfo(res);
					EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_USER_INFO_UPDATE);
				});
			}
		});
		WxSdk.onHide(() => {
			console.log('hide');
			AudioMgr.instance.pauseAll();
			if(DataMgr.instance.cacheScore > 0){
				HttpMgr.instance.reqAddScore(DataMgr.instance.cacheScore).then(() => {
					DataMgr.instance.addGold(DataMgr.instance.cacheScore);
					DataMgr.instance.cacheScore = 0;
					console.log('add score success');
				});
			}
		});
		let data = WxSdk.getLaunchOptionsSync();
		if(data){
			this._query = data.query;
		}
		let channel = data && data.query && data.query.channel ? data.query.channel : '';
		HttpMgr.instance.reqRecordReport(SHARE_MODULE.CHANNEL,channel);
		let referrerInfo = data ? data.referrerInfo : null;
		let querySource = (data && data.query) ? data.query.source : '';
		let referrerSource = (referrerInfo && referrerInfo.extraData) ? referrerInfo.extraData.source : '';
		return new Promise(((resolve, reject) => {
			HttpMgr.instance.reqConfig(querySource).then(serverConfig => {
				DataMgr.instance.serverConfig = serverConfig;
				WxSdk.onShareAppMessage();
				WxSdk.showShareMenu();
				resolve();
			}).catch(err => {
				reject(err);
				throw new Error(err);
			});
		}));
	}

	login(callback) {
		return new Promise(((resolve, reject) => {
			if (!CC_WECHATGAME) {
				DataMgr.instance.userInfo.openId = "o4hA-5RmbWfsNRSnqJf1x2dCNZFo";
				// DataMgr.instance.userInfo.openId = "o4hA-5W99ITvwCrd9LUgfhbgH67Y";
				// DataMgr.instance.userInfo.openId = "o4hA-5SmGjZXQRMgLlJUt5j7Iog0";
				let openId = DataMgr.instance.userInfo.openId;
				HttpMgr.instance.reqUserInfo(openId).then((res) => {
					this.setUserInfo(res);
					this.initReq().then(()=>{
						resolve && resolve();
					}).catch(err=>{
						reject(err);
					});
				}).catch(err => {
					reject(err);
					throw new Error(err);
				});
			}
			else {
				WxSdk.login().then(res => {
					console.log('login success:', res);
					DataMgr.instance.code = res.code;
					this.createUserInfoButton(callback, resolve, reject);
				}).catch(err => {
					reject(err);
				});
			}
			/*WxSdk.checkSession().then(()=>{
					if(!DataMgr.instance.code){

					}
					else{
							this.createUserInfoButton(callback,resolve,reject);
					}
			}).catch(()=>{
					WxSdk.login().then(res => {
							console.log('login success:',res);
							DataMgr.instance.code = res.code;
							this.createUserInfoButton(callback,resolve,reject);
					}).catch(err => {
							reject(err);
					});
			});*/
		}));
	}

	createUserInfoButton(callback, resolve, reject) {
		let button = WxSdk.createUserInfoButton((res) => {
			let userInfo = null;
			console.log('userInfo:', res);
			if (userInfo) {
				return;
			}
			userInfo = res.userInfo;
			if (!userInfo) {
				return;
			}
			res.userInfo.nickname = res.userInfo.nickName;
			delete res.userInfo.nickName;
			callback && callback();
			HttpMgr.instance.reqLoginGame(res, this._query).then(userInfo => {
				//合并两个对象
				DataMgr.instance.userInfo =Object.assign({}, userInfo, res.userInfo);
				console.log('login userInfo:',DataMgr.instance.userInfo);
				HttpMgr.instance.reqUserInfo(userInfo.openId).then((res) => {
					this.setUserInfo(res);
					this.initReq().then(()=>{
						button.destroy();
						resolve && resolve();
					}).catch((err=>{
						reject(err);
						WxSdk.login().then(res => {
							console.log('login success:', res);
							DataMgr.instance.code = res.code;
							button.show();
						}).catch(err => {
							reject(err);
						});
					}));
				});
			}).catch(err => {
				// console.log('',err);
				/*if(err.message == '1003'){
					UIManager.instance.showTip("您正在被人掠夺，暂时无法登入，请稍后再试");
				}*/
				reject(err);
				WxSdk.login().then(res => {
					console.log('login success:', res);
					DataMgr.instance.code = res.code;
					button.show();
				}).catch(err => {
					reject(err);
				});
				throw new Error(err);
			});
		});
	}

	setUserInfo(res){
		DataMgr.instance.userInfo =Object.assign({}, DataMgr.instance.userInfo,res);
		console.log('req userInfo:',DataMgr.instance.userInfo);
		// DataMgr.instance.userInfo.score = res.score;
		// DataMgr.instance.userInfo.kunList = res.kunList;
		// DataMgr.instance.userInfo.money = res.money;
		// DataMgr.instance.userInfo.shield = res.shield;
	}
	/**
	 * 初始化请求
	 * */
	initReq(){
		//离线战斗记录
		let history = HttpMgr.instance.reqHistory(RECORD_TYPE.REVENGE).then(res => {
			DataMgr.instance.history = res;
		});
		//签到列表
		let signList = HttpMgr.instance.reqSignList().then(res=>{
			res.forEach((s,index)=>{
				s.index = index;
			});
			DataMgr.instance.signList = res;
		});
		//转盘列表
		let lottoList_0 = HttpMgr.instance.reqLottoList(0).then((res)=>{

			DataMgr.instance.lottoList[0] = res;
		});
		let lottoList_1 = HttpMgr.instance.reqLottoList(1).then((res)=>{
			DataMgr.instance.lottoList[1] = res;
		});
		let record = HttpMgr.instance.reqRecord().then((res)=>{
			DataMgr.instance.records = res;
		});
		let inviteChance = HttpMgr.instance.reqInviteChance().then((res)=>{
			DataMgr.instance.inviteInfo = res;
		});
		return Promise.all([history,signList,lottoList_0,lottoList_1,record,inviteChance]);
	}

}
 
 