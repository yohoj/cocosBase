/**
 * Created by yh on 2018/8/29.
 */

const {ccclass, property} = cc._decorator;
const Type = cc.Enum({
	/**
	 * !#en Horizontal Layout
	 * !#zh 水平布局
	 * @property {Number} HORIZONTAL
	 */
	HORIZONTAL: 0,

	/**
	 * !#en Vertical Layout
	 * !#zh 垂直布局
	 * @property {Number} VERTICAL
	 */
	VERTICAL: 1,
	/**
	 * !#en Grid Layout
	 * !#zh 网格布局
	 * @property {Number} GRID
	 */
	GRID: 2,
});

@ccclass
export default class ListView extends cc.Component {
	/**
	 * !#en The layout type.
	 * !#zh 布局类型
	 * @property {Layout.Type} type
	 * @default Layout.Type.NONE
	 */
	@property({type:Type})
	type = Type.HORIZONTAL;

	/**
	 * !#en The left padding of layout, it only effect the layout in one direction.
	 * !#zh 容器内左边距，只会在一个布局方向上生效。
	 * @property {Number} paddingLeft
	 */
	@property({type:cc.Integer,visible(){
		return this.type == Type.HORIZONTAL || this.type == Type.GRID;
	}})
	paddingLeft = 0;


	/**
	 * !#en The right padding of layout, it only effect the layout in one direction.
	 * !#zh 容器内右边距，只会在一个布局方向上生效。
	 * @property {Number} paddingRight
	 */
	@property({type:cc.Integer,visible(){
			return this.type == Type.HORIZONTAL || this.type == Type.GRID;
		}})
	paddingRight = 0;
	/**
	 * !#en The top padding of layout, it only effect the layout in one direction.
	 * !#zh 容器内上边距，只会在一个布局方向上生效。
	 * @property {Number} paddingTop
	 */
	@property({type:cc.Integer,visible(){
			return this.type == Type.VERTICAL || this.type == Type.GRID;
		}})
	paddingTop = 0;
	/**
	 * !#en The bottom padding of layout, it only effect the layout in one direction.
	 * !#zh 容器内下边距，只会在一个布局方向上生效。
	 * @property {Number} paddingBottom
	 */
	@property({type:cc.Integer,visible(){
			return this.type == Type.VERTICAL || this.type == Type.GRID;
		}})
	paddingBottom = 0;
	/**
	 * !#en The distance in x-axis between each element in layout.
	 * !#zh 子节点之间的水平间距。
	 * @property {Number} spacingX
	 */
	@property({type:cc.Integer,visible(){
			return this.type == Type.HORIZONTAL || this.type == Type.GRID;
		}})
	spacingX = 0;

	/**
	 * !#en The distance in y-axis between each element in layout.
	 * !#zh 子节点之间的垂直间距。
	 * @property {Number} spacingY
	 */
	@property({type:cc.Integer,visible(){
			return this.type == Type.VERTICAL || this.type == Type.GRID;
		}})
	spacingY = 0;
	/**
	 * 脚本名称
	 * */
	@property(String)
	scriptName = '';
	/**
	 *子控件预制体
	* */
	@property(cc.Prefab)
	prefab = null;
	/**
	 * 对象池
	 * */
	_pool = null;
	/**
	 * 内容节点
	 * */
	content = null;
	/**
	 * 列表
	 * */
	_list = [];
	/**
	* 上次滚动点
	* */
	_lastPosition = {x:0,y:0};
	/**
	 * gird 模式下一行的个数
	 * */
	_horizonCount = 1;



	onLoad() {
		this.content = this.node.children[0].children[0];
		this.createPrefabPool();
	}

	onDisable(){
		this.clear();
	}

	init(dataArr){
		this._list = dataArr;
		this.addToContent();
	}

	createPrefabPool() {
		this._pool = new cc.NodePool();
		let prefab = cc.instantiate(this.prefab);
		let count = 0;
		switch (this.type) {
			case Type.HORIZONTAL:
				count = Math.floor((this.node.width-this.paddingLeft-this.paddingRight)/(prefab.width + this.spacingX)) + 5;
				break;
			case Type.VERTICAL:
				count = Math.floor((this.node.height-this.paddingTop-this.paddingBottom)/(prefab.height + this.spacingY)) + 5;
				break;
			case Type.GRID:
				let horizonTalCount =  Math.floor((this.node.width-this.paddingLeft-this.paddingRight)/(prefab.width + this.spacingX));
				let verticalCount = Math.floor((this.node.height-this.paddingTop-this.paddingBottom)/(prefab.height + this.spacingY));
				count = (horizonTalCount) * (verticalCount+3);
				break;
		}
		// let count = Math.floor(this.node.height / prefab.height) + 5;
		for (let i = 0; i < count; ++i) {
			this._pool.put(cc.instantiate(this.prefab));
		}
	}

