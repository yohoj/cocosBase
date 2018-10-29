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

	httpApi(uri, params, method='GET') {
		UIManager.instance.showLoading();
		return callApi(CONFIG_DATA.SERVER_URL, uri, params, method);
	}

	/*reqUserInfo(openId) {
		return this.httpApi('/user/info', {openId,type});
	}*/

}
    