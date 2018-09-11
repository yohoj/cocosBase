/**
 * Created by yh on 2018/8/15.
 * 贝塞尔曲线
 * let action = new FishBezierBy(speed, startPosition, endPosition, controlPoint1, controlPoint2);
 */
let BezierImpl = function (p0, p1, p2) {
	let ax = p0.x - 2 * p1.x + p2.x;
	let ay = p0.y - 2 * p1.y + p2.y;
	let bx = 2 * (p1.x - p0.x);
	let by = 2 * (p1.y - p0.y);
	let A = 4 * (ax * ax + ay * ay);
	let B = 4 * (ax * bx + ay * by);
	let C = bx * bx + by * by;

	let t0 = Math.sqrt(C);
	let t1 = 8 * Math.pow(A, 1.5);

	let m0 = (B * B - 4 * A * C) / t1;
	let m1 = 2 * Math.sqrt(A);
	let m2 = m1 / t1;
	let ttt = (B + m1 * t0);
	let m3 = m0 * Math.log(ttt <= 0 ? 0.0000001 : ttt) - B * m2 * t0;

	let f0 = A + B;
	let f1 = A + f0;
	let temp1 = C + f0;
	let f2 = Math.sqrt(temp1 < 0 ? 0 : temp1);
	temp1 = f1 + m1 * f2;
	let f3 = Math.log(temp1 <= 0 ? 0.0000001 : temp1);

	this.mLength = m3 - m0 * f3 + m2 * f1 * f2;
	this.A = A;
	this.B = B;
	this.C = C;
	this.m0 = m0;
	this.m1 = m1;
	this.m2 = m2;
	this.m3 = m3;
	this.p0 = p0;
	this.p1 = p1;
	this.p2 = p2;
}
BezierImpl.prototype.getLength = function () {
	return this.mLength;
};
BezierImpl.prototype.getPoint = function (t) {
	let ll = this.m3 - t * this.mLength;
	for (let i = 0; i < 7; ++i) {

		let f0 = this.A * t;
		let f1 = this.B + f0;
		let f2 = f1 + f0;
		let temp1 = this.C + t * f1;
		let f3 = Math.sqrt(temp1 < 0 ? 0 : temp1);
		temp1 = f2 + this.m1 * f3;
		let f4 = Math.log(temp1 <= 0 ? 0.0000001 : temp1);
		let f = (ll - this.m0 * f4) / f3 + this.m2 * f2;
		t -= f;
		if (Math.abs(f) < 0.01) {
			break;
		}
	}

	let c = t * t;
	let b = t + t;
	let a = 1 - b + c;
	b -= c + c;


	return {x: (a * this.p0.x + b * this.p1.x + c * this.p2.x), y: (a * this.p0.y + b * this.p1.y + c * this.p2.y)};
}
let Bezier = function (pointCount, pArray) {
	if (pointCount < 3) {
		throw 1;
	}

	let mIndex = 0;
	let p0 = pArray[mIndex++];

	let mLength = 0;

	let mMap = [];

	for (let i = 3; i < pointCount; ++i) {

		let p1 = {x: (pArray[mIndex].x + pArray[mIndex + 1].x) / 2, y: (pArray[mIndex].y + pArray[mIndex + 1].y) / 2};

		let bezierImpl = new BezierImpl(p0, pArray[mIndex], p1);

		mMap.push({first: mLength, second: bezierImpl});
		mLength += bezierImpl.getLength();

		p0 = p1;
		mIndex++;
	}

	let bezierImpl = new BezierImpl(p0, pArray[mIndex], pArray[mIndex + 1]);
	mMap.push({first: mLength, second: bezierImpl});
	mLength += bezierImpl.getLength();
	mMap.sort(this.sortCmd);
	this.mMap = mMap;
	this.mLength = mLength;
}
Bezier.prototype.sortCmd = function (a, b) {

	return a.first - b.first;
};
Bezier.prototype.getLength = function () {

	return this.mLength;
};

Bezier.prototype.getPoint = function (t) {

	t *= this.mLength;

	let it = this.mMap[Math.max(0, this.upperBound(t) - 1)];

	t = (t - it.first) / it.second.getLength();
	return it.second.getPoint(t);
};

Bezier.prototype.upperBound = function (findKey) {

	let index;
	for (index = 0; index < this.mMap.length; ++index) {
		if (this.mMap[index].first > findKey) {
			break;
		}
	}
	return index;
};

export let FishBezierBy = cc.DelayTime.extend({

	_startPosition: null,
	_endPosition: null,
	_controlPoint1: null,
	_controlPoint2: null,
	_bezier: null,

	ctor: function (speed, startPosition, endPosition, controlPoint1, controlPoint2) {

		this._startPosition = startPosition;
		this._endPosition = endPosition;
		this._controlPoint1 = controlPoint1;
		this._controlPoint2 = controlPoint2;

		this._bezier = new Bezier(4, [startPosition, controlPoint1, controlPoint2, endPosition]);


		this._super(this.getLength() / speed);
	},


	getLength: function () {
		return this._bezier.getLength();
	},

	update: function (dt) {

		if (this.getTarget()) {


			this.getTarget().setPosition(this._bezier.getPoint(dt));
		}

	}
});

