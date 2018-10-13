/**
 * Created by yh on 2018/10/5.
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class DragonBonesMgr extends cc.Component {
	static _instance = null;
	static get instance() {
		if (!this._instance) {
			this._instance = new DragonBonesMgr();
		}
		return this._instance;
	}

	/**
	 * 动态加载龙骨
	 * @param animationDisplay 龙骨组件
	 * @param path 龙骨地址
	 * @param armatureName Armature名称
	 * @param newAnimation Animation名称
	 * @param completeCallback 动画播放完毕的回调
	 * @param playTimes 播放次数 -1是根据龙骨文件 0五险循环 >0是播放次数
	 */
	loadDragonBones(animationDisplay, path, armatureName, newAnimation, loadCompleteCallback,playCompleteCallback, playTimes = 1) { //动态加载龙骨
		if(!animationDisplay){
			return;
		}
		if(animationDisplay.armature()){
			animationDisplay.armature().animation.stop();
		}
		animationDisplay.dragonAsset = null;
		animationDisplay.dragonAtlasAsset = null;
		cc.loader.loadResDir(path, function (err, assets) {
			if (err || assets.length <= 0) return;
			assets.forEach(asset => {
				if (asset instanceof dragonBones.DragonBonesAsset) {
					animationDisplay.dragonAsset = asset;
				}
				if (asset instanceof dragonBones.DragonBonesAtlasAsset) {
					animationDisplay.dragonAtlasAsset = asset;
				}
			});

			animationDisplay.armatureName = armatureName;
			animationDisplay.armature().animation.play(newAnimation, playTimes);
			if (playCompleteCallback){
				animationDisplay.addEventListener(dragonBones.EventObject.COMPLETE, playCompleteCallback);
			}
			loadCompleteCallback && loadCompleteCallback()
		})
	}

	releaseDragonBones(url){
		cc.loader.releaseResDir(url , cc.Texture2D);
	}
}
 
 