	addToContent() {
		let prefab = this._pool.get();
		if(!prefab){
			prefab = cc.instantiate(this.prefab);
		}
		let count = 0;
		this._horizonCount = 1;
		switch (this.type) {
			case Type.HORIZONTAL:
				if ((this.node.width-this.paddingLeft-this.paddingRight)%(prefab.width + this.spacingX) == 0) {
					count =Math.floor((this.node.width-this.paddingLeft-this.paddingRight)/(prefab.width + this.spacingX)) + 2;
				}
				else {
					count = Math.floor((this.node.width-this.paddingLeft-this.paddingRight)/(prefab.width + this.spacingX)) +3;
				}
				this.content.width = this._list.length * (prefab.width + this.spacingX) + this.paddingLeft + this.paddingRight;
				break;
			case Type.VERTICAL:
				if (this.node.height % prefab.height == 0) {
					count = Math.floor(this.node.height / prefab.height) + 2;
				}
				else {
					count = Math.floor(this.node.height / prefab.height) + 3;
				}
				this.content.height = this._list.length * (prefab.height + this.spacingY) + this.paddingTop + this.paddingBottom;
				break;
			case Type.GRID:
				this._horizonCount =  Math.floor((this.node.width-this.paddingLeft-this.paddingRight)/(prefab.width + this.spacingX));
				let verticalCount = 0
				if((this.node.height-this.paddingTop-this.paddingBottom)%(prefab.height + this.spacingY) == 0){
					verticalCount = Math.floor((this.node.height-this.paddingTop-this.paddingBottom)/(prefab.height + this.spacingY)) + 2;
				}
				else{
					verticalCount = Math.floor((this.node.height-this.paddingTop-this.paddingBottom)/(prefab.height + this.spacingY))+3;
				}
				count = (this._horizonCount) * verticalCount;
				if(this._list.length % this._horizonCount == 0){
					this.content.height = this._list.length / this._horizonCount * (prefab.height + this.spacingY) + this.paddingBottom + this.paddingTop;
				}
				else{
					this.content.height = (Math.floor(this._list.length / this._horizonCount) + 1) * (prefab.height + this.spacingY) + this.paddingBottom + this.paddingTop;
				}
				break;
		}
		count = Math.min(count, this._list.length);
		this._pool.put(prefab);
		for (let i = 0; i < count; ++i) {
			let prefab = this._pool.get();
			prefab.position = this.getPrefabPosition(prefab,i);
			prefab.setTag(i);
			prefab.active = true;
			let obj = prefab.getComponent(this.scriptName);
			if(!obj){
				console.log("没有该脚本");
				break;
			}
			obj.init(this._list[i]);
			this.content.addChild(prefab,i);
		}
		this.scheduleOnce(()=>{
			this.content.y = 0;
		},0.04);
	}

	getPrefabPosition(prefab,index){
		let position = {x:0,y:0};
		switch (this.type) {
			case Type.HORIZONTAL:
				position.x = this.paddingLeft + index * (prefab.width + this.spacingX);
				position.y = 0;
				break;
			case Type.VERTICAL:
				position.y = -this.paddingTop - index * (prefab.height + this.spacingY);
				position.x = 0;
				break;
			case Type.GRID:
				position.x = this.paddingLeft + index%this._horizonCount * (prefab.width + this.spacingX)
				position.y = -this.paddingTop - Math.floor(index/this._horizonCount) * (prefab.height + this.spacingY);
				break;
		}
		return position;
	}

	clear() {
		let len = this.content.children.length;
		for (let i = 0; i < len; ++i) {
			let prefab = this.content.children[i];
			if (prefab) {
				this._pool.put(prefab);
				i--;
			}

		}
		this.content.height = 0;
		this.content.y = 0;
	}

