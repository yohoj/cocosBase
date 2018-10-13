/**
 * Created by yh on 2018/7/26.
 */
// import ServerManager from "../net/ServerManager";
import {makeRandomInt} from "../utils/Utils";
import DataMgr from "../mgr/DataMgr";
import HttpMgr from "../mgr/HttpMgr";
import {SHARE_MODULE} from "../mgr/ConfigMgr";

export default class WxSdk {
	static _weGameConfig = {
		code: "",
		userInfo: {},
		query: ""//小游戏的参数
	};

	/**
	 * 验证登录状态
	 * */
	static checkSession() {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return new Promise(((resolve, reject) => {
				reject('is not wechat game');
			}));
		}
		return new Promise((resolve, reject) => {
			let checkObj = {
				success: (res) => {
					console.log('checkSession success', res);
					resolve();
				},
				fail: (res) => {
					console.log('checkSession fail', res);
					reject();
				},
			};
			wx.checkSession(checkObj);
		});
	}

	/**
	 * 登录
	 * */
	static login() {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return new Promise(((resolve, reject) => {
				reject('is not wechat game');
			}));
		}
		return new Promise((resolve, reject) => {
			// let checkObj = {
			// success: () => {
			// 	resolve();
			// },
			// fail: () => {
			let loginObj = {
				success: (res) => {
					resolve(res);
				},
				fail: (res) => {
					reject(res.errMsg);
				},
			};
			wx.login(loginObj);
			// },
			// };
			// wx.checkSession(checkObj);
		});
	}

	/**
	 * 获取授权
	 * @param scope string 需要获取权限的 scope
	 * */
	static authorize(scope) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return new Promise(((resolve, reject) => {
				reject('is not wechat game');
			}));
		}
		return new Promise(((resolve, reject) => {
			let obj = {
				scope: scope,
				success: () => {
					resolve();
				},
				fail: () => {
					reject();
				}
			};
			wx.authorize(obj);
		}));

	}

	/**
	 * 创建用户信息按钮
	 * */
	static createUserInfoButton(successCallback) {
		let vis = cc.view.getVisibleSize();
		let fra = cc.view.getFrameSize();
		let scaleX = fra.width / vis.width;
		let scaleY = fra.height / vis.height;
		let width = 367 * scaleX;
		let height = 122 * scaleY;
		let top = (fra.height / 2 - (-400) * scaleY) - height / 2;
		let left = (fra.width / 2 + 0 * scaleX) - width / 2;
		let button = wx.createUserInfoButton({
			type: 'image',
			text: '开始游戏',
			image: 'https://game.51dataedu.com/start_game/gold_fish/start_game.png',
			style: {
				left: left,
				top: top,
				width: width,
				height: height,
				lineHeight: 40,
				backgroundColor: '#ff0000',
				color: '#ffffff',
				textAlign: 'center',
				fontSize: 16,
				borderRadius: 4
			},
			withCredentials: true,
			lang: 'zh_CN',
		});
		button.onTap((res) => {
			// console.log(res);
			if (res.userInfo) {
				button.hide();
				this._weGameConfig.userInfo = res.userInfo;
			}
			successCallback(res);
		});
		return button;
	}

	static createFeedbackButton() {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		if (!wx.createFeedbackButton) {
			return;
		}
		let vis = cc.view.getVisibleSize();
		let fra = cc.view.getFrameSize();
		let scaleX = fra.width / vis.width;
		let scaleY = fra.height / vis.height;
		let width = 102 * scaleX;
		let height = 106 * scaleY;
		let top = (fra.height / 2 - (-430) * scaleY) - height / 2;
		let left = (fra.width / 2 + 325 * scaleX) - width / 2;
		let button = wx.createFeedbackButton({
			type: 'image',
			text: '开始游戏',
			image: 'https://game.51dataedu.com/feedback/feed_fish/btn_feedback.png',
			style: {
				left: left,
				top: top,
				width: width,
				height: height,
				lineHeight: 40,
				backgroundColor: '#ff0000',
				color: '#ffffff',
				textAlign: 'center',
				fontSize: 16,
				borderRadius: 4
			}
		});
		return button;
	}

	/**
	 * 获取用户信息
	 * @param withCredentials boolean
	 * @param lang string 语言
	 * */
	static getUserInfo(withCredentials = true, lang = 'zh_CN') {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return new Promise(((resolve, reject) => {
				reject('is not wechat game');
			}));
		}
		return new Promise((resolve, reject) => {
			let obj = {
				withCredentials: withCredentials,
				lang: lang,
				success: (res) => {
					resolve(res);
				},
				fail: (res) => {
					reject(res);
				}
			};
			wx.getUserInfo(obj)
		});
	}

	/**
	 * 主动拉起转发，进入选择通讯录界面。
	 * @param title string 转发标题，不传则默认使用当前小游戏的昵称。
	 * @param imageUrl string 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4
	 * @param query string 查询字符串，从这条转发消息进入后，可通过 wx.getLaunchInfoSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式。
	 * */
	static shareAppMessage(moduleId, typeId, title = '', imageUrl = '', query = '') {
		clearTimeout(DataMgr.instance.shareTimeId);
		if (!title) {
			let share = DataMgr.instance.serverConfig.share_info;
			let result = makeRandomInt(share.length, 0);
			typeId = share[result].id;
			title = share[result].title;
			title = title.replace('#nickname#', DataMgr.instance.userInfo.nickname);
			imageUrl = share[result].url;
		}
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return new Promise((resolve, reject) => {
				HttpMgr.instance.reqRecordReport(moduleId, typeId);
				resolve();
			});
		}
		if (!query) {
			query = "inviterOpenId=" + DataMgr.instance.openId + "&shareId=" + typeId;
			// query = `shareId = ${typeId}`
			//`roomId=${roomId}`
			// query = `inviterUserId=${ServerManager.instance.getUserInfo().userId}`;
		}
		else {
			// query += `&inviterUserId=${ServerManager.instance.getUserInfo().userId}`;
		}
		return new Promise(((resolve, reject) => {
			let data = {
				title: title,
				imageUrl: imageUrl,
				query: query,
				/*success: (res) => {
						console.log('share sucess', res);
						HttpMgr.instance.reqRecordReport(moduleId, typeId);
						resolve(res);
				},
				fail: (res) => {
						console.log('share fail', res);
						reject(res);
				}*/
			};
			wx.shareAppMessage(data);
			DataMgr.instance.shareTimeId = setTimeout(() => {
				console.log('share success');
				resolve();
			}, 1000);
		}))

	}

	/**
	 * 显示分享按钮
	 * */
	static showShareMenu() {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		wx.showShareMenu({
			withShareTicket: true,
			success: (res) => {
				console.log('开启分享：' + JSON.stringify(res));
			},
			fail: (res) => {
				console.log('分享失败：' + JSON.stringify(res));
			}
		});
	}

	/**
	 * 隐藏分享按钮
	 * */
	static hideShareMenu() {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		wx.hideShareMenu();
	}

	/**
	 * 监听转发按钮
	 * @param title string 转发标题，不传则默认使用当前小游戏的昵称。
	 * @param imageUrl string 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4
	 * @param query string 查询字符串，从这条转发消息进入后，可通过 wx.getLaunchInfoSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式。
	 * */
	static onShareAppMessage(title, imageUrl, query) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		let share = DataMgr.instance.serverConfig.share_info;
		wx.onShareAppMessage(() => {
			// 用户点击了“转发”按钮
			let result = makeRandomInt(share.length, 0);
			HttpMgr.instance.reqRecordReport(SHARE_MODULE.SYSTEM, share[result].id);
			share[result].title = share[result].title.replace('#nickname#', DataMgr.instance.userInfo.nickname);
			let query = "inviterOpenId=" + DataMgr.instance.openId + "&shareId=" + share[result].id;
			return {
				title: share[result].title,
				imageUrl: share[result].url,
				query: query,
			}
		});
	}

	/**
	 *返回小程序启动参数
	 *scene  number  场景值
	 *query  Object  启动参数
	 *isSticky  boolean  当前小游戏是否被显示在聊天顶部
	 *shareTicket  string  shareTicket
	 *referrerInfo  object  当场景为由从另一个小程序或公众号或App打开时，返回此字段
	 * */
	static getLaunchOptionsSync() {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		return wx.getLaunchOptionsSync()
	}

	/**
	 * 开放数据域 shareCanvas
	 * */
	static getOpenDataContext() {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		return wx.getOpenDataContext();
	}

	/**
	 * 发送数据
	 * */
	static postMessage(data) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		wx.postMessage(data);
	}

	/**
	 * 游戏圈
	 * */
	static gameClubButton() {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		GameClubButton.show()
	}

	/**
	 * 截图
	 * */
	static saveImage(x, y, cw, ch, pw, ph) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return new Promise((resolve) => {
				resolve()
			});
		}
		return new Promise((resolve, reject) => {
			canvas.toTempFilePath({
					x: x,
					y: y,
					width: cw,
					height: ch,
					destWidth: pw,
					destHeight: ph,
					fileType: 'jpg',
					success: (res) => {
						wx.saveImageToPhotosAlbum(
							{
								filePath: res.tempFilePath,
								success: function (res) {
									resolve();
									console.log("succes", res);

								},
								fail: function (res) {
									reject(res);
									console.log("fail", res);
								},
								complete: function (res) {
									console.log("complete", res);
								}
							}
						)
					},
					fail: (res) => {
						reject(res);
					}
				}
			);
		});

	}

	/**
	 * 监听小游戏回到前台的事件
	 * scene  string  场景值
	 *query  Object  查询参数
	 *shareTicket  string  shareTicket
	 *referrerInfo  object  当场景为由从另一个小程序或公众号或App打开时，返回此字段
	 *    appId  string  来源小程序或公众号或App的 appId
	 *    extraData  object  来源小程序传过来的数据，scene=1037或1038时支持
	 * */
	static onShow(callback) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		wx.onShow(callback);

	}

	/**
	 * 监听小游戏隐藏到后台事件。锁屏、按 HOME 键退到桌面、显示在聊天顶部等操作会触发此事件。
	 * */
	static onHide(callback) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return
		}
		wx.onHide(callback)

	}

	/**
	 * 创建 banner 广告
	 * */
	static createBannerAd(adUnitId) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		// if(wx.getSystemInfoSync().SDKVersion >= 2.0.4)
		let obj = {
			adUnitId: adUnitId,
			style: {left: 0, top: 0, width: 750, height: 100}
		}
		wx.createBannerAd(obj);
	}

	/**
	 * 创建视频广告
	 * */
	static createRewardedVideoAd(adUnitId) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		return wx.createRewardedVideoAd({adUnitId});
	}

	// 跳转小程序
	static navigateToMiniProgram(appId, path, extraData) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return new Promise(((resolve, reject) => {
				reject();
			}));
		}
		return new Promise(((resolve, reject) => {
			let obj = {
				appId: appId,
				path: path || "",
				extraData: extraData || '',
				envVersion: "release", // develop（开发版），trial（体验版），release（正式版）
				success: () => {
					console.log('go success');
					resolve();
				},
				fail: (res) => {
					console.log('fail', res);
					reject();
				},
			}
			wx.navigateToMiniProgram(obj);
		}));

	}

	static getShareInfo(shareTicket, successCallback, failCallback) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		console.log('get shareInfo:', shareTicket);
		wx.getShareInfo({
			shareTicket: shareTicket,
			success: successCallback,
			fail: failCallback,
		})
	}

	//分享群判断  result = 0-成功 1-失败 2-已经分享
	static isShareGroup(res) {
		return new Promise(((resolve, reject) => {
			if (cc.sys.platform != cc.sys.WECHAT_GAME) {
				resolve(0);
			}
			resolve(0);
			return;
			let shareAll = DataMgr.instance.serverConfig.backStage_toggle.shareAll;
			if (shareAll.shareType == 0) {
				resolve(0);
				return;
			}
			// let result = false;
			let result = 1;
			if (!res.shareTickets) {
				console.log('fail');
				resolve(result);
				return;
			}
			console.log(res.shareTickets);
			// return true;
			res.shareTickets.forEach(shareTicket => {
				WxSdk.getShareInfo(shareTicket, res => {
					console.log("shareTicket group = ", res);
					if (res) {
						let data = {
							encryptedData: res.encryptedData,
							iv: res.iv,
						}
						HttpMgr.instance.reqShareGroupInfo(data).then((data) => {
							let groupID = data.openGId;
							console.log("onShareGroupInfo group succful = ", groupID);
							let groupCount = data.count;
							let maxCount = shareAll.limitGroup;
							if (maxCount <= 0) {
								resolve(0);
								return;
							}
							// console.log("onShareGroupInfo group groupID_count = ", groupID_count, "/MaxCount = ", maxCount);
							if (groupCount < maxCount) {
								groupCount += 1;
								DataMgr.instance.setShareGroupRecord(groupID, groupCount);
								result = 0;
							} else {
								result = 2;
							}
							resolve(result);
						}, (err) => {
							console.error("onShareGroupInfo group error = ", err.message);
							resolve(result);
						});
					} else {
						resolve(result);
					}

				}, (res) => {
					console.log('get share info fail', res)
					resolve(1);
				})
			});
		}));

	}

	//版本跟新检查
	static getUpdateManager(resultCallback, failCallback) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			resultCallback();
			return;
		}
		let updateManager = wx.getUpdateManager();
		updateManager.onCheckForUpdate((res) => {
			// 请求完新版本信息的回调
			console.log('onCheckForUpdate', res);
			if (!res.hasUpdate) {
				resultCallback();
			}
		});
		updateManager.onUpdateReady(() => {
			wx.showModal({
				title: '更新提示',
				content: '检测到新版本，是否重启应用？',
				success: function (res) {
					if (res.confirm) {
						// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
						updateManager.applyUpdate()
					}
					else if (res.cancel) {
						resultCallback();
					}
				}
			})
		});
		updateManager.onUpdateFailed(() => {
			console.log('新的版本下载失败');
			failCallback();
		});
	}

	/**
	 * 设置常亮
	 * */
	static setKeepScreenOn() {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		wx.setKeepScreenOn({keepScreenOn: true});
	}


}






