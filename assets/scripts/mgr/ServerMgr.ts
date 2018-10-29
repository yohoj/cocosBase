/**
 * Created by yh on 2018/7/26.
 */

import Server from "../net/Server";
import {CONFIG_DATA} from "./ConfigMgr";

export default class ServerMgr {
	static _instance = null;
	static get instance() {
		if (!this._instance) {
			this._instance = new ServerMgr();
		}
		return this._instance;
	}

	_gameServer;

	constructor() {
		this._gameServer = new Server();
	}

	ready() {
		return this._gameServer.ready(CONFIG_DATA.SERVER_URL, ['game']);
	}

	getServer() {
		return this._gameServer;
	}

	//socket 测试
	connect() {
		this.ready().then(() => {
			this._gameServer.connect().then(() => {
				this.configReq(CONFIG_DATA.CONFIG_VERSION);
				// this._gameServer.on('SystemNotify', this.onSystemNotify.bind(this));
			});
			console.log('server init.');
		}).catch(err => {
			console.log('ready err:', err);
		})
	}

	reconnect(){
		return new Promise((resolve, reject) => {
			this._gameServer.connect().then(()=>{
				this.configReq(CONFIG_DATA.CONFIG_VERSION);
			});
		});

	}

	//请求配置信息
	configReq(version) {

	}

	login(token) {
			this._gameServer.request();
	}
}
 