	onScrollView(scrollview, eventType, customEventData) {
		switch (eventType) {
			case cc.ScrollView.EventType.SCROLLING:
				if(this.content.y >= this.content.height - this.content.parent.height && this.content.height > this.content.parent.height){
					this.content.y = this.content.height - this.content.parent.height;
					return;
				}
				let child = this.content.children[0];
				if(!child){
					return;

				}
				if(this.node.getComponent(cc.ScrollView).vertical){
					if (this._lastPosition.y  < this.content.y) {
						this.onToBottom();
						this._lastPosition = this.content.getPosition();
					}
					else if(this._lastPosition.y > this.content.y){
						this.onToTop();
						this._lastPosition = this.content.getPosition();
					}
				}
				else if(this.node.getComponent(cc.ScrollView).horizontal){
					if (this._lastPosition.x < this.content.x) {
						this.onToRight();
						this._lastPosition = this.content.getPosition();
					}
					else if(this._lastPosition.x > this.content.x){
						this.onToLeft();
						this._lastPosition = this.content.getPosition();
					}
				}
				break;
			case cc.ScrollView.EventType.SCROLL_ENDED:
				this._lastPosition = this.content.getPosition();
				break;
			case cc.ScrollView.EventType.SCROLL_TO_BOTTOM:
				this._lastPosition = this.content.getPosition();
				break;
			case cc.ScrollView.EventType.SCROLL_TO_TOP:
				this._lastPosition = this.content.getPosition();
				break;
		}
	}

	onToTop() {
		let flag = false;
		let deleteCount = 0;
		for (let i = this.content.children.length - 1; i >= 0; i--) {
			let prefab = this.content.children[i];
			if (Math.abs(prefab.y) >= this.content.y + this.node.height + prefab.height ) {
				this._pool.put(prefab);
				deleteCount++;
				// i++;
				if(deleteCount >= this._horizonCount){
					flag = true;
					break;
				}
			}
		}
		if (flag) {
			for(let i=0; i<this._horizonCount; ++i){
				let target = this.getMaxChild();
				// let child = this.content.children[0];
				let tag = target ? target.getTag() - 1 : 0;
				let prefab = this._pool.get();
				if (tag < 0) {
					target = this.getMinChild();
					tag = target ? target.getTag() + 1 : 0;
					if (tag > this._list.length - 1 || !target) {
						this._pool.put(prefab);
						return;
					}
					prefab.position = this.getPrefabPosition(prefab,tag);
					prefab.active = true;
				}
				else {
					prefab.position = this.getPrefabPosition(prefab,tag);
					prefab.active = tag >= 0;
				}
				prefab.setTag(tag);
				tag = tag < 0 ? 0 : tag;
				prefab.getComponent(this.scriptName).init(this._list[tag]);
				this.content.addChild(prefab,tag);
			}
		}
	}

	onToBottom() {
		let flag = false;
		let deleteCount = 0;
		for (let i = 0; i < this.content.children.length; i++) {
			let prefab = this.content.children[i];
			if (Math.abs(prefab.y - prefab.height) + prefab.height  <= this.content.y) {
				this._pool.put(prefab);
				deleteCount++;
				i--;
				if(deleteCount >= this._horizonCount){
					flag = true;
					break;
				}
			}
		}
		if (flag) {
			// let child = this.content.children[this.content.children.length-1];
			let bBack = false;
			for(let i=0; i<this._horizonCount; ++i){
				let target = this.getMinChild();
				let tag = target ? target.getTag() + 1 : 0;
				let prefab = this._pool.get();
				if (tag-i > this._list.length - 1 || bBack) {
					target = this.getMaxChild();
					tag = target ? target.getTag() - 1 : 0;
					if (tag < 0 || !target) {
						this._pool.put(prefab);
						return;
					}
					bBack = true;
					prefab.position = this.getPrefabPosition(prefab,tag);
					prefab.active = true;
				}
				else {
					prefab.position = this.getPrefabPosition(prefab,tag);
					prefab.active = tag <= this._list.length-1;
				}
				prefab.setTag(tag);
				tag = tag > this._list.length-1 ? this._list.length-1 : tag;
				prefab.getComponent(this.scriptName).init(this._list[tag]);
				this.content.addChild(prefab,tag);
			}

		}
	}

	onToRight(){

	}

	onToLeft(){

	}

	getMaxChild() {
		let target = null;
		this.content.children.forEach(child => {
			if (!target) {
				target = child;
			}
			else if (child.getTag() < target.getTag()) {
				target = child;
			}
		});
		return target;
	}

	getMinChild() {
		let target = null;
		this.content.children.forEach(child => {
			if (!target) {
				target = child;
			}
			else if (child.getTag() > target.getTag()) {
				target = child;
			}
		});
		return target;
	}
}
 
 