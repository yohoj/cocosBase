import EventMgr, {EVENT_ID} from "../mgr/EventMgr";
import BadgeMgr from '../mgr/BadgeMgr';

/**
 * Created by yh on 2018/10/11.
 * 角标组件
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class BadgeComponent extends cc.Component {
	@property(cc.String)
	id = '';
	@property(cc.Label)
	labCount = null;

	_bid = [];
	showCount = false;
	onLoad(){
		EventMgr.instance.onAddHandler(EVENT_ID.EVENT_BADGE_DATA_CHANGE,this.onTipDataChange);
		this.bid = this.id;
		this.update();
	}



	onTipDataChange = (data)=>{
		let {id, } = data;
		if(this._bid.indexOf(id) >= 0){
			this.update();
		}
	}


	get bid(){return this._bid.join()}
	set bid(value){
		if(typeof value == 'string'){
			if(this._bid.join() != value){
				this._bid = value.split(',').map(id=>parseInt(id));
				this.update();
			}
		}else{
			this.update();
		}
	}

	update(){
	/*	if(!this.labCount) {
			return;
		}*/

		let sc = this.showCount;

		let tipData = BadgeMgr.instance.getBadgeData(this._bid);
		if(tipData){
			let count = tipData.count;
			this.node.active = count > 0;
			if(this.labCount){
				this.labCount.string = count.toString();
			}
		}else{
			this.node.active = false;
		}

		if(this.labCount){
			this.labCount.string = sc
		}
		if(!sc){
			if(this.labCount){
				this.labCount.string = '';
			}
		}
	}
}


 
 