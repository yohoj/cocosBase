/**
 * Created by yh on 2018/7/26.
 */
import ServerMgr from "../mgr/ServerMgr";

export default class Server {
	ready(url, protos) {
		this._url = url;
		this._protos = protos;

		return this._initialize();
	}

	connect() {
		if (!this._connected) {
			if(!this._serverSession){
				this._serverSession = teleportjs.dial(this._url);
				this._bindEvent();
			}
			else{
				this._serverSession.connect(this._url);
			}

		}
		return new Promise(((resolve, reject) => {
			this._resolve = resolve;
		}))
	}

	request(name, data) {
		return this._serverSession.request('game.' + name, data)
	}

	on(event, pName, listener = null) {
		this._serverSession.on(event, pName, listener);
	}

	_initialize() {
		return new Promise(resolve => {
			if (this._initialized) {
				resolve();
			} else {
				Promise.all(this._protos.map(name => {
					return this._loadProto(name)
				})).then(() => {
					this._initialized = true;
					resolve();
				});
			}
		})
	}

	_loadProto(name) {
		return new Promise(((resolve, reject) => {
			cc.loader.loadRes("proto/" + name, (err, protoSource) => {
				if (err) {
					reject(err);
				} else {
					teleportjs.addProtoSource(name, protoSource);
					resolve();
				}
			});
		}));
	}

	_bindEvent() {
		let session = this._serverSession;

		let {CONNECT, CLOSE, ERROR} = teleportjs.events;
		session.on(CONNECT, this._onConnect);
		session.on(CLOSE, this._onClose);
		session.on(ERROR, this._onError);
		// session.on('game.SystemNotifyType',(({type,content})=>{
		// 	console.log(content);
		// }))
		/*session.on('/core/kickOut', 'common.KickOutNotify', (args) => {
			console.log(args);
			//this._emitMessageEvent(messageName, message, eid);
		});*/
	}

	_onConnect = (event) => {
		this._connected = true;
		this._resolve();
	};

	_onClose = (event) => {
		this._connected = false;
		ServerMgr.instance.reconnect().then(()=>{
			console.log('reconnect');
		});
		console.log('connect close');
	};

	_onError = (event) => {
		console.log('connect error');
	};

	get connected(){
		return this._connected;
	}
}
 
 