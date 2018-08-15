const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class RankingView extends cc.Component {

    @property(cc.Node) //显示微信子域排行
    subCanvas = null;

    onLoad() {

    }

    start() {
        //微信子域相关
        this.initSubCanvas();
        this.schedule(this.updataSubCanvas, 0.5);

        this.subPostMessage("submit");
        this.subPostMessage("end");
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_zhuyie") {
                cc.director.loadScene("start");
            } else if (btnN == "kuangti_tongyong01") {
                cc.director.loadScene("game");
            } else if (btnN == "ziti_chakanqun") {

            } else if (btnN == "ziti_chakanhaoyou") {

            }
        }
    }

    //------ 微信子域游戏内所有操作 ------

    //初始化子域信息
    initSubCanvas() {
        this.tex = new cc.Texture2D();
        if (CC_WECHATGAME) {
            console.log("-- WECHAT End.js initSubCanvas --");
            window.sharedCanvas.width = 720;
            window.sharedCanvas.height = 1280;
        }
    }

    updataSubCanvas() {
        if (CC_WECHATGAME) {
            console.log("-- WECHAT End.js updataSubCanvas --");
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.subCanvas.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
        }
    }

    //这里type: submit(提交个人数据)、end(结束界面)、friend(好友排行)
    subPostMessage(type) {
        if (CC_WECHATGAME) {
            console.log("-- WECHAT End.js subPostMessage --" + type);
            if (type == "submit") {
                window.wx.postMessage({
                    messageType: 2,
                    MAIN_MENU_NUM: "user_best_score",
                    myScore: cc.dataMgr.userData.countJump
                });
            } else if (type == "end") {
                window.wx.postMessage({
                    messageType: 3,
                    MAIN_MENU_NUM: "user_best_score",
                    myScore: cc.dataMgr.userData.countJump
                });
            } else if (type == "friend") {
                window.wx.postMessage({
                    messageType: 1,
                    MAIN_MENU_NUM: "user_best_score",
                    myScore: cc.dataMgr.userData.countJump
                });
            }
        }
    }

    //获取群排行
    shareGroup() {
        let self = this;
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                title: "我邀请了8个好友一起PK，就差你了，赶紧来！",
                imageUrl: "https://bpw.blyule.com/res/raw-assets/Texture/shareImage0.a52e5.jpg",
                success: (res) => {
                    console.log("-- shareGroup success --");
                    console.log(res);
                    if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                        window.wx.postMessage({
                            messageType: 5,
                            MAIN_MENU_NUM: "user_best_score",
                            shareTicket: res.shareTickets[0]
                        });
                        // self.dataFetchBtn.interactable = false;
                        // self.uiRefresh();
                    }
                }
            });
        } else {
            console.log("-- Not is wechatGame --");
        }
    }
}