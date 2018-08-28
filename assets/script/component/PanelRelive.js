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

    _timeCD = 6;
    _timeCount = 0;

    _toEnd = true;

    onLoad() {

    }

    showRelive() {
        this._toEnd = true;
        if (cc.dataMgr.isShowShare) {
            //修改为只有两次复活了
            if (cc.dataMgr.userData.reliveTimes < 2) {
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
        if (this._toEnd)
            cc.director.loadScene("end");
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
                this.lab_relive.getComponent(cc.Label).string = "敬请期待广告尚未开放"
            } else if (btnN == "btn_end") {
                this.lab_time.stopAllActions();
                //if (this._toEnd)
                cc.director.loadScene("end");
            } else if (btnN == "anniu_weixin") {
                this._toEnd = false;
                this.shareFriend();
            }
        }
    }

    //分享给好友
    shareFriend() {
        if (CC_WECHATGAME) {
            window.wx.updateShareMenu({
                withShareTicket: false
            });
            window.wx.shareAppMessage({
                title: "我在这里，等你来。--境之边缘",
                imageUrl: cc.dataMgr.imageUrl.urlFriend,
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