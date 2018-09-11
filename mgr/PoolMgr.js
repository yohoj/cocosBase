
/**
 * Created by yh on 2018/8/15.
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class PoolMgr {

    static _instance = null;
    static get instance(){
        if(!this._instance){
            this._instance = new PoolMgr();
        }
        return this._instance;
    }

    //批量初始化对象池
    batchInitObjPool(thisO, objArray) {
        let len = objArray.length;
        for (let i = 0; i < len; i++) {
            let objinfo = objArray[i];
            this.initObjPool(thisO, objinfo);
        }
    }

    //初始化对象池
    initObjPool(thisO, objInfo) {
        let name = objInfo.name;
        let poolName = name + 'Pool';
        thisO[poolName] = new cc.NodePool();

        let initPollCount = objInfo.initPollCount;

        for (let ii = 0; ii < initPollCount; ++ii) {
            let nodeO = cc.instantiate(objInfo.prefab); // 创建节点
            nodeO.active = false;
            thisO[poolName].put(nodeO); // 通过 putInPool 接口放入对象池
        }
    }

    //生成节点
    getNewNode(pool, prefab, nodeParent) {
        let newNode = null;
        if (pool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            newNode = pool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            newNode = cc.instantiate(prefab);
        }
        newNode.active = true;
        nodeParent.addChild(newNode);
        return newNode;
    }

    //放回对象池
    backObjPool(thisO, nodeinfo) {
        let poolName = nodeinfo.name + 'Pool';
        nodeinfo.active = false;
        thisO[poolName].put(nodeinfo);
    }

}
    