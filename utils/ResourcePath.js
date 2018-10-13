/**
 * Created by yh on 2018/9/6.
 */
export const SCENE_PATH = {
    SCENE_LOADING: 'prefabs/scenes/SceneLoading',
    SCENE_GAME: 'prefabs/scenes/SceneGame',
    SCENE_BATTLE: 'prefabs/scenes/SceneBattle',
};
export const PANEL_PATH = {
    PANEL_LEVEL_UP: 'prefabs/panels/PanelLevelUp',
    PANEL_OTHERS: 'prefabs/panels/PanelOthers',
    PANEL_RANK_LIST: 'prefabs/panels/PanelRankList',
    PANEL_HISTORY: 'prefabs/panels/PanelHistory',
    PANEL_TIP: 'prefabs/panels/PanelTip',
    PANEL_VICTORY: 'prefabs/panels/PanelVictory',
    PANEL_FAIL: 'prefabs/panels/PanelFail',
    PANEL_GUIDE: 'prefabs/panels/PanelGuide',
    PANEL_OFFLINE: 'prefabs/panels/PanelOFFLINE',
    PANEL_UN_ATTACK: 'prefabs/panels/PanelUnAttack',
    PANEL_ATTACK_TIP: 'prefabs/panels/PanelAttackTip',
    PANEL_POWER_TIP: 'prefabs/panels/PanelPowerTip',
    PANEL_PROTECT_TIP: 'prefabs/panels/PanelProtectTip',
    PANEL_SIGN: 'prefabs/panels/PanelSign',
    PANEL_SIGN_RECEIVE: 'prefabs/panels/PanelSignReceive',
    PANEL_CASH: 'prefabs/panels/PanelCash',
    PANEL_CHESTSLOTTO: 'prefabs/panels/PanelChestsLotto',
    PANEL_RED_BAG: 'prefabs/panels/PanelRedBag',
    PANEL_APP_LIST: 'prefabs/panels/PanelAppList',
    PANEL_OTHER_GAME_JUMP:'prefabs/panels/PanelOtherGameJump',
    PANEL_PHOTO:'prefabs/panels/PanelPhoto',
};

export function loadKunImg(id, level) {
    return new Promise(((resolve, reject) => {
        cc.loader.loadRes('textures/kun/pic_' + id + '_' + level, (err, texture) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(texture);
        })
    }))
}

export function loadKunAnimate(id,state){
	return new Promise(((resolve, reject) => {
		cc.loader.loadRes('animations/battle/' + id + '_' + state, (err, animation) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(animation);
		})
	}))
}

 
 