/**
 *Description:
 *Date:2018/9/15 9:44
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class ClearStoreRecord extends cc.Component {


    onLoad() {

    }

    onBtnClearStoreRecord(){
        cc.sys.localStorage.clear();
    }

}
    