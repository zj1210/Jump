import DataMgr from 'DataMgr';
import AudioMgr from 'AudioMgr';
const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelEnd extends cc.Component {

    onLoad() {

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

        this.initEnd();
    }

    initEnd() {
        this.node.getChildByName("now_Label").getComponent(cc.Label).string = cc.dataMgr.userData.countJump;
        this.node.getChildByName("best").getChildByName("best_Label").getComponent(cc.Label).string = cc.dataMgr.getBestScore_i(cc.dataMgr.userData.countJump);
        this.node.getChildByName("prop").getChildByName("prop_Label").getComponent(cc.Label).string = cc.dataMgr.userData.propGreenNum;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_zhuyie") {
                cc.director.loadScene("start");
            }
        }
    }
}