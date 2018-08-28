const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelInvite extends cc.Component {

    @property(cc.Node)
    node_content = null;

    @property(cc.Node)
    lab_addNum = null;
    @property(cc.Node)
    lab_inviteNum = null;

    onLoad() {
        console.log("--- onLoad PanelInvite ---");
    }

    start() {
        this.initInvite();

        //背景颜色
        let bgName = cc.dataMgr.gameBgName[cc.dataMgr.userData.mainBgIdx];
        let frame = cc.dataMgr.getBgFrame_sf(bgName);
        if (frame) {
            let spr_bg = this.node.getChildByName("game_bg");
            spr_bg.getComponent(cc.Sprite).spriteFrame = frame;
        }
        cc.dataMgr.getShareReward();
    }

    initInvite() {
        for (let i = 0; i < this.node_content.children.length; ++i) {
            let nodeN = this.node_content.children[i];
            //console.log("-- invite --" + nodeN.name);
            if (i < cc.dataMgr.haveProp.countInvite) {
                //这里是可领取 或 已领取的
                let isTake = this.isHaveTake_b(i);
                nodeN.getChildByName("anniu_lingqu").active = !isTake;
                nodeN.getChildByName("anniu_yilingqu").active = isTake;
            } else {
                nodeN.getChildByName("anniu_lingqu").active = false;
                nodeN.getChildByName("anniu_yilingqu").active = false;
            }
        }
        this.lab_addNum.getComponent(cc.Label).string = ("额外生命值" + cc.dataMgr.userData.addHpMax);
        this.lab_inviteNum.getComponent(cc.Label).string = ("已邀请好友" + cc.dataMgr.haveProp.countInvite);
    }

    takeReward(idx) {
        if (idx == 0) {
            cc.dataMgr.haveProp.haveFoot.push(0);
        } else if (idx == 1) {
            cc.dataMgr.haveProp.haveStreak.push(0);
        } else if (idx == 2) {
            cc.dataMgr.haveProp.haveSpeed.push(50);
        } else if (idx == 3) {
            cc.dataMgr.haveProp.haveCut.push(0.7);
        } else if (idx == 4) {
            cc.dataMgr.haveProp.haveFoot.push(1);
        } else if (idx == 5) {
            cc.dataMgr.haveProp.haveSpeed.push(100);
        } else if (idx == 6) {
            cc.dataMgr.haveProp.haveCut.push(0.3);
        } else if (idx == 7) {
            cc.dataMgr.haveProp.haveStreak.push(1);
        } else if (idx == 8) {
            cc.dataMgr.haveProp.isOwnSpeed = true;
        } else if (idx == 9) {
            cc.dataMgr.haveProp.isOwnCut = true;
        }
        else if (idx == 10) {
            cc.dataMgr.haveProp.isOwnStreak = true;
        }
        else if (idx == 11) {
            cc.dataMgr.haveProp.isOwnFoot = true;
        }

        cc.dataMgr.haveProp.inviteTake.push(idx);
        cc.dataMgr.saveData();

        this.initInvite();
    }

    isHaveTake_b(idx) {
        let haveTake = false;
        for (let i = 0; i < cc.dataMgr.haveProp.inviteTake.length; ++i) {
            if (cc.dataMgr.haveProp.inviteTake[i] == idx) {
                haveTake = true;
                //恢复数据 保证永久永久的东西一定能用
                if (i == 8) {
                    cc.dataMgr.haveProp.isOwnSpeed = true;
                    cc.dataMgr.haveProp.isOwnCut = true;
                } else if (i == 9) {
                    cc.dataMgr.haveProp.isOwnFoot = true;
                    cc.dataMgr.haveProp.isOwnStreak = true;
                }
            }
        }
        return haveTake;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_zhuyie") {
                cc.director.loadScene("game");
            } else if (btnN == "anniu_lingqu") {
                if (customeData != null) {
                    this.takeReward(customeData);
                }
            } else if (btnN == "anniu_weixin") {
                if (CC_WECHATGAME) {
                    window.wx.updateShareMenu({
                        withShareTicket: false
                    });
                    window.wx.shareAppMessage({
                        title: "我在这里，等你来。--境之边缘",
                        imageUrl: cc.dataMgr.imageUrl.urlFriend,
                        query: "otherID=" + cc.dataMgr.openid,
                        success: (res) => { }
                    });
                } else {
                    //console.log("-- Not is wechatGame PanelRelive --");
                }
            }
        }
    }
}