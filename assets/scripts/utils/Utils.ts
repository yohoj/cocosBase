/**
 * Created by yh on 2018/7/23.
 */

/**
 * 获取舞台高度
 * */
export function getStageHeight() {
	return cc.view.getVisibleSize().height;
}

/**
 * 获取舞台宽度
 * */
export function getStageWidth() {
	return cc.view.getVisibleSize().width;
}

/**
 * 移动像素单位距离
 * @param horizonDistance verticalDistance
 * return linearVelocity 线性速度速度
 * */
export function getLinearVelocity(verticalDistance, horizonDistance = 0) {
	let linearVelocity = cc.v2();
	let gravity = Math.abs(cc.director.getPhysicsManager().gravity.y);

	let t1 = Math.sqrt(2 * verticalDistance / gravity);
	linearVelocity.y = gravity * t1;
	if (horizonDistance == 0) {
		linearVelocity.x = 0;
	}
	else {
		// let t1 = linearVelocity.y / gravity;
		let h = 50;
		let t2 = Math.sqrt(2 * h / gravity);
		linearVelocity.x = horizonDistance / (t1 + t2);
	}
	return linearVelocity;
}

/**
 * down
 * */
export function getLinearVelocityDown(verticalDistance, horizonDistance) {
	let linearVelocity = cc.v2();
	let gravity = Math.abs(cc.director.getPhysicsManager().gravity.y);
	linearVelocity.y = 0;
	let t = Math.sqrt(2 * verticalDistance / gravity);
	linearVelocity.x = horizonDistance / t;
	return linearVelocity;
}

/**
 * 震屏效果
 * @param node
 * @param duration 震屏时间
 * */
export function shakeEffect(node,duration=0.02,delay,callback) {
	node.runAction(
		cc.repeatForever(
			cc.sequence(
				cc.delayTime(delay),
				cc.moveTo(duration, cc.p(5, 7)),
				cc.moveTo(duration, cc.p(-6, 7)),
				cc.moveTo(duration, cc.p(-13, 3)),
				cc.moveTo(duration, cc.p(3, -6)),
				cc.moveTo(duration, cc.p(-5, 5)),
				cc.moveTo(duration, cc.p(2, -8)),
				cc.moveTo(duration, cc.p(-8, -10)),
				cc.moveTo(duration, cc.p(3, 10)),
				cc.moveTo(duration, cc.p(0, 0)),
				cc.callFunc(()=>{
					callback && callback();
				})
			)
		)
	);

/*	setTimeout(() => {
		node.stopAllActions();
		node.setPosition(0,0);
	}, duration*1000);*/
};


/**
 * 加载图片
 * */
export function createImage(sprite, url) {
	if (cc.sys.platform != cc.sys.WECHAT_GAME) {
		return;
	}
	let image = wx.createImage();
	image.onload = function () {
		let texture = new cc.Texture2D();
		texture.initWithElement(image);
		texture.handleLoadedTexture();
		sprite.spriteFrame = new cc.SpriteFrame(texture);
	};
	image.src = url;
}
/**
 * 数值转换
 * */
export function numToString(value) {
	if(value < 0){
		return '0';
	}
	if(value < 10000){
		return value + '';
	}
	else{
		if(value % 10000 == 0){
			return value/10000 + '万';
		}
		else{
			return (value/10000).toFixed(2) + '万';
		}
	}
}
export function oneToFourString(value) {
	if(value < 1000){
		return value + '';
	}
	else{
		if(value % 1000 == 0){
			return value/1000 + 'k';
		}
		else{
			return (value/1000).toFixed(2) + 'k';
		}
	}
}

/**
 * 保留小数
 * */
export function toFixed(num,count){
	let str = '';
	let aStr = num.toString();
	let aArr = aStr.split('.');
	if(aArr.length > 1) {
		str = aArr[0] + "." + aArr[1].substr(0, count);
	}
	if(str==''){
		str = aStr;
	}
	return str;
}
/**
 * 获取当前节点转换到某节点下的坐标
 * @param {cc.Node} curNode
 * @param {cc.Node} targetNode
 * */
