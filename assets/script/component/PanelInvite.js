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
                let isHaveTake = this.isHaveTake_b(i);
                console.log("--- isCanTake ---" + isHaveTake);
                nodeN.getChildByName("anniu_lingqu").active = !isHaveTake;
                nodeN.getChildByName("anniu_yilingqu").active = isHaveTake;
                if (isHaveTake) {
                    let isUser = this.isUsedProp_b(i);
                    let toggle = nodeN.getChildByName("anniu_yilingqu").getComponent(cc.Toggle);
                    if (toggle) {
                        toggle.isChecked = isUser;
                    }
                }
            } else {
                nodeN.getChildByName("anniu_lingqu").active = false;
                nodeN.getChildByName("anniu_yilingqu").active = false;
            }
        }
        this.lab_addNum.getComponent(cc.Label).string = ("额外生命值" + cc.dataMgr.userData.addHpMax);
        this.lab_inviteNum.getComponent(cc.Label).string = ("已邀请好友" + cc.dataMgr.haveProp.countInvite);
    }

    takeReward(idx, isTake) {
        if (idx == 0) {
            cc.dataMgr.haveProp.isOwnSpeed = isTake;
        }
        else if (idx == 1) {
            cc.dataMgr.userData.addHpMax = 1;
            cc.dataMgr.userData.reliveNum = cc.dataMgr.userData.addHpMax;
        } else if (idx == 2) {
            cc.dataMgr.haveProp.isOwnFoot = isTake;
        }
        else if (idx == 3) {
            cc.dataMgr.haveProp.isOwnStreak = isTake;
        }
        else if (idx == 4) {
            cc.dataMgr.userData.addHpMax = 2;
            cc.dataMgr.userData.reliveNum = cc.dataMgr.userData.addHpMax;
        }
        else if (idx == 5) {
            cc.dataMgr.haveProp.isOwnCut = isTake;
        }

        cc.dataMgr.haveProp.inviteTake.push(idx);
        cc.dataMgr.saveData();

        this.initInvite();
    }

    isHaveTake_b(idx) {
        console.log("-- isHaveTake --" + idx);
        console.log(cc.dataMgr.haveProp.inviteTake);
        let haveTake = false;
        for (let i = 0; i < cc.dataMgr.haveProp.inviteTake.length; ++i) {
            if (cc.dataMgr.haveProp.inviteTake[i] == idx) {
                haveTake = true;
                break;
            }
        }
        return haveTake;
    }

    isUsedProp_b(idx) {
        let isUser = true;
        if (idx == 0) {
            isUser = cc.dataMgr.haveProp.isOwnSpeed;
        }
        else if (idx == 1) {
            cc.dataMgr.userData.addHpMax = 1;
        } else if (idx == 2) {
            isUser = cc.dataMgr.haveProp.isOwnFoot;
        }
        else if (idx == 3) {
            isUser = cc.dataMgr.haveProp.isOwnStreak;
        }
        else if (idx == 4) {
            cc.dataMgr.userData.addHpMax = 2;
        }
        else if (idx == 5) {
            isUser = cc.dataMgr.haveProp.isOwnCut;
        }
        return isUser;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_zhuyie") {
                cc.director.loadScene("game");
            } else if (btnN == "anniu_lingqu") {
                if (customeData != null) {
                    this.takeReward(customeData, true);
                }
            } else if (btnN == "anniu_weixin") {
                if (CC_WECHATGAME) {
                    window.wx.updateShareMenu({
                        withShareTicket: false
                    });
                    window.wx.shareAppMessage({
                        title: cc.dataMgr.getShareDesc_s("invite"),
                        imageUrl: cc.dataMgr.imageUrl.invite,
                        query: "otherID=" + cc.dataMgr.openid,
                        success: (res) => { }
                    });
                } else {
                    //console.log("-- Not is wechatGame PanelRelive --");
                }
            }
            else if (btnN == "anniu_yilingqu") {
                let toggle = event.target.getComponent(cc.Toggle);
                if (toggle) {
                    let isChecked = toggle.isChecked;
                    this.takeReward(customeData, isChecked);
                }
            }
        }
    }
}