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
    btn_select = null;
    @property(cc.Node)
    lab_share = null;
    @property(cc.Node)
    lab_xuanze = null;
    @property(cc.Node)
    lab_yixuanzhe = null;

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
    }

    refreshShareNum() {
        if (cc.dataMgr.isShowShare) {
            this.lab_shareNum.getComponent(cc.Label).string = ("分享x" + cc.dataMgr.haveProp.countShareNum);
        } else
            this.lab_shareNum.getComponent(cc.Label).string = ("视频x" + cc.dataMgr.haveProp.countAdNum);

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
        }
    }

    update(dt) {
        this.resetScale();
    }

    //分享给好友
    shareFriend() {
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                title: "我在这里，等你来。--境之边缘",
                imageUrl: cc.dataMgr.imageUrl.urlFriend,
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