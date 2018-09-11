/**
 * Created by yh on 2018/8/14.
 */
import {isToday} from "../utils/Utils";

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
    _userInfo = {gold:1000,kunList:[]};
    _serverConfig = null;

    constructor() {
        this.load();
    }

    load() {
        this._store = cc.sys.localStorage.getItem(storageName);
        if (!this._store) {
            this._store = {};
            this._store.guide = 0;//新手引导
        }
        else {
            this._store = JSON.parse(this._store);
        }
    }

    save() {
        cc.sys.localStorage.setItem(storageName, JSON.stringify(this._store))
    }

    get openId(){
    	return this._store.openId;
    }

    set openId(value){
    	this._store.openId = value;
    	this.save();
    }

    get videoCount(){
    	let videoInfo = this._store.videoInfo;
    	if(!videoInfo){
    		return 0;
	    }
	    if(isToday(videoInfo.time)){
	    	return videoInfo.count;
	    }
	    return 0;
    }

    set videoCount(value){
    	let time = new Date().getTime();
    	this._store.videoInfo = {time:time,count:value};
    	this.save();
    }

    get serverConfig(){
    	return this._serverConfig;
    }

    set serverConfig(value){
    	this._serverConfig = value;
    }

    get userInfo(){
    	return this._userInfo;
    }

    set userInfo(value){
    	this._userInfo = value;
    }

    get kunList(){
    	if(!this._userInfo){
    		return [];
	    }
    	return this._userInfo.kunList;
    }
		//更新鲲
    updateKun(kun){
    	this._userInfo.kunList.some((k,index) => {
    		if(k.id == kun.id){
    			this._userInfo.kunList[index] = k;
    			return true;
		    }
	    })
    }
		//金币增加数量
    addGold(value){
    	this._userInfo.gold += value;
    }

    get gold(){
    	return this._userInfo.gold;
    }

}
    