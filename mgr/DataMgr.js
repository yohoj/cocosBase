/**
 * Created by yh on 2018/8/14.
 */
import {isToday, toFixed} from "../utils/Utils";
import ConfigMgr, {ATTACK_COUNT, CONFIG_DATA, FIGHT_PERCENT, SHARE_MODULE, STORAGE_TYPE} from "./ConfigMgr";
import UIManager from "./UIManager";
import {PANEL_PATH} from "../utils/ResourcePath";
import EventMgr, {EVENT_ID} from "./EventMgr";
import ShareMgr from "./ShareMgr";
import HttpMgr from "./HttpMgr";
import {BADGE_ID} from "./BadgeMgr";

const storageName = 'feedFish_data_storage';

const {ccclass, property} = cc._decorator;

@ccclass
export default class DataMgr {

	static _instance = null;

	static get instance() {
		if (!this._instance) {
			this._instance = new DataMgr();
		}
		return this._instance;
	}

	_store = null;
	_userInfo = {};
	_serverConfig = null;
	_cacheScore = 0;
	_history = [];//历史记录
	_otherPlayers = [];//附近的人
	_signList = [];//签到列表
	_lottoList = [];//转盘列表
	_sceneGameModel = 0;
	_shareTimeId = 0;
	_records = [];//系统通知列表
	_inviteInfo = null;//邀请信息

	constructor() {
		this.load();
	}

	load() {
		this._store = cc.sys.localStorage.getItem(storageName);
		if (!this._store) {
			this._store = {};
		}
		else {
			this._store = JSON.parse(this._store);
		}
	}

	save() {
		cc.sys.localStorage.setItem(storageName, JSON.stringify(this._store))
	}

	get code() {
		return this._store.code;
	}

	set code(value) {
		this._store.code = value;
	}

	get openId() {
		if(!this._userInfo){
			return 0;
		}
		return this._userInfo.openId;
	}

	/*set openId(value) {
		this._store.openId = value;
		this.save();
	}*/

	//视频次数
	get videoCount() {
		/*let videoInfo = this._store.videoInfo;
		if (!videoInfo) {
			return 0;
		}
		if (isToday(videoInfo.time)) {
			return videoInfo.count;
		}*/
		return this._userInfo.vedioCount;
	}

	set videoCount(value) {
		/*	let time = new Date().getTime();
			this._store.videoInfo = {time: time, count: value};*/
		this._userInfo.vedioCount = value;
		HttpMgr.instance.reqRecordReport(SHARE_MODULE.STORAGE, STORAGE_TYPE.VIDEO_COUNT);
		// this.save();
	}

	get serverConfig() {
		return this._serverConfig;
	}

	set serverConfig(value) {
		let verify = value.backStage_toggle.verify[CONFIG_DATA.CONFIG_VERSION];
		this._serverConfig = value;
		if (verify == 0) {
			this._serverConfig.backStage_toggle = {
				share_config: 1,
				feedbackToggle: 0,
				share_group_config: {shareMaxCount: 1},
				shareAll: {limitGroup: 0, shareType: 0},
				verify: {va: 0, vb: 0},
				moreGameToggle:0,
				goFishToggle:0,
			};
		}
		// this._serverConfig.backStage_toggle.verify =  {va: 1, vb: 1};
	}

	get userInfo() {
		return this._userInfo;
	}

	set userInfo(value) {
		this._userInfo = value;
	}

	get kunList() {
		if (!this._userInfo || !this._userInfo.kunList) {
			return [];
		}
		return this._userInfo.kunList;
	}

	getKunById(fishType) {
		let result = null;
		this._userInfo.kunList.some(kun => {
			if (kun.fishType == fishType) {
				result = kun;
				return true;
			}
		});
		return result;
	}

	//更新鲲
	updateKun(kun) {
		this._userInfo.kunList.some((k, index) => {
			if (k.fishType == kun.fishType) {
				if (!kun.exp) {
					kun.exp = k.exp;
				}
				if (!kun.life) {
					kun.life = k.life;
				}
				if (!kun.feedEndTime) {
					kun.feedEndTime = k.feedEndTime;
				}
				this._userInfo.kunList[index] = kun;
				return true;
			}
		})
	}

	//金币增加数量
	addGold(value) {
		this._userInfo.score += value;
	}

	get score() {
		return this._userInfo.score + this._cacheScore;
	}

	/**
	 * 鲲产生的金币
	 * */
	set cacheScore(value) {
		this._cacheScore = value;
	}

	get cacheScore() {
		return this._cacheScore;
	}

