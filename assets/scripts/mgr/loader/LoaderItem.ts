/**
 * Created by user on 2018/10/26.
 */
export default class LoaderItem {
	isReleased: boolean = false;      // 是否已被释放
	urls: string[] = [];     // 加载项列表
	type: typeof cc.Asset = null;       // 加载资源类型
	resources: Object = null;       // 所有使用资源的reference id
	maxRetryTimes: number = 0;          // 最大重试次数

	_currentRetryTimes:number = 0;
	constructor(urls: string[]|string,type:typeof cc.Asset,retryTimes:number = 0){
		typeof urls === "string" ? this.urls.push(urls) : this.urls = urls;
		this.type = type;
		this.maxRetryTimes = retryTimes;
		this._currentRetryTimes = 0;
		this.resources = {};
	}
	/*type SUCCESS_CALL  = (res:any[])=>void
		type FAILED_CALL   = (err:Error)=>void
		type ERROR_CALL    = (error:string)=>void
		type PROGRESS_CALL = (completedCount: number, totalCount: number, item: any) => void*/

		/**
		 * 缓存已使用资源
		 * @param resource   缓存单个资源的所有使用资源
		 */
		private _cacheRes (resource: any,errorCall:Function) {
		let loader: any = cc.loader;
		this.resources[loader._getReferenceKey(resource)] = true;
		for (let key of loader.getDependsRecursively(resource)) {
			this.resources[key] = true;
		}
	}

	/**
	 * 开始加载资源
	 * @param successCall    加载成功回调
	 * @param failedCall     加载失败回调
	 * @param progressCall   加载进度回调
	 */
	load (successCall: Function, failedCall:Function, progressCall:Function,errorCall:Function) {
		let completedCallFunc = (error: Error, resources: any[])=>{
			if (!error) {
				for (let res of resources) {
					this._cacheRes(res, errorCall);
				}
				successCall && successCall(resources)
			} else {
				if (this.maxRetryTimes === this._currentRetryTimes) {
					failedCall && failedCall(error)
				} else {
					this._currentRetryTimes += 1;
					return this.load(successCall, failedCall, errorCall, progressCall)
				}
			}
		};
		let callFuncArgs: any[] = [this.urls];
		this.type && callFuncArgs.push(this.type);
		progressCall && callFuncArgs.push(progressCall);
		callFuncArgs.push(completedCallFunc);
		cc.loader.loadResArray.apply(cc.loader, callFuncArgs);
	}

	/**
	 * 释放资源
	 */
	release () {
		this.isReleased = true;
		let resources: string[] = Object.keys(this.resources);
		cc.loader.release(resources);
		this.resources = {}
	}

	/**
	 * 释放资源
	 * @param otherDepends  其它依赖项，释放资源会跳过这些资源
	 */
	releaseWithout (otherDepends: Object) {
		for (let reference in this.resources) {
			if (otherDepends[reference]) {
				delete this.resources[reference];
			}
		}
		this.release();
	}
}


 
 