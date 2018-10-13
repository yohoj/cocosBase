import ConfigMgr, {FIGHT_PERCENT} from "./ConfigMgr";
import DataMgr from "./DataMgr";

/**
 * Created by yh on 2018/9/20.
 * 战斗管理
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleMgr extends cc.Component {
	static _instance = null;
	static get instance() {
		if (!this._instance) {
			this._instance = new BattleMgr();
		}
		return this._instance;
	}

	_multiple = 1;
	_userInfo = null;
	_selfKunList = [];
	_otherKunList = [];
	_bWin = false;

	_selfLife = 0;
	_otherLife = 0;
	_detail = [];

	constructor() {
		super();
	}

	init(data) {
		this._bWin = false;
		this._selfLife = 0;
		this._otherLife = 0;
		this.multiple = data.multiple ? data.multiple : 1;
		this.userInfo = data.userInfo;
		this.setSelfKunList();
		this.setOtherKunList();
		this._detail = this.calculateFight();
	}

	calculateFight() {
		let selfKunList = [];
		let otherKunList = [];
		this.selfKunList.forEach((kun)=>{
			selfKunList.push({fishType:kun.fishType,life:kun.life,exp:kun.exp,feedEndTime:kun.feedEndTime});
		});
		this.otherKunList.forEach((kun)=>{
			otherKunList.push({fishType:kun.fishType,life:0,exp:kun.exp});
		});
		selfKunList.sort((a, b) => {
			let metaA = ConfigMgr.instance.getKunByExp(a.fishType, a.exp);
			let metaB = ConfigMgr.instance.getKunByExp(b.fishType, b.exp);
			return parseFloat(metaA.speed) - parseFloat(metaB.speed) != 0 ? parseFloat(metaA.speed) - parseFloat(metaB.speed) : parseFloat(metaA.fightValue) - parseFloat(metaB.fightValue);
		});
		otherKunList.sort((a, b) => {
			let metaA = ConfigMgr.instance.getKunByExp(a.fishType, a.exp);
			let metaB = ConfigMgr.instance.getKunByExp(b.fishType, b.exp);
			return parseFloat(metaA.speed) - parseFloat(metaB.speed) != 0 ? parseFloat(metaA.speed) - parseFloat(metaB.speed) : parseFloat(metaA.fightValue) - parseFloat(metaB.fightValue);
		});
		let index = 0;
		while (1) {
			if (index >= 5) {
				index = 0;
			}
			let selfKun = selfKunList[index];
			if (selfKun) {
				let nowTime = new Date().getTime() / 1000;
				let meta = ConfigMgr.instance.getKunByExp(selfKun.fishType, selfKun.exp);
				let fightValue = parseInt(meta.fightValue) * this.multiple;
				/*if (selfKun.feedEndTime > nowTime && parseInt(meta.life) - selfKun.life > 0) {//
					fightValue = parseInt(meta.fightValue) * (1-selfKun.life/parseInt(meta.life));
				}
				else if( parseInt(meta.life) -selfKun.life > 0 && nowTime-8*60*60 > selfKun.feedEndTime){//饿晕
					fightValue = Math.floor(parseInt(meta.fightValue) * FIGHT_PERCENT.DEAD * (1-selfKun.life/parseInt(meta.life)));
				}
				else if(parseInt(meta.life) - selfKun.life > 0 && selfKun.feedEndTime < nowTime){//饥饿
					fightValue = Math.floor(parseInt(meta.fightValue) * FIGHT_PERCENT.HUNGER * (1-selfKun.life/parseInt(meta.life)));
				}*/
				// console.log('fightValue:',fightValue);
				let selfFightValue = Math.floor(fightValue / otherKunList.length);
				for (let i = 0; i < otherKunList.length; ++i) {
					let kun = otherKunList[i];
					kun.life += selfFightValue;
					// DataMgr.instance.updateKun(kun);
					let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
					if (kun.life >= parseInt(meta.life)) {
						otherKunList.splice(i, 1);
						i--;
					}
				}
				if (otherKunList.length <= 0) {
					break;
				}
			}
			let otherKun = otherKunList[index];
			if (otherKun) {
				let otherFightValue = Math.floor(parseFloat(ConfigMgr.instance.getKunByExp(otherKun.fishType, otherKun.exp).fightValue) / selfKunList.length);
				for (let i = 0; i < selfKunList.length; ++i) {
					let kun = selfKunList[i];
					kun.life += otherFightValue;
					let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
					if (kun.life >= parseInt(meta.life)) {
						selfKunList.splice(i, 1);
						i--;
					}
				}
				if (selfKunList.length <= 0) {
					break;
				}
			}
			index++;
		}
		this.bWin = selfKunList.length > 0;
		// console.log(selfKunList,otherKunList);
		this.selfKunList.forEach(kun=>{
			let flag = selfKunList.some(k=>{
				if(kun.fishType == k.fishType){
					return true;
				}
			});
			if(!flag){
				let life = Math.floor(parseInt(ConfigMgr.instance.getKunByExp(kun.fishType,kun.exp).life));
				selfKunList.push({fishType:kun.fishType,life:life,exp:kun.exp,feedEndTime:kun.feedEndTime});
			}
		});
		this.otherKunList.forEach(kun=>{
			let flag = otherKunList.some(k=>{
				if(kun.fishType == k.fishType){
					return true;
				}
			});
			if(!flag){
				let life = Math.floor(parseInt(ConfigMgr.instance.getKunByExp(kun.fishType,kun.exp).life));
				otherKunList.push({fishType:kun.fishType,life:life,exp:kun.exp,feedEndTime:kun.feedEndTime});
			}
		});
		let selfInfo = {
			openId: DataMgr.instance.openId,
			score: this.getWinScore(),
			kunList: selfKunList
		};
		let otherInfo = {
			openId: BattleMgr.instance.userInfo.openId,
			score: -this.getWinScore(),
			kunList: otherKunList,
		}
		let detail = [selfInfo, otherInfo];
		// console.log(detail);
		return detail;
	}

	set multiple(value) {
		this._multiple = value;
	}

	get multiple() {
		return this._multiple;
	}

	set userInfo(value) {
		this._userInfo = value;
	}

	get userInfo() {
		return this._userInfo;
	}

	get fightValue() {
		let result = 0;
		this.userInfo.kunList.forEach(kun => {
			let nowTime = new Date().getTime() / 1000;
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			// result += parseInt(meta.fightValue) * (1-kun.life/parseInt(meta.life));
			result += parseInt(meta.fightValue);
			/*if (kun.feedEndTime > nowTime && parseInt(meta.life) - kun.life > 0) {//
				result += parseInt(meta.fightValue) * (1-kun.life/parseInt(meta.life));
			}
			else if( parseInt(meta.life) - kun.life > 0 && nowTime-8*60*60 > kun.feedEndTime){//饿晕
				result += Math.floor(parseInt(meta.fightValue) * FIGHT_PERCENT.DEAD * (1-kun.life/parseInt(meta.life)));
			}
			else if(parseInt(meta.life) - kun.life > 0 && kun.feedEndTime < nowTime){//饥饿
				result += Math.floor(parseInt(meta.fightValue) * FIGHT_PERCENT.HUNGER * (1-kun.life/parseInt(meta.life)));
			}*/
		});
		return Math.floor(result);
	}

	get otherFullLife() {
		let result = 0;
		this.userInfo.kunList.forEach(kun => {
			let nowTime = new Date().getTime() / 1000;
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			// result += parseInt(meta.fightValue) * (1-kun.life/parseInt(meta.life));
			result += parseInt(meta.life);
		});
		return Math.floor(result);
	}

	get otherNowLife() {
		let result = 0;
		this.userInfo.kunList.forEach(kun => {
			let nowTime = new Date().getTime() / 1000;
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			// result += parseInt(meta.fightValue) * (1-kun.life/parseInt(meta.life));
			result += parseInt(meta.life) - kun.life;
		});
		return Math.floor(result);
	}

	/**
	 * 满状态
	 * */
	get selfFullLife() {
		let result = 0;
		this.selfKunList.forEach(kun => {
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			result += parseInt(meta.life);
		});
		return Math.floor(result);
	}

	get selfNowLife() {
		let result = 0;
		this.selfKunList.forEach(kun => {
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			result += parseInt(meta.life) - kun.life;
		});
		return Math.floor(result);
	}

	get selfKunList() {
		return this._selfKunList;
	}

	get otherKunList() {
		return this._otherKunList;
	}


	setSelfKunList() {
		this._selfKunList = [];
		DataMgr.instance.kunList.forEach(kun => {
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			let nowTime = new Date().getTime() / 1000;
			if (parseInt(meta.life) > kun.life && nowTime - kun.feedEndTime < 8 * 60 * 60) {
				this._selfKunList.push(kun);
			}
		});
		this._selfKunList.sort((a, b) => {
			let metaA = ConfigMgr.instance.getKunByExp(a.fishType, a.exp);
			let metaB = ConfigMgr.instance.getKunByExp(b.fishType, b.exp);
			return parseFloat(metaB.speed) - parseFloat(metaA.speed) == 0 ? parseFloat(metaB.fightValue) - parseFloat(metaA.fightValue) : parseFloat(metaB.speed) - parseFloat(metaA.speed);
		});
	}

	setOtherKunList() {
		this._otherKunList = [];
		this._userInfo.kunList.forEach(kun => {
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			// if(parseInt(meta.life) > kun.life){
			// kun.life = 0;
			this._otherKunList.push(kun);
			// }
		});
		this._otherKunList.sort((a, b) => {
			let metaA = ConfigMgr.instance.getKunByExp(a.fishType, a.exp);
			let metaB = ConfigMgr.instance.getKunByExp(b.fishType, b.exp);
			return parseFloat(metaB.speed) - parseFloat(metaA.speed) == 0 ? parseFloat(metaB.fightValue) - parseFloat(metaA.fightValue) : parseFloat(metaB.speed) - parseFloat(metaA.speed);
		});
	}

	updateSelfKunList(fishType, attackHp) {
		this.selfKunList.some((kun) => {
			if (kun.fishType == fishType) {
				let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
				kun.life += attackHp;
				kun.life = Math.floor(Math.min(kun.life, parseInt(meta.life)));
				return true;
			}
		});
	}

	updateOtherKunList(fishType, attackHp) {
		this.otherKunList.some((kun) => {
			if (kun.fishType == fishType) {
				let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
				kun.life += attackHp;
				kun.life = Math.floor(Math.min(kun.life, parseInt(meta.life)));
				return true;
			}
		});
	}

	/*updateSelfKun(kun) {
		this.selfKunList.some((k) => {
			if (k.fishType == kun.fishType) {
				k.life = kun.life;
				return true;
			}
		});
	}

	updateOtherKun(kun) {
		this.otherKunList.some((k) => {
			if (k.fishType == kun.fishType) {
				k.life = kun.life;
				return true;
			}
		});
	}*/

	set bWin(value) {
		this._bWin = value;
	}

	get bWin() {
		return this._bWin;
	}

	getWinScore() {
		let arr = [0.2, 0.25, 0.3, 0.35, 0.4];
		let result = 0;
		DataMgr.instance.kunList.forEach(kun => {
			let meta = ConfigMgr.instance.getKunByExp(kun.fishType, kun.exp);
			if (parseInt(meta.order) > result) {
				result = parseInt(meta.order);
			}
		});
		let num = this.protectCount > 0 ? 0.9 : 1;
		if (this._bWin) {
			return Math.floor(this._userInfo.score * arr[result - 1] * num);
		}
		else {
			return 0;
		}
	}

	set selfLife(value) {
		this._selfLife = value;
	}

	get selfLife() {
		return this._selfLife;
	}

	set otherLife(value) {
		this._otherLife = value;
	}

	get otherLife() {
		return this._otherLife;
	}

	get protectCount() {
		return this._userInfo.shield;
	}

	get detail(){
		return this._detail;
	}

}
 
 