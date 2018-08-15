import DataMgr from 'DataMgr';
import AudioMgr from 'AudioMgr';
const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class Start extends cc.Component {
    /*
        重要提示 数据在start onLoad 中初始化,启动游戏一定要打这开始启动
    */

    onLoad() {
        console.log("--- onLoad Start ---");
        if (!cc.dataMgr) {
            //let DataMgr = require("DataMgr");
            cc.dataMgr = new DataMgr();
            cc.dataMgr.initData();
        }
        if (!cc.audioMgr) {
            //let AudioMgr = require("AudioMgr");
            cc.audioMgr = new AudioMgr();
            cc.audioMgr.init();
        }
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

        this.initStart();
    }

    initStart() {
        //钻石数量
        let lab_green = this.node.getChildByName("prop").getChildByName("prop_Label");
        lab_green.getComponent(cc.Label).string = cc.dataMgr.userData.propGreenNum;

        //点击开始游戏
        let spr_begin = this.node.getChildByName("ziti_kaishiyouxi");
        spr_begin.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.4, 1.2), cc.scaleTo(0.6, 1))));

        //背景颜色
        let frame = cc.dataMgr.getBgFrame_sf(null);
        if (frame) {
            let spr_bg = this.node.getChildByName("game_bg");
            spr_bg.getComponent(cc.Sprite).spriteFrame = frame;
        }
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_paiming") {

            } else if (btnN == "anniu_weixin") {

            } else if (btnN == "anniu_yinyue") {
                cc.director.loadScene("store");
            } else if (btnN == "anniu_shezhi") {

            }
        }
    }
}