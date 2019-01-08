const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelRelive extends cc.Component {

    @property(cc.Node)
    spr_circle = null;
    @property(cc.Node)
    lab_time = null;
    @property(cc.Node)
    lab_relive = null;

    @property(cc.Node)
    node_relive = null;
    @property(cc.Node) //引导分享
    node_share = null;

    @property(cc.Node)
    sub_beyond = null;

    _timeCD = 6;
    _timeCount = 0;

    _toEnd = true;
    _haveToEnd = false;

    onLoad() {
        this.initSubCanvas();
    }

    showRelive() {
        this._toEnd = true;
        if (cc.dataMgr.isShowShare) {
            //修改为只有两次复活了
            if (cc.dataMgr.userData.reliveTimes < cc.dataMgr.reliveAdNum - 1) {
                this.node_share.active = true;
                this.node_relive.active = false;
            } else {
                this.node_share.active = false;
                this.node_relive.active = true;
            }
        } else {
            this.node_share.active = cc.dataMgr.isShowShare;
            this.node_relive.active = true;
        }

        this._timeCount = 6;
        this.spr_circle.stopAllActions();
        this.lab_time.stopAllActions();
        this.lab_time.getComponent(cc.Label).string = this._timeCount;
        this.spr_circle.runAction(this.myCircleTo_act(this._timeCD, 1));
        this.lab_time.runAction(cc.sequence(cc.repeat(cc.sequence(cc.delayTime(1), cc.callFunc(this.callChengNum, this)), 6), cc.delayTime(0.2), cc.callFunc(this.callEnd, this)));

        this.lab_relive.getComponent(cc.Label).string = "观看广告复活并回满生命值";

        //微信排行
        if (CC_WECHATGAME) {
            //console.log("-- WECHAT Start.js subPostMessage --");
            window.wx.postMessage({
                messageType: 8,
                MAIN_MENU_NUM: "score",
                myScore: cc.dataMgr.userData.countJump
            });
            this.scheduleOnce(this.updataSubCanvas, 1);
        }
    }

    //圆形cd:总时间、百分比(0~1)
    myCircleTo_act(timeT, aimRange) {
        let action = cc.delayTime(timeT);
        action.aimRange = aimRange;
        action.update = function (dt) {
            let node = action.getTarget();
            if (node) {
                node.getComponent(cc.Sprite).fillRange = (1 - dt);
            }
        };
        return action;
    }

    callChengNum() {
        this._timeCount--;
        if (this._timeCount < 0)
            this._timeCount = 0;
        this.lab_time.getComponent(cc.Label).string = this._timeCount;
    }

    callEnd() {
        if (this._toEnd && !this._haveToEnd) {
            this._haveToEnd = true;
            cc.director.loadScene("end");
        }
    }

    reliveRole() {
        ++cc.dataMgr.userData.reliveTimes;
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs) {
            gameJs.initGame(true);
        }
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "btn_relive") {
                //这里要观看广告复活了
                //this.lab_relive.getComponent(cc.Label).string = "敬请期待广告尚未开放"
                this._toEnd = false;
                cc.dataMgr.showAd("relive");
            } else if (btnN == "btn_end") {
                this.lab_time.stopAllActions();
                if (!this._haveToEnd) {
                    this._haveToEnd = true;
                    cc.director.loadScene("end");
                }
            } else if (btnN == "anniu_weixin") {
                this._toEnd = false;
                this.shareFriend();
            }
        }
    }

    //------ 微信相关 ------

    //初始化子域信息
    initSubCanvas() {
        if (!this.tex)
            this.tex = new cc.Texture2D();
        if (CC_WECHATGAME) {
            //console.log("-- WECHAT Start.js initSubCanvas --");
            window.sharedCanvas.width = 720;
            window.sharedCanvas.height = 1280;
        }
    }

    updataSubCanvas() {
        if (CC_WECHATGAME) {
            //console.log("-- WECHAT Start.js updataSubCanvas --");
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.sub_beyond.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
        }
    }

    //分享给好友
    shareFriend() {
        if (CC_WECHATGAME) {
            window.wx.updateShareMenu({
                withShareTicket: false
            });
            window.wx.shareAppMessage({
                title: cc.dataMgr.getShareDesc_s("relive"),
                imageUrl: cc.dataMgr.imageUrl.relive,
                query: "otherID=" + cc.dataMgr.openid,
                success: (res) => {
                    cc.dataMgr.shareSuccess("endRelive");
                }
            });
        } else {
            //console.log("-- Not is wechatGame PanelRelive --");
            cc.dataMgr.shareSuccess("endRelive");
        }
    }
}