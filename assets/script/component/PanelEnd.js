import DataMgr from 'DataMgr';
import AudioMgr from 'AudioMgr';
const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelEnd extends cc.Component {

    onLoad() {
        cc.aduioMgr.init();

        this.showEnd();
    }

    start() {
        let self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                cc.director.loadScene("game");
                return true;
            },
            onTouchMoved: function (touch, event) {},
            onTouchEnded: function (touch, event) {}
        }, self.node);
    }

    showEnd() {

    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "") {}
        }
    }
}