	/**
	 * 离线战斗记录
	 * */
	get history() {
		return this._history;
	}

	set history(value) {
		this._history = value;
	}

	/**
	 *@Description:新手引导
	 *@Param:getKun-获得鲲,plunder-掠夺,levelUp-升级,hunger-饥饿,treat-治疗
	 *@Return:0-未完成,1-已完成
	 *@Date:15:54 2018/9/12
	 */
	get guide() {
		let guide = this._store.guide;
		if (!guide) {
			this._store.guide = {getKun: false, plunder: false, levelUp: false, hunger: false, treat: false};
			this.save();
		}
		return this._store.guide;
	}

	set guide(value) {
		this._store.guide = value;
		this.save();
	}

	/**
	 * 离线战斗记录
	 * */
	set historyTime(value) {
		this._store.historyTime = value;
		this.save();
	}

	get historyTime() {
		return this._store.historyTime ? this._store.historyTime : 0;
	}

	/**
	 * 获取战斗力
	 * */
	get fightValue() {
		let result = 0;
		this._userInfo.kunList.forEach(kun => {
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			let nowTime = new Date().getTime() / 1000;
			result += parseInt(meta.fightValue);
			/*if (kun.feedEndTime > nowTime && parseInt(meta.life) - kun.life > 0) {//
				result += parseInt(meta.fightValue) * (1 - kun.life / parseInt(meta.life));
			}
			else if (parseInt(meta.life) - kun.life > 0 && nowTime - 8 * 60 * 60 > kun.feedEndTime) {//饿晕
				result += Math.floor(parseInt(meta.fightValue) * FIGHT_PERCENT.DEAD * (1 - kun.life / parseInt(meta.life)));
			}
			else if (parseInt(meta.life) - kun.life > 0 && kun.feedEndTime < nowTime) {//饥饿
				result += Math.floor(parseInt(meta.fightValue) * FIGHT_PERCENT.HUNGER * (1 - kun.life / parseInt(meta.life)));
			}*/
		});
		return Math.floor(result);
	}

	/**
	 * 满状态
	 * */
	get fullLife() {
		let result = 0;
		this._userInfo.kunList.forEach(kun => {
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			result += parseInt(meta.life);
		});
		return Math.floor(result);
	}

	get nowLife() {
		let result = 0;
		this._userInfo.kunList.forEach(kun => {
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			result += parseInt(meta.life) - kun.life;
		});
		return Math.floor(result);
	}

	set page(value) {
		this._store.pageInfo = {time: new Date(), page: value};
		this.save();
	}

	get page() {
		if (!this._store.pageInfo) {
			return 1;
		}
		if (isToday(this._store.pageInfo.time)) {
			return this._store.pageInfo.page;
		}
		else {
			this.page = 1;
			return 1;
		}
	}

	clear() {
		this._store = {};
		this.save();
	}

	/**
	 * 掠夺列表
	 * */
	set attackList(openId) {
		if (!this._store.attackList) {
			this._store.attackList = [];
		}
		let flag = this._store.attackList.some(userInfo => {
			if (userInfo.openId == openId) {
				userInfo.time = new Date().getTime();
				return true;
			}
		});
		if (!flag) {
			this._store.attackList.push({openId, time: new Date().getTime()});
		}
		this.save();
	}

	bAttacked(openId) {
		if (!this._store.attackList) {
			return false;
		}
		let result = this._store.attackList.some((userInfo => {
			if (userInfo.openId == openId && isToday(userInfo.time)) {
				return true;
			}
		}));
		return result;
	}

	/**
	 * 分享后1.5倍攻打
	 * */
	setDoubleAttackList(openId) {
		if (!this._store.doubleAttackList) {
			this._store.doubleAttackList = [];
		}
		let flag = this._store.doubleAttackList.some(userInfo => {
			if (userInfo.openId == openId) {
				userInfo.time = new Date().getTime();
				return true;
			}
		});
		if (!flag) {
			this._store.doubleAttackList.push({openId, time: new Date().getTime()});
		}
		this.save();
	}

	bDoubleAttacked(openId) {
		if (!this._store.doubleAttackList) {
			return false;
		}
		let result = this._store.doubleAttackList.some((userInfo => {
			if (userInfo.openId == openId && isToday(userInfo.time)) {
				return true;
			}
		}));
		return result;
	}

	/**
	 * 分享群设置
	 * */
	getShareGroupRecord(groupID) {
		if (!this._store.shareGroupRecord) {
			this._store.shareGroupRecord = {};
		}
		let shareRecordInfo = this._store.shareGroupRecord[groupID];
		if (!shareRecordInfo) {
			return 0;
		}
		if (isToday(shareRecordInfo.time)) {
			return shareRecordInfo.count;
		}
		return 0;
	}

	setShareGroupRecord(groupID, value) {
		/*if (!this._store.shareGroupRecord) {
			this._store.shareGroupRecord = {};
		}
		let time = new Date().getTime();
		let record = {time: time, count: value};
		this._store.shareGroupRecord[groupID] = record;*/
		// console.log("save1 = ", this._store.shareGroupRecord);
		HttpMgr.instance.reqRecordReport(SHARE_MODULE.SHARE_GROUP, groupID);
		// this.save();
	}

	/**
	 * 掠夺次数
	 * */
	get attackCount() {
		let result = 0;
		if (!this._store.attackInfo) {
			result = ATTACK_COUNT;
		}
		else if (!isToday(this._store.attackInfo.time)) {
			result = ATTACK_COUNT;
		}
		else {
			result = this._store.attackInfo.count;
		}
		return Math.max(result - this._userInfo.attackCount,0);
		// return this._userInfo.attackCount;
	}

	getSumAttackCount(){
		let result = 0;
		if (!this._store.attackInfo) {
			result = ATTACK_COUNT;
		}
		else if (!isToday(this._store.attackInfo.time)) {
			result = ATTACK_COUNT;
		}
		else {
			result = this._store.attackInfo.count;
		}
		return Math.max(result,this._userInfo.attackCount);
	}

	/*set attackCount(value) {
		value = Math.min(ATTACK_COUNT, value);
		// this._userInfo.attackCount = value;
		this._store.attackInfo = {time: new Date().getTime(), count: value};
		this.save();
	}*/

	addUserInfoAttackCount(value){
		this._userInfo.attackCount += value;
	}

	addAttackCount(value) {
		value = Math.min(ATTACK_COUNT - this.attackCount, value);
		let result = 0;
		if (!this._store.attackInfo) {
			result = ATTACK_COUNT;
		}
		else if (!isToday(this._store.attackInfo.time)) {
			result = ATTACK_COUNT;
		}
		else {
			result = this._store.attackInfo.count;
		}
		this._store.attackInfo = {time: new Date().getTime(), count: result + value};
		this.save();
	}

	/**
	 * 掠夺判断
	 * */
	attackJudge(userInfo) {
		let count = 0;
		let kunList = DataMgr.instance.kunList;
		kunList.forEach(kun => {
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			let nowTime = new Date().getTime() / 1000;
			if (parseInt(meta.life) <= kun.life || kun.feedEndTime <= nowTime - 8 * 60 * 60) {
				count++;
			}
		});
		if (count >= kunList.length) {//不能战斗
			UIManager.instance.showUI(PANEL_PATH.PANEL_UN_ATTACK);
			return false;
		}
		else if (count > 0) {
			UIManager.instance.showUI(PANEL_PATH.PANEL_ATTACK_TIP, {userInfo});
			return false;
			//提示
		}
		return true;
	}

	get otherPlayers() {
		return this._otherPlayers;
	}

	set otherPlayers(value) {
		this._otherPlayers = value;
	}

	/**
	 * 大宝箱
	 * */
	get bigBox() {
		if (!this._store.bigBoxConfig) {
			this._store.bigBoxConfig = {};
		}
		return this._store.bigBoxConfig.receiveTime;
	}

	set bigBox(value) {
		this._store.bigBoxConfig = {receiveTime: new Date().getTime()};
		this.save();
	}

	/**
	 * 小宝箱
	 * */
	get smallBox() {
		if (!this._store.smallBox) {
			this._store.smallBox = {};
			let nowTime = new Date().getTime();
			this._store.smallBox['0'] = {createTime: 0, receiveTime: nowTime};
			this._store.smallBox['1'] = {createTime: 0, receiveTime: nowTime + 1 * 60 * 60 * 1000};
			this._store.smallBox['2'] = {createTime: 0, receiveTime: nowTime + 2 * 60 * 60 * 1000};
			this._store.smallBox['3'] = {createTime: 0, receiveTime: nowTime + 3 * 60 * 60 * 1000};
		}
		return this._store.smallBox;
	}

	set smallBox({id, createTime, receiveTime}) {
		if (!this._store.smallBox) {
			this._store.smallBox = {};
		}
		this._store.smallBox[id] = {createTime, receiveTime};
	}

