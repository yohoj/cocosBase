/**
 * Created by user on 2018/10/26.
 */
import PanelBase from "./PanelBase";

const {ccclass, property} = cc._decorator;
@ccclass
export default class PanelTest extends PanelBase {
	show(){
		super.show();
	}

	onBtnCloseTap(){
		this.close();
	}

}
 
 