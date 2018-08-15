const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelEnd extends cc.Component {

    onLoad() {

    }

    start() {
        this.initEnd();
    }

    initEnd() {
        //this.node.getChildByName("best").getChildByName("best_Label").getComponent(cc.Label).string = cc.dataMgr.getBestScore_i(cc.dataMgr.userData.countJump);

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
            if (btnN == "anniu_weixin") {
                this.shareFriend();
            }
        }
    }

}