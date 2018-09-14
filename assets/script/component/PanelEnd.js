const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelEnd extends cc.Component {

    onLoad() {}

    start() {
        this.initEnd();
        cc.audioMgr.playBg(false);
    }

    initEnd() {
        //切换场景的背景图片
        cc.dataMgr.userData.mainBgIdx++;
        if (cc.dataMgr.userData.mainBgIdx >= cc.dataMgr.gameBgName.length)
            cc.dataMgr.userData.mainBgIdx = 0;
        cc.sys.localStorage.setItem("mainBgIdx", cc.dataMgr.userData.mainBgIdx);

        //this.node.getChildByName("best").getChildByName("best_Label").getComponent(cc.Label).string = cc.dataMgr.getBestScore_i(cc.dataMgr.userData.countJump);

        //背景颜色
        let bgName = cc.dataMgr.gameBgName[cc.dataMgr.userData.mainBgIdx];
        let frame = cc.dataMgr.getBgFrame_sf(bgName);
        if (frame) {
            let spr_bg = this.node.getChildByName("game_bg");
            spr_bg.getComponent(cc.Sprite).spriteFrame = frame;
        }
        //进入结束界面保存一下数据
        cc.dataMgr.saveData();
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