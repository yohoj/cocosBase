/**
 * Created by yh on 2018/5/23.
 * http请求
 */
import HttpMgr from "../mgr/HttpMgr";
import DataMgr from "../mgr/DataMgr";
import EventMgr, {EVENT_ID} from "../mgr/EventMgr";
import UIManager from "../mgr/UIManager";

export function callApi(host, uri, params, method = 'GET') {
	let url = `${host}${uri}`;

	params = params || {};

	let options = {
		method,
	};

	let temp = typeof params === 'string' ? params : querystring.stringify(params);
	switch (method.toUpperCase()) {
		case 'GET':
			url += '?' + temp;
			break;
		case 'POST':
			options.body = temp;
			options.headers = {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			};
			break;
	}
	cc.log('fetch uri:',uri);
	return fetch(url, options)
		.then((response) => response.text())
		.then((response) => {

			let data;
			try {
				data = JSON.parse(response);
			} catch (e) {
				return Promise.reject('decode json failed.');
			}
			UIManager.instance.hideLoading();
			if (data.code > 0) {
				cc.error('code:',uri,data.code);
				return Promise.reject(data.code);
			} else {
				cc.log('fetch ==>', uri,data.data);
				return data.data;
			}
		})
		.catch((error) => {
			UIManager.instance.hideLoading();
			throw new Error(error);
		});
}
