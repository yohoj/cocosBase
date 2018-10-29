/**
 * Created by user on 2018/10/26.
 */
import LoaderItem from "./LoaderItem";

export default class Loader {
	private _parentLoader: Loader = null;
	private _subLoaders: Loader[] = [];
	private _loadItems: LoaderItem[] = [];
	private _released: boolean  = false;
	/**
	 * 获取到根管理器
	 */
	get rootLoader (): Loader {
		let root: Loader = this;
		while (root._parentLoader) {
			root = root._parentLoader;
		}
		return root;
	}

	/**
	 * 创建子管理器
	 */
	createSubLoader (): Loader {
		let loader = new Loader();
		loader._parentLoader = this;
		this._subLoaders.push(loader);
		return loader;
	}

	/**
	 * 移除子管理器
	 * @param loader  需移除的子管理器
	 */
	private _removeSubLoader (loader:Loader) {
		let index: number = this._subLoaders.indexOf(loader)
		if (index >= 0) {
			this._subLoaders.splice(index, 1)
		}
	}

	/**
	 *
	 * @param urls            加载资源项
	 * @param type            加载资源类型
	 * @param successCall        加载成功回调
	 * @param failCall        加载失败回调
	 * @param retryTimes      重试次数
	 * @param progressCall    加载进度回调
	 */
	load (urls: string[]|string, type:typeof cc.Asset, successCall: Function = null, failCall: Function = null, retryTimes:number = 0, progressCall:Function = null) {
		let item: LoaderItem = new LoaderItem(urls, type, retryTimes);
		let callInNextTick = (fun)=>{setTimeout(()=>{
			fun && fun();
		},200)};
		item.load((res:any[])=>{
			if (this._released|| item.isReleased) {
				// 释放刚加载的资源，需在下一Tick释放，保证其它加载成功
				return callInNextTick (()=>{
					item.releaseWithout(this.rootLoader.getAllResources())
				})
			}
			return successCall && successCall(res)
		}, (error:Error)=>{
			if (this._released) return;
			failCall && failCall(error)
		}, progressCall,()=>{});
		this._loadItems.push(item);
	}

	/**
	 * 释放管理器
	 */
	release () {
		this._released = true;
		this._parentLoader._removeSubLoader(this);
		// 释放当前加载的所有资源，需在当前Tick释放，以让后续的加载请求生效
		let allResources: Object = this.rootLoader.getAllResources();
		this._releaseWithout(allResources);
	}

	/**
	 * 选择性释放资源
	 * @param allResources   不能被释放的资源
	 */
	private _releaseWithout (allResources: Object = null) {
		for (let item of this._loadItems) {
			item.releaseWithout(allResources);
	}
		this._loadItems.length = 0;

		for (let loader of this._subLoaders) {
			loader._releaseWithout(allResources);
		}
	}

	getAllResources(){
		let allResources = {};
		let getResources = (loader)=>{
			loader._loadItems.forEach(item=>{
				allResources = Object.assign(item.resources);
			});
			loader._subLoaders.forEach(l=>{
				getResources(l);
			});
		};
		getResources(this);
		return allResources;
	}

}
 
