/**
 * Created by yh on 2018/8/14.
 */
import {isToday, toFixed} from "../utils/Utils";

const storageName = 'data_storage';

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
	_code = null;
	_serverConfig = null;//配置信息

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

	get code(){
		return this.code;
	}

	set code(value){
		this._code = value;
	}
	/**
	 * 判断是否在引导
	 * */
	bInGuide(){
		return false;
	}


	clear() {
		this._store = {};
		this.save();
	}

	/**
	 * 配置信息
	 * */
	get serverConfig(){
		return this._serverConfig;
	}

	set serverConfig(value){
		this._serverConfig = value;
	}


}