	bInGuide() {
		let result = false;
		for (let i in this._store.guide) {
			if (this._store.guide[i] == false && i != 'treat') {
				result = true;
				break;
			}
		}
		return result;
	}

	/**
	 * 签到
	 * */
	set signList(value) {
		this._signList = value;
		let count = this.getSignTipCount();
		EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_BADGE_DATA_MODIFY,{id:BADGE_ID.SIGN,count:count});
		EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_SIGN_UPDATE);
	}

	get signList() {
		return this._signList;
	}

	//获取签到提示
	getSignTipCount(){
		let count = 0;
		this._signList.forEach(sign=>{
			if(sign.status == 1){
				count++;
			}
		});
		return count;
	}

	updateSignList(obj) {
		this._signList.some((sign, index) => {
			if (sign.index == obj.index) {
				this._signList[index] = obj;
				return true;
			}
		});
		let count = this.getSignTipCount();
		EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_BADGE_DATA_MODIFY,{id:BADGE_ID.SIGN,count:count});
		EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_SIGN_UPDATE);
	}

	bShowSign() {
		let result = false;
		if (this.bInGuide()) {
			return result;
		}
		if (!ShareMgr.instance.bOpen()) {
			return result;
		}
		/*result = this._signList.some(s => {
			if (s.status == 1) {
				return true;
			}
		});*/
		result = true;
		return result;
	}

	/**
	 * 护盾个数
	 * */
	get protectCount() {
		return this._userInfo.shield;
	}

	/**
	 * 人民币
	 * */
	set money(value) {
		this._userInfo.money = value;
	}

	get money() {
		return this._userInfo.money;
	}

	/**
	 * 转盘列表
	 * */
	set lottoList(value) {
		this._lottoList = value;
	}

	get lottoList() {
		return this._lottoList;
	}

	/**
	 * 红包
	 * */
	set redPacket(value) {
		// this._store.redPacketInfo = {time: new Date().getTime(), flag: true};
		this._userInfo.redpackCount = value;
		HttpMgr.instance.reqRecordReport(SHARE_MODULE.STORAGE, STORAGE_TYPE.RED_BAG_COUNT);
		// this.save();
	}

	get redPacket() {
		/*if (!this._store.redPacketInfo) {
			return false;
		}
		if (isToday(this._store.redPacketInfo.time)) {
			return this._store.redPacketInfo.flag;
		}
		return false;*/
		return this._userInfo.redpackCount;
	}

	bShowRedPacket() {
		let result = false;
		if (this.bInGuide()) {
			return result;
		}
		if (!ShareMgr.instance.bOpen()) {
			return result;
		}
		if (this.redPacket <= 0) {
			result = true;
		}
		return result;
	}

	/**
	 * 跳转应用列表
	 * */

	get appList() {
		return this._serverConfig.moreGameList;
	}

	get otherGameList() {
		return this._serverConfig.otherGameList;
	}

	/**
	 * 免费治疗时间
	 * */
	get cureTime() {
		if (!this._store.cureTime) {
			this.cureTime = new Date().getTime() - 4 * 60 * 60 * 1000;
		}
		if (this._store.cureTime < new Date(new Date().setHours(0, 0, 0, 0)).getTime()) {
			this.cureTime = new Date().getTime() - 4 * 60 * 60 * 1000;
		}
		return this._store.cureTime;
	}

	set cureTime(value) {
		this._store.cureTime = value;
		this.save();
	}

	/**
	 * 主界面模式
	 * 0 自己 1 他人
	 * */
	get sceneGameModel() {
		return this._sceneGameModel;
	}

	set sceneGameModel(value) {
		this._sceneGameModel = value;
	}

	/**
	 * 分享延时 id
	 * */
	get shareTimeId(){
		return this._shareTimeId;
	}

	set shareTimeId(value){
		this._shareTimeId = value;
	}
	/**
	* 系统通知
	* */
	get records(){
		return this._records;
	}

	set records(value){
		this._records = value;
	}

	/**
	 * 邀请信息
	 * */
	get inviteInfo(){
		return this._inviteInfo;
	}

	set inviteInfo(value){
		this._inviteInfo = value;
		EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_BADGE_DATA_MODIFY,{id:BADGE_ID.LOTTO,count:this._inviteInfo.chance});
		EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_SIGN_UPDATE);
		EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_INVITE_LOTTO);
	}

	addChance(value){
		this._inviteInfo.chance += value;

		EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_BADGE_DATA_MODIFY,{id:BADGE_ID.LOTTO,count:this._inviteInfo.chance});
		EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_SIGN_UPDATE);
	}
}
