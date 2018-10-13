import {callApi} from "../net/WebServices"
import {CONFIG_DATA} from "./ConfigMgr";
import DataMgr from "./DataMgr";
import UIManager from "./UIManager";

export const RECORD_TYPE = cc.Enum({
	ATTACK: 0,
	REVENGE: 1,
});
/**
 * Created by yh on 2018/8/14.
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class HttpMgr {

	static _instance = null;

	static get instance() {
		if (!this._instance) {
			this._instance = new HttpMgr();
		}
		return this._instance;
	}

	httpApi(uri, params, method) {
		if(uri != '/turntable/chance'){
			UIManager.instance.showLoading();
		}
		return callApi(CONFIG_DATA.SERVER_URL, uri, params, method);
	}

	reqUserInfo(openId) {
		if(!openId){
			return Promise.reject();
		}
		let type = openId == DataMgr.instance.openId ? 0 : 1;
		//?openId=o4hA-5RmbWfsNRSnqJf1x2dCNZFo
		return this.httpApi('/user/info', {openId,type});
	}

	reqConfig(querySource) {
		return this.httpApi('/config', {version: CONFIG_DATA.VERSION, query: querySource});
	}

	//登录
	reqLoginGame({encryptedData, iv}, query) {
		let params = {encryptedData, iv};
		params.code = DataMgr.instance.code;
		// 邀请人OpenId
		if (query) {
			for (let k in query) {
				params[k] = query[k];
			}
		}
		// {account, password}
		console.log("req login =", params);
		return this.httpApi('/login', params);
	}

	/**
	 * 喂食
	 * @param score
	 * */
	reqFeed(score) {
		let openId = DataMgr.instance.userInfo.openId;
		return this.httpApi('/kun/feed', {openId, score})
	}

	/**
	 * 治疗
	 * @param score
	 * */
	reqFix(score) {
		let openId = DataMgr.instance.userInfo.openId;
		return this.httpApi('/kun/treat', {openId, score});
	}

	/**
	 * 升级
	 * @param score,
	 * @param fishType
	 * */
	reqLevelUp(score, fishType, exp) {
		let openId = DataMgr.instance.userInfo.openId;
		return this.httpApi('/kun/upgrade', {openId, score, fishType, exp});
	}

	/**
	 * 排行 战力
	 * */
	reqFightRank() {
		let openId = DataMgr.instance.userInfo.openId;
		return this.httpApi('/top', {openId});
	}

	/**
	 *排行 财富
	 *
	 **/
	reqFortuneRank() {
		let openId = DataMgr.instance.userInfo.openId;
		return this.httpApi('/top/score', {openId});
	}


	/**
	 * 附近的人
	 * */
	reqOtherPlayers(page = 1, searchValue = '') {
		let openId = DataMgr.instance.userInfo.openId;
		return this.httpApi('/nearby/user', {openId, page, searchValue});
	}

	/**
	 * 战斗记录  增加参数type：0进攻、1防守
	 * */
	reqHistory(type) {
		let openId = DataMgr.instance.userInfo.openId;
		return this.httpApi('/attack/list', {openId, type});
	}

	/**
	 * 进攻
	 * @param toOpenId
	 * */
	reqAttack(toOpenId) {
		let openId = DataMgr.instance.userInfo.openId;
		return this.httpApi('/attack', {openId, toOpenId});
	}

	/**
	 * 加减分数
	 * */
	reqAddScore(score, type = 0) {
		let openId = DataMgr.instance.userInfo.openId;
		return this.httpApi('/user/addScore', {openId, score, type});
	}

	/**
	 * 进攻报告/attack/report?detail=
	 * */
	reqAttackReport(detail) {
		console.log(detail);
		return this.httpApi('/attack/report', {detail: JSON.stringify(detail)});
	}

	/**
	 * 日志记录
	 *
	 * */
	reqRecordReport(moduleId, typeId) {
		let openId = DataMgr.instance.userInfo && DataMgr.instance.openId ? DataMgr.instance.openId : '';
		console.log('typeId:',typeId);
		return this.httpApi('/record', {openId, moduleId, typeId});
	}

	/***
	 * 是否是同一个群
	 * */
	reqShareGroupInfo({encryptedData, iv}) {
		let openId = DataMgr.instance.openId;
		return this.httpApi('/share/info', {openId, encryptedData, iv});
	}

	/**
	 * 签到列表
	 * */
	reqSignList() {
		let openId = DataMgr.instance.openId;
		return this.httpApi('/sign/list', {openId});
	}

	/**
	 * 签到领取
	 * */
	reqSignRecv() {
		let openId = DataMgr.instance.openId;
		return this.httpApi('/sign/recv', {openId});
	}

	/**
	 * 签到确认
	 * */
	reqSignSubmit() {
		let openId = DataMgr.instance.openId;
		return this.httpApi('/sign/submit', {openId});
	}

	//转盘列表
	reqLottoList(type) {
		let openId = DataMgr.instance.openId;
		return this.httpApi('/turntable/list', {openId,type});
	}

	//转盘请求
	reqLottoRequire(type) {
		let openId = DataMgr.instance.openId;
		return this.httpApi('/turntable/recv', {openId,type});
	}

	/**
	 * 红包领取
	 * */
	reqRedBagRecv() {
		let openId = DataMgr.instance.openId;
		return this.httpApi('/redpack/recv', {openId});
	}

	/**
	 * 红包确认  0-红包,1-金币
	 * */
	reqRedBagSubmit(type) {
		let openId = DataMgr.instance.openId;
		return this.httpApi('/redpack/submit', {openId, type});
	}

	/**
	 * 系统通知
	 * /redpack/record
	 * */
	reqRecord(){
		let openId = DataMgr.instance.openId;
		return this.httpApi('/redpack/record', {openId});
	}

	/**
	 * 邀请次数
	 *
	 * */
	reqInviteChance(){
		let openId = DataMgr.instance.openId;
		return this.httpApi('/turntable/chance', {openId});
	}
}
    