/**
 * Created by yh on 2018/9/6.
 */
export const SCENE_PATH = {
	SCENE_LOADING: 'prefabs/scenes/SceneLoading',
	SCENE_GAME: 'prefabs/scenes/SceneGame',
	SCENE_BATTLE: 'prefabs/scenes/SceneBattle',
};
export const PANEL_PATH = {
	PANEL_TEST: 'prefabs/panels/PanelTest',
	PANEL_LEVEL_UP: 'prefabs/panels/PanelLevelUp',
	PANEL_OTHERS: 'prefabs/panels/PanelOthers',
	PANEL_RANK_LIST: 'prefabs/panels/PanelRankList',
	PANEL_HISTORY: 'prefabs/panels/PanelHistory',
	PANEL_TIP: 'prefabs/panels/PanelTip',
};

export function loadKunImg(id,level) {
	return new Promise(((resolve, reject) => {
		cc.loader.loadRes('textures/kun/pic_' + id + '_' + level,(err,texture)=>{
			if(err){
				reject(err);
				return;
			}
			resolve(texture);
		})
	}))
}

 
 