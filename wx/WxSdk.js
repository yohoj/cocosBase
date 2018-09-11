/**
 * Created by yh on 2018/7/26.
 */
// import ServerManager from "../net/ServerManager";
import {makeRandomInt} from "../utils/Utils";

export default class WxSdk {

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
					console.log('checkSession success',res);
					resolve();
				},
				fail: (res) => {
					console.log('checkSession fail',res);
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
			// text: '开始游戏',
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
			}
		});
		button.onTap((res) => {
			// console.log(res);
			if (res.userInfo) {
				button.hide();
			}
			successCallback(res);
		});
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
	static shareAppMessage(title = '', imageUrl = '', query = '') {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return new Promise((resolve, reject) => {
				reject();
			});
		}
		if (!title) {
			/*let share = ServerManager.instance.getServerConfig().share;
			title = share.titles[makeRandomInt(share.titles.length, 0)];
			imageUrl = share.images[makeRandomInt(share.images.length, 0)];*/
		}
		if (!query) {
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
				success: (res) => {
					console.log('share sucess', res);
					resolve(res);
				},
				fail: (res) => {
					console.log('share fail', res);
					reject(res);
				}
			};
			wx.shareAppMessage(data);
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
			withShareTicket: false,
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
		let share = ServerManager.instance.getServerConfig().share;
		wx.onShareAppMessage(() => {
			// 用户点击了“转发”按钮
			return {
				title: share.titles[makeRandomInt(share.titles.length, 0)],
				imageUrl: share.images[makeRandomInt(share.images.length, 0)],
				query: ServerManager.instance.getUserInfo().userId,
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
				resolve();
			}));
		}
		return new Promise(((resolve, reject) => {
			let obj = {
				appId: appId,
				path: path || "",
				extraData: extraData,
				envVersion: "release", // develop（开发版），trial（体验版），release（正式版）
				success: () => {
					resolve();
				},
				fail: () => {
					reject();
				},
			}
			wx.navigateToMiniProgram(obj);
		}));

	}

	static getShareInfo(shareTicket, successCallback) {
		if (cc.sys.platform != cc.sys.WECHAT_GAME) {
			return;
		}
		wx.getShareInfo({
			shareTicket: shareTicket,
			success: successCallback,
		})
	}

	//分享群判断
	static isShareGroup(res) {
		console.log('share:', res);
		let result = false;
		if (!res.shareTickets) {
			console.log('fail');
			return result;
		}
		console.log('sucess');
		return true;
		res.shareTickets.forEach(shareTicket => {
			WxSdk.getShareInfo(shareTicket, res => {
				let data = {
					encrypted_data: res.encryptedData,
					iv: res.iv
				}
				console.log(data);
			})
		});
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


}