export function getNodePos(curNode, targetNode) {
	let worldPos = curNode.parent.convertToWorldSpace(curNode.position);
	let pos = targetNode.convertToNodeSpace(worldPos);
	return pos;
}

/**
 * 判断时间戳是否在今天
 * */
export function isToday(time) {
	if (new Date(time).toDateString() === new Date().toDateString()) {
		return true;
	}
	return false;
}

/**
 * 格式化时间
 * fmt "yyyy-MM-dd hh:mm:ss"
 * */
export function timeFormat(second) {
	if (second < 60) {
		return '00' + '00:' + stringFormat(second,2);
	}
	else if(second < 60*60){
		return '00:' + stringFormat(Math.floor(second / 60),2) +':' + stringFormat(second % 60,2);
	}
	else{
		return stringFormat(Math.floor(second / 60 / 60),2) + ':' + stringFormat(Math.floor(second%3600/60),2) +':' + stringFormat(second % 3600 % 60,2);
	}
}
export function dateFormat(date,fmt){
	let o = {
		"M+" : date.getMonth()+1,                 //月份
		"d+" : date.getDate(),                    //日
		"h+" : date.getHours(),                   //小时
		"m+" : date.getMinutes(),                 //分
		"s+" : date.getSeconds(),                 //秒
		"q+" : Math.floor((date.getMonth()+3)/3), //季度
		"S"  : date.getMilliseconds()             //毫秒
	};
	if(/(y+)/.test(fmt)) {
		fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
	}
	for(let k in o) {
		if(new RegExp("("+ k +")").test(fmt)){
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
		}
	}
	return fmt;
}



/**
 * */
let zeros = [
	"0",
	"00",
	"000",
	"0000",
	"00000",
	"000000",
	"0000000",
	"00000000",
	"000000000",
	"0000000000"
];
export function stringFormat(value,count) {
	let index = count - value.toString().length - 1;
	if (index < 0) {
		return value.toString();
	}
	return zeros[index] + value;
}

/**
 * scrowview 创建 children
 * */
export function addToContent(content, prefab, dataArr, script) {
	content.children.forEach(child => {
		child.active = false;
	});
	for (let i = 0; i < dataArr.length; ++i) {
		let node = content.children[i];
		if (!node) {
			node = cc.instantiate(prefab);
			content.addChild(node);
		}
		node.active = true;
		node.getComponent(script).init(dataArr[i],i);
	}
}

/**将数字转换为中文数字
 * */
export function changeNumber(number){
	let nums= ['一','二','三','四','五','六','七','八','九','十'];
	return nums[number-1];
}

/**
 * 计算距离
 * @param p1
 * @param p2
 * @returns {number}
 */
export function distancePoint(p1, p2) {
	return this.distance(p1.x, p1.y, p2.x, p2.y);
}

/**
 * 计算距离
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {number}
 */
