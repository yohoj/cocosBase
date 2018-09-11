

/**
 * Created by yh on 2018/8/15.
 * 管理中心
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class MgrCenter {

    static _instance = null;

    static get instance() {
        if (!this._instance) {
            this._instance = new MgrCenter();
        }
        return this._instance;
    }

    _UIMgr = null;
    _GameMgr = null;


}
    