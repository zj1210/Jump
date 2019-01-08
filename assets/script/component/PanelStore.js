const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelStore extends cc.Component {

    @property(cc.Node)
    node_content = null;

    @property(cc.Node)
    lab_shareNum = null;
    @property(cc.Node)
    lab_title = null;

    @property(cc.Node)
    btn_select = null;
    @property(cc.Node)
    lab_share = null;
    @property(cc.Node)
    lab_xuanze = null;
    @property(cc.Node)
    lab_yixuanzhe = null;

    @property(cc.Node)
    lab_hp = null;

    //歌曲列表
    @property(cc.Node)
    node_contentSound = null;

    _firstPosX = -512; //界面中摆放的第一个 player 的位置
    _playerDis = 256; //两个player 之间的距离

    _showPlayerD = null; //显示角色的信息
    _showPlayerIdx = 0; //当前显示的 (最大的那个 角色的下标)
    _colorBegin = null; //初始颜色
    _onMoving = false;

    onLoad() {
        this._onMoving = false;
        this._colorBegin = this.node_content.children[0].color;
        this._firstPosX = this.node_content.children[0].x;
        this.node.getChildByName("prop").getChildByName("prop_Label").getComponent(cc.Label).string = cc.dataMgr.userData.propGreenNum;

        let posX = this._firstPosX + cc.dataMgr.haveProp.useRoleIdx * this._playerDis;
        console.log("--- onLoad Store ---" + posX + " -- " + cc.dataMgr.haveProp.useRoleIdx);
        this.node_content.x = -posX;
        this.checkContentPos();

        //背景颜色
        let bgName = cc.dataMgr.gameBgName[cc.dataMgr.userData.mainBgIdx];
        let frame = cc.dataMgr.getBgFrame_sf(bgName);
        if (frame) {
            let spr_bg = this.node.getChildByName("game_bg");
            spr_bg.getComponent(cc.Sprite).spriteFrame = frame;
        }

        //诱导分享
        this.node.getChildByName("anniu_zhuyie").x = (cc.dataMgr.isShowShare ? 100 : 0);
        this.node.getChildByName("anniu_weixin").x = (cc.dataMgr.isShowShare ? -100 : 0);
        this.node.getChildByName("anniu_weixin").active = cc.dataMgr.isShowShare;

        this.refreshShareNum();

        this.refreshSound();
    }

    refreshShareNum() {
        if (cc.dataMgr.isShowShare) {
            this.lab_title.getComponent(cc.Label).string = "已获得分享值";
            this.lab_shareNum.getComponent(cc.Label).string = cc.dataMgr.haveProp.countShareNum;
        } else {
            this.lab_title.getComponent(cc.Label).string = "已看视频";
            this.lab_shareNum.getComponent(cc.Label).string = cc.dataMgr.haveProp.countAdNum;
        }

        //为了分享之后就更新界面
        this.callMoveEnd();
    }

    //检查content 位置使至少一个角色是亮的(每次滑动后都调用),并确定 _playerIdx;
    checkContentPos() {
        let num = this.node_content.x % this._playerDis;
        //console.log("-- checkPos: " + num + " -- " + this.node_content.x);
        if (!this._onMoving) {
            this._onMoving = true;
            this.node_content.stopAllActions();
            let aimPosY = this.node_content.x - num + (Math.abs(num) > this._playerDis / 2 ? this._playerDis : 0) * (num > 0 ? 1 : -1);
            this.node_content.runAction(cc.sequence(cc.moveTo(0.1, cc.v2(aimPosY, this.node_content.y)), cc.callFunc(this.callMoveEnd, this)));
        }
    }

    callMoveEnd() {
        this._onMoving = false;
        //确定 那个是亮的
        for (let i = 0; i < this.node_content.children.length; ++i) {
            let nodeN = this.node_content.children[i];
            if (nodeN.scale > 0.9 * 2) {
                this._showPlayerIdx = i;
                break;
            }
        }
        //根据显示的更改钱数
        if (this._showPlayerIdx < cc.dataMgr.roleData.length) {
            this._showPlayerD = cc.dataMgr.roleData[this._showPlayerIdx];
            if (this._showPlayerD.name == cc.dataMgr.userData.useRoleName) {
                this.lab_xuanze.active = false;
                this.lab_yixuanzhe.active = true;
                this.lab_share.active = false;
                this.btn_select.getComponent(cc.Button).interactable = false;
            } else if (this._showPlayerD.price <= cc.dataMgr.haveProp.countShareNum) {
                this.lab_xuanze.active = true;
                this.lab_yixuanzhe.active = false;
                this.lab_share.active = false;
                this.btn_select.getComponent(cc.Button).interactable = true;
            } else {
                this.lab_xuanze.active = false;
                this.lab_yixuanzhe.active = false;
                this.lab_share.active = true;
                this.btn_select.getComponent(cc.Button).interactable = false;

                if (cc.dataMgr.isShowShare)
                    this.lab_share.getComponent(cc.Label).string = ("分享x" + this._showPlayerD.price);
                else
                    this.lab_share.getComponent(cc.Label).string = ("视频x" + this._showPlayerD.price);
            }
            this.lab_hp.getComponent(cc.Label).string = ("生命值x" + this._showPlayerD.hp);
        } else {
            this._showPlayerD = null;
        }
    }

    //根据 content 距中心点的位置设置 大小
    resetScale() {
        let centerX = -this.node_content.x;
        for (let i = 0; i < this.node_content.children.length; ++i) {
            let nodeN = this.node_content.children[i];
            let scale = 1 - (Math.abs(centerX - nodeN.x) / (this._playerDis * 2));
            if (scale < 0.7)
                scale = 0.7;
            else if (scale > 1)
                scale = 1;
            nodeN.scale = scale * 2;
            if (scale < 0.9)
                nodeN.color = cc.color(this._colorBegin.r * 0.5, this._colorBegin.g * 0.5, this._colorBegin.b * 0.5, 255);
            else
                nodeN.color = this._colorBegin;
        }
    }

    scrollEvent(sender, event) {
        switch (event) {
            case 0:
                //console.log("Scroll to Top");
                break;
            case 1:
                //console.log("Scroll to Bottom");
                break;
            case 2:
                //console.log("Scroll to Left");
                break;
            case 3:
                //console.log("Scroll to Right");
                break;
            case 4:
                //console.log("Scrolling");
                break;
            case 5:
                //console.log("Bounce Top");
                break;
            case 6:
                //console.log("Bounce bottom");
                break;
            case 7:
                //console.log("Bounce left");
                break;
            case 8:
                //console.log("Bounce right");
                break;
            case 9:
                //console.log("Auto scroll ended");
                this.checkContentPos();
                break;
        }
    }

    refreshSound() {
        for (let i = 0; i < this.node_contentSound.children.length; ++i) {
            let nodeN = this.node_contentSound.children[i];
            if (i < cc.dataMgr.soundData.length) {
                nodeN.active = true;
                let soundD = cc.dataMgr.soundData[i];
                nodeN.getChildByName("name").getComponent(cc.Label).string = soundD.desc;
                let btnN = nodeN.getChildByName("butten_buy");

                let isLock = this.getIsLock(i);
                btnN.getChildByName("ziti_xuanze").active = (i != cc.dataMgr.haveProp.useSoundIdx && isLock == null);
                btnN.getChildByName("ziti_yixuanze").active = (i == cc.dataMgr.haveProp.useSoundIdx);
                btnN.getChildByName("lab_desc").active = (isLock != null);
                if (isLock != null) {
                    btnN.getChildByName("lab_desc").getComponent(cc.Label).string = isLock;
                    btnN.getChildByName("btn_sound").getComponent(cc.Button).interactable = false;
                }
                else
                    btnN.getChildByName("btn_sound").getComponent(cc.Button).interactable = true;

                nodeN.getChildByName("progress").getComponent(cc.ProgressBar).progress = this.getProgressNow_i(i);
            }
            else {
                nodeN.active = false;
            }
        }
    }

    //返回 null 则是可以使用
    getIsLock(soundIdx) {
        let isLock = null;
        if (soundIdx == 1 && cc.dataMgr.haveProp.countShareNum < 19)
            isLock = (cc.dataMgr.isShowShare ? "分享x19" : "视频x9");
        if (soundIdx == 2 && cc.dataMgr.haveProp.countShareNum < 39)
            isLock = (cc.dataMgr.isShowShare ? "分享x39" : "视频x19");//"分享x39";
        if (soundIdx == 3 && cc.dataMgr.haveProp.countAdNum < 29)
            isLock = "视频x29";
        if (soundIdx == 4 && cc.dataMgr.haveProp.countInvite < 3)
            isLock = (cc.dataMgr.isShowShare ? "邀请x3" : "视频x99");//"邀请x3";
        return isLock;
    }

    getProgressNow_i(soundIdx) {
        let pro = 1;
        if (soundIdx == 1 && cc.dataMgr.haveProp.countShareNum < 19)
            pro = cc.dataMgr.haveProp.countShareNum / 19;
        if (soundIdx == 2 && cc.dataMgr.haveProp.countShareNum < 39)
            pro = cc.dataMgr.haveProp.countShareNum / 39;
        if (soundIdx == 3 && cc.dataMgr.haveProp.countAdNum < 29)
            pro = cc.dataMgr.haveProp.countAdNum / 29;
        if (soundIdx == 4 && cc.dataMgr.haveProp.countInvite < 3)
            pro = cc.dataMgr.haveProp.countInvite / 3;
        if (pro > 1)
            pro = 1;
        return pro;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_zhuyie") {
                cc.dataMgr.saveData();
                cc.director.loadScene("game");
            } else if (btnN == "kuangti_tongyong01") {
                console.log("--- 使用 ---" + this._onMoving);
                if (!this._onMoving && this._showPlayerD) {
                    cc.dataMgr.changeRole(this._showPlayerIdx);
                    this.callMoveEnd();

                    //这是切换场景自然会 更换图片
                    // let startJs = cc.find("Canvas/node_start").getComponent("PanelStart");
                    // if (startJs)
                    //     startJs.refreshStart();
                }
            } else if (btnN == "anniu_weixin") {
                this.shareFriend();
            }
            else if (btnN == "btn_sound") {
                //选择歌曲
                cc.dataMgr.changeSound(customeData);
                this.refreshSound();
            }
        }
    }

    update(dt) {
        this.resetScale();
    }

    //分享给好友
    shareFriend() {
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                title: cc.dataMgr.getShareDesc_s("sound"),
                imageUrl: cc.dataMgr.imageUrl.sound,
                query: "otherID=" + cc.dataMgr.openid,
                success: (res) => {
                    cc.dataMgr.shareSuccess("store");
                }
            });
        } else {
            //console.log("-- Not is wechatGame store --");
            cc.dataMgr.shareSuccess("store");
        }
    }
}