export function distance(x1, y1, x2, y2) {
	return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

export function centerPoint(p1, p2) {
	return {
		x: Math.min(p1.x, p2.x) + Math.abs(p1.x - p2.x) / 2,
		y: Math.min(p1.y, p2.y) + Math.abs(p1.y - p2.y) / 2,
	}
}

/**
 * 计算两点直线的弧度
 * @param p1
 * @param p2
 * @returns {number}
 */
export function radian(p1, p2) {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * 计算两点直线的角度
 * @param p1
 * @param p2
 * @returns {number}
 */
export function angle(p1, p2) {
	return this.radiusToAngle(this.radian(p1, p2));
}

/**
 * 获取一个随机整数
 * @param max
 * @param min
 * @returns {number}
 */
export function makeRandomInt(max, min = 0) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export function getRandomDirection() {
	let arr = [1,-1];
	return arr[makeRandomInt(2,0)];
}

/**
 * 获取一个随机浮点数
 * @param max
 * @param min
 * @returns {number}
 */
export function makeRandomFloat(max, min = 0) {
	return Math.random() * (max - min) + min;
}

/**
 * 生成一个基于value的range偏移的随机数
 * @param value
 * @param range
 * @returns {number}
 */
export function makeRandomByRange(value, range) {
	return value + (Math.random() * range * 2 - range);
}

/**
 * 生成一个随机整数数组
 * @param len
 * @returns {string}
 */
export function makeRandomIntArr(len, max, min = 0) {
	let target = [];
	for (let i = 0; i < len; i++) {
		target.push(this.makeRandomInt(max));
	}

	return target;
}

/**
 * 生成一个范围数组
 * @param to
 * @param from
 * @param step
 * @returns {Array<number>}
 */
export function makeOrderIntArray(to, from = 0, step = 1) {
	let result = [];
	for (let i = from; i <= to; i += step) {
		result.push(i);
	}

	return result;
}

/**
 * 打乱一个数组
 * @param arr
 * @returns {any}
 */
export function mixArray(arr) {
	for (let i = 0, len = Math.round(arr.length / 2); i < len; i++) {
		let a = this.makeRandomInt(arr.length);
		let b = this.makeRandomInt(arr.length);
		let temp = arr[a];
		arr[a] = arr[b];
		arr[b] = temp;
	}

	return arr;
}

/**
 * 打乱一个二维数组
 * @param arr
 * @returns {}
 */
export function mixArray2(arr) {
	let cH = arr[0].length;
	let cV = arr.length;
	let pos0 = [];
	let pos1 = [];
	for (let i = 0, len = Math.round(cH * cV / 2); i < len; i++) {
		pos0 = [this.makeRandomInt(cH), this.makeRandomInt(cV)];
		pos1 = [this.makeRandomInt(cH), this.makeRandomInt(cV)];
		let temp = arr[pos0[0]][pos0[1]];
		arr[pos0[0]][pos0[1]] = arr[pos1[0]][pos1[1]];
		arr[pos1[0]][pos1[1]] = temp;
	}

	return arr;
}

/**
 * 随机从一个数组中取出一项
 * @param arr
 * @param del
 * @returns {*}
 */
export function getRandomFromArray(arr, del = false) {
	let index = this.makeRandomInt(arr.length);
	let item = arr[index];
	if (del) {
		arr.splice(index, 1);
	}

	return item;
}

/**
 * 根据范围阻隔
 * @param value
 * @param lower
 * @param upper
 * @returns {number}
 */
export function fixRange(value, lower, upper) {
	if (value < lower) {
		value = lower;
	} else if (value > upper) {
		value = upper;
	}

	return value;
}

/**
 * 根据范围补足
 * @param value
 * @param max
 * @param min
 * @returns {number}
 */
export function roundFix(value, max, min = 0) {
	if (value < min) {
		value += max - min;
	} else if (value >= max) {
		value -= max - min;
	}

	return value;
}

/**
 * 弧度转角度
 * @param radius
 * @returns {number}
 */
export function radiusToAngle(radius) {
	return radius * 180 / Math.PI;
}

/**
 * 角度转弧度
 * @param angle
 * @returns {number}
 */
export function angleToRadius(angle) {
	return angle * Math.PI / 180;
}

/**
 * 数组向右旋转
 * @param arr
 * @returns {Array}
 */
export function turnRight(arr) {
	let temp = [];
	for (let t = 0, tl = arr.length; t < tl; t++) {
		temp.push([]);
	}
	for (let i = 0, il = arr.length; i < il; i++) {
		for (let j = 0, jl = arr[i].length; j < jl; j++) {
			temp[i][j] = arr[jl - j - 1][i];
		}
	}
	return temp;
}

/**
 * 数组向左旋转
 * @param arr
 * @returns {Array}
 */
export function turnLeft(arr) {
	let temp = [];
	for (let t = 0, tl = arr.length; t < tl; t++) {
		temp.push([]);
	}
	for (let i = 0, il = arr.length; i < il; i++) {
		for (let j = 0, jl = arr[i].length; j < jl; j++) {
			temp[i][j] = arr[j][jl - i - 1];
		}
	}
	return temp;
}

/**
 * 根据两点计算量化方向,用于手势识别
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 * @returns {number}
 */
export function calDir(x0, y0, x1, y1) {
	if (x0 == x1 && y0 == y1) {
		return -1;
	}

	let r = Math.atan2(y1 - y0, x1 - x0);
	let d;
	if (Math.abs(r) < Math.PI / 4) {
		d = 0;
	} else if (Math.abs(r) > Math.PI / 4 * 3) {
		d = 2;
	} else if (r > 0) {
		d = 1;
	} else {
		d = 3;
	}
	return d;
}

/**
 * 数值正负计算
 * @param num
 * @returns {number}
 */
export function sign(num) {
	return num == 0 ? 0 : (num > 0 ? 1 : -1);
}

/**
 * 把一个正整数分割成若干个整数
 * @param total
 * @param count
 * @returns {Array}
 */
export function split(total, count) {
	let result = [];
	for (let i = 0; i < count; i++) {
		result[i] = 0;
	}
	for (let i = 0; i < total; i++) {
		result[this.makeRandomInt(count)]++;
	}
	return result;
}

export function bezierPoints(points, count) {
	let result = [];
	let t = 0;
	let arr2;

	let perT = 1 / (count - 1);
	for (let i = 0; i < count; i++) {
		let arr = points.concat();
		for (let k = arr.length - 1; k > 0; k--) {
			arr2 = [];
			for (let j = 0, lj = arr.length; j < lj - 1; j++) {
				arr2.push(unit(arr[j], arr[j + 1], t));
			}
			arr = arr2;
		}

		result.push(arr[0]);

		t += perT;
	}

	function unit(a, b, t) {
		return {
			x: (b.x - a.x) * t + a.x,
			y: (b.y - a.y) * t + a.y,
		};
	}

	return result;
}

export function pointInPolygon(points, point) {
	let polySides = points.length, i, j = polySides - 1;
	let oddNodes = false;

	let x = point.x, y = point.y;

	for (i = 0; i < polySides; i++) {
		let ix = points[i].x;
		let iy = points[i].y;
		let jx = points[j].x;
		let jy = points[j].y;
		if ((iy < y && jy >= y
			|| jy < y && iy >= y)
			&& (ix <= x || jx <= x)) {
			if (ix + (y - iy) / (jy - iy) * (jx - ix) < x) {
				oddNodes = !oddNodes;
			}
		}
		j = i;
	}

	return oddNodes;
}

export function intersectToPolygon(points, intersect) {
	let aa = intersect[0];
	let bb = intersect[1];

	let cc, dd;

	let result = false;
	for (let i = 0, li = points.length; i < li; i++) {
		cc = points[i];
		if (i == li - 1) {
			dd = points[0];
		} else {
			dd = points[i + 1];
		}

		if (this.intersectToIntersect(aa, bb, cc, dd)) {
			result = true;
			break;
		}
	}

	return result;
}

export function intersectToIntersect(aa, bb, cc, dd) {
	let delta = determinant(bb.x - aa.x, cc.x - dd.x, bb.y - aa.y, cc.y - dd.y);
	if (delta <= (1e-6) && delta >= -(1e-6)) {
		return false;
	}
	let namenda = determinant(cc.x - aa.x, cc.x - dd.x, cc.y - aa.y, cc.y - dd.y) / delta;
	if (namenda > 1 || namenda < 0) {
		return false;
	}
	let miu = determinant(bb.x - aa.x, cc.x - aa.x, bb.y - aa.y, cc.y - aa.y) / delta;
	if (miu > 1 || miu < 0) {
		return false;
	}
	return true;

	function determinant(v1, v2, v3, v4) {
		return (v1 * v3 - v2 * v4);
	}
}

export function segmentsIntr(a, b, c, d) {
	let area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
	let area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);

	if (area_abc * area_abd >= 0) {
		return false;
	}

	let area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
	let area_cdb = area_cda + area_abc - area_abd;
	if (area_cda * area_cdb >= 0) {
		return false;
	}

	let t = area_cda / (area_abd - area_abc);
	let dx = t * (b.x - a.x),
		dy = t * (b.y - a.y);
	return {x: a.x + dx, y: a.y + dy};
}

export function isNullArray(arr) {
	let result = true;
	arr.some(item => {
		if (item !== undefined && item !== null) {
			result = false;

			return true;
		}
	});

	return result;
}



