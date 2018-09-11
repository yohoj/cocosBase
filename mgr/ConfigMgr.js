/**
 * Created by yh on 2018/9/7.
 */
const {ccclass, property} = cc._decorator;

export const CONFIG_DATA = {
	SERVER_URL: 'http://127.0.0.1:8888',

	CONFIG_VERSION: 'va',
}


@ccclass
export default class ConfigMgr extends cc.Component {
	static _instance = null;
	static get instance() {
		if (!this._instance) {
			this._instance = new ConfigMgr();
		}
		return this._instance;
	}

	_kuns = null;


	//加载配置表文件
	loadConfig(callback) {
		cc.loader.loadRes("configs/config", (err, configSource) => {
			if(err){
				return;
			}
			this._kuns = configSource.kuns;
			callback && callback();
		});
	}


	getKuns(){
		return this._kuns;
	}

	getKunById(id){
		return this._kuns[id];
	}

	getKunByLevel(id,level){
		let result = null;
		let levels = this._kuns[id].levels;
		levels.some(config=>{
			if(config.level == level){
				result = config;
				return true;
			}
		});
		return result;
	}

	getKunByExp(id,exp){
		let result = null;
		let levels = this._kuns[id].levels;
		let exps = [];
		let sum = 0;
		if(exp == 0){
			result = levels[0];
			return result;
		}
		let index = 0;
		for(let i=0; i<levels.length; ++i){
			let kun = levels[i];
			sum += kun.exp;
			if(exp < sum){
				index = i;
				break;
			}
		}
		result = levels[index-1];
		if(exp >= sum){
			result = levels[levels.length-2];
		}
		return result;
	}

	getNeedExp(id,level){
		let result = 0;
		let levels = this._kuns[id].levels;
		level = Math.min(level,levels.length);
		for(let i=0; i<levels.length; ++i){
			let kun = levels[i];
			if(kun.level > level){
				break;
			}
			result += parseInt(kun.exp);
		}
		return result;
	}




}
 
 