/**
 * Created by yh on 2018/5/23.
 * http请求
 */

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

	return fetch(url, options)
		.then((response) => response.text())
		.then((response) => {
			console.log('fetch ==>', response);

			let data;
			try {
				data = JSON.parse(response);
			} catch (e) {
				return Promise.reject('decode json failed.');
			}

			if (data.code > 0) {
				return Promise.reject(data.code);
			} else {
				return data.data;
			}
		})
		.catch((error) => {
			throw new Error(error);
		});
}
