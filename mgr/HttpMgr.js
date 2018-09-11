import {callApi} from "../net/WebServices"
import {CONFIG_DATA} from "./ConfigMgr";

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
        return callApi(CONFIG_DATA.SERVER_URL, uri, params, method);
    }

    reqUserInfo(openId) {
        return this.httpApi('/getMyself/userInfo', {openId});
    }

    reqConfig() {
        return this.httpApi('/config', {version : CONFIG_DATA.VERSION});
    }

    //登录
    reqLoginGame({code,encryptedData,iv},query) {
        let params = {code,encryptedData,iv};
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

}
    