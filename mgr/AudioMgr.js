/**
 * Created by yh on 2018/8/14.
 */
const {ccclass, property} = cc._decorator;
const audioKey = 'feed_fish_audio_config';
@ccclass
export default class AudioMgr extends cc.Component {
	@property({visible:false,type:[cc.AudioClip]})
	audioClips = [];

	_bgms = ['bg', 'fight_bg'];

	playingBgm = '';

	static get instance() {
		return this._instance;
	}

	static set instance(value) {
		this._instance = value;
	}

	onLoad() {
		AudioMgr.instance = this;
		this.initAudio();
	}

	//初始化音频
	initAudio() {
		this._bgms.forEach(bgm=>{
			this.audioClips.push(this.LoadAudioClipMusic(bgm));
		});
		this.initConfig();
	}

	//获取本地音频
	initConfig() {
		this._config = cc.sys.localStorage.getItem(audioKey);
		if (!this._config || this._config == null || this._config == "") {
			this._config = {};
			this._config.bgmVolume = 1;
			this._config.effectVolume = 2;
			this.save();
			if (this._config.bgmVolume > 0) {
				this.playBgMusic();
			}
		} else {
			this._config = JSON.parse(this._config);
			if (this._config.bgmVolume > 0) {
				this.playBgMusic();
			} else {
				this.pauseMusic();
			}
		}
	}

	getMusicIsPlaying() {
		return this._config.bgmVolume > 0 ? true : false;
	}

	setBGMVolume(value) {
		this._config.bgmVolume = value;
		if (this._config.bgmVolume > 0) {
			this.playBgMusic();
		} else {
			this.pauseMusic();
		}
		this.save();
	}

	setEffectVolume(value) {
		if (this._config.effectVolume != value) {
			this._config.effectVolume = value;
		}
		this.save();
	}

	save() {
		cc.sys.localStorage.setItem(audioKey, JSON.stringify(this._config))
	}

	//音乐路径
	getUrl(url) {
		return cc.url.raw("resources/sounds/" + url);
	}

	//加载背景音乐
	LoadAudioClipMusic(url) {
		return cc.url.raw("resources/sounds/"+url+".mp3");
	}

	//加载播放背景音乐
	playBgMusic() {
		if(this._config.bgmVolume <= 0){
			return;
		}
		if(this._playingBgm == this.audioClips[0]){
			return;
		}

		this.stopMusic();
		this.current = cc.audioEngine.play(this.audioClips[0], true, this._config.bgmVolume);
		this._playingBgm = this.audioClips[0];
		/*this.audioSource.clip = this.audioClips[0];
		this.audioSource.loop = true;
		this.audioSource.play();*/
	}

	playFightBgMusic(){
		if(this._config.bgmVolume <= 0){
			return;
		}
		if(this._playingBgm == this.audioClips[1]){
			return;
		}
		this.stopMusic();
		this.current = cc.audioEngine.play(this.audioClips[1], true, this._config.bgmVolume);
		this._playingBgm = this.audioClips[1];
	}

	pauseMusic() {
		if(this.current == undefined || this.current == null){
			return;
		}
		cc.audioEngine.pause(this.current);
	}

	resumeMusic(){
		if(this.current == undefined || this.current == null){
			return;
		}
		cc.audioEngine.resume(this.current);
	}

	stopMusic() {
		if(this.current == undefined || this.current == null){
			return;
		}
		cc.audioEngine.stop(this.current);
	}

	playCommonBtn() {
		this.playEffect_NoSuffix("common_btn");
	}

	playFeedEffect() {
		this.playEffect_NoSuffix("feed");
	}

	playLevelUpEffect() {
		this.playEffect_NoSuffix("levelup");
	}

	playDongEffect() {
		this.playEffect_NoSuffix("dong");
	}

	playFightEffect() {
		this.playEffect_NoSuffix('fight');
	}

	playAttackEffect(fishType){
		this.playEffect_NoSuffix('battle/attack_'+fishType);
	}

	playDefenseEffect(fishType){
		this.playEffect_NoSuffix('battle/defense_'+fishType);
	}

	playFailEffect() {
		this.playEffect_NoSuffix("fail");
	}

	playVictoryEffect() {
		this.playEffect_NoSuffix("victory");
	}

	playFixEffect() {
		this.playEffect_NoSuffix('fix');
	}

	playGoldEffect() {
		this.playEffect_NoSuffix('gold');
	}

	playCommonGame(url) {
		this.playEffect_NoSuffix(url);
	}

	playLottoEndEffect()
	{
       this.playEffect_NoSuffix('Lotto/LottoEnd');
	}
	playLottoStartEffect()
	{
		if (this._config.effectVolume <= 0) {
			return;
		}
		this.stopMusic();
		let audioUrl = this.getUrl('Lotto/LottoStart' + ".mp3");
		this.LottoStartId=cc.audioEngine.play(audioUrl, true, this._config.effectVolume);
	}
	stopLottoStartEffect()
	{
		cc.audioEngine.stop(this.LottoStartId);

		this.resumeMusic();
	}


	//不用带后缀
	playEffect_NoSuffix(url) {
		if (this._config.effectVolume <= 0) {
			return;
		}
		let audioUrl = this.getUrl(url + ".mp3");
		cc.audioEngine.play(audioUrl, false, this._config.effectVolume);
	}

	pauseAll() {
		cc.audioEngine.pauseAll();
	}

	resumeAll() {
		cc.audioEngine.resumeAll();
	}

}
    