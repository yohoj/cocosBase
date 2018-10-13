/**
 * Created by yh on 2018/10/11.
 * 角标管理
 */
import EventMgr, {EVENT_ID} from "./EventMgr";

export const BADGE_ID = {
	SIGN : 21111,
	LOTTO: 21112,
}

const {ccclass, property} = cc._decorator;

/**
 * Created by admin on 2017/6/26.
 *
 * 角标服务
 bid                      系统        显示规则
 21111,21112              签到，转盘     可签到，转盘可以转
 */
@ccclass
export default class BadgeMgr extends cc.Component {
	static _instance = null;
	static get instance(){
		return this._instance;
	}
	badgeData = [];
	onLoad() {
		this.badgeData.splice(0);
		this.init();
		BadgeMgr._instance = this;
	}

	init() {
		EventMgr.instance.onAddHandler(EVENT_ID.EVENT_BADGE_DATA_MODIFY, this.onModifyBadgeData);
	}

	onModifyBadgeData=(data)=> {
		let {id, count} = data;
		this.badgeData[id] = {count};
		EventMgr.instance.onDispatchHandler(EVENT_ID.EVENT_BADGE_DATA_CHANGE,data);
	}

	/**
	 * 根据ID(s)获取提示数据
	 * @param idOrIds
	 */
	getBadgeData(idOrIds) {
		if (Array.isArray(idOrIds)) {
			return {
				count: idOrIds.length == 0 ?
					0 :
					idOrIds.reduce((all, id) => {
						let data = this.getBadgeData(id);
						return all + (data ? data.count : 0);
					}, 0)
			};
		} else {
			return this.badgeData[idOrIds];
		}
	}
}

 
 