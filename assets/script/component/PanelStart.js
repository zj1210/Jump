import DataMgr from 'DataMgr';
import AudioMgr from 'AudioMgr';
const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class Start extends cc.Component {
    @property(cc.Node)
    spr_light = null;
    @property(cc.Node)
    spr_box = null;
    @property(cc.Node)
    node_box = null;

    @property(cc.Node)
    spr_point = null;

    //显示微信子域排行
    @property(cc.Node)
    rankingView = null;
    @property(cc.Node)
    sub_list = null;
    @property(cc.Node)
    sub_my = null;
    @property(cc.Node) //显示列表的content
    node_content = null;

    onLoad() {
        //console.log("--- onLoad Start ---");
        this.spr_point.active = false;
    }

    start() {
        this.rankingView.active = false;
        this.initSubCanvas();

        this.initStart();

        console.log("--- 获取启动参数 ---");
        if (CC_WECHATGAME) {
            let obj = wx.getLaunchOptionsSync();
            console.log(obj);
            if (obj && obj.shareTicket) {
                cc.dataMgr.shareTicket = obj.shareTicket;
                this.showGroup();
            }
        }
    }

    initStart() {
        //钻石数量
        // let lab_green = this.node.getChildByName("prop").getChildByName("prop_Label");
        // lab_green.getComponent(cc.Label).string = cc.dataMgr.userData.propGreenNum;
        //this.node.getChildByName("more_icon").active = true;
        //点击开始游戏
        let spr_begin = this.node.getChildByName("ziti_kaishiyouxi");
        spr_begin.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(0.4), cc.fadeOut(0.6))));

        //主界面柱子和角色
        for (let i = 0; i < this.node_box.children.length; ++i) {
            let nodeN = this.node_box.children[i];
            let randY = Math.random() * 20 + 10;
            nodeN.runAction(cc.repeatForever(cc.sequence(cc.moveBy(1.8 + Math.random() * 2, cc.v2(0, randY)), cc.moveBy(1.2 + Math.random() * 2, cc.v2(0, -randY)))));
        }

        this.rankingView.getChildByName("anniu_share").active = cc.dataMgr.isShowShare;
    }

    initStartBox() {
        //场景中柱子和背景颜色变化
        let boxName = cc.dataMgr.boxName[cc.dataMgr.userData.mainBgIdx];
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs) {
            let boxSf = gameJs.getGameFrame_sf(boxName);
            if (boxSf) {
                this.spr_box.getChildByName("spr_box").getComponent(cc.Sprite).spriteFrame = boxSf;
                for (let i = 0; i < this.node_box.children.length; ++i) {
                    let nodeN = this.node_box.children[i];
                    nodeN.getComponent(cc.Sprite).spriteFrame = boxSf;
                }

            }
        }

        if (cc.dataMgr.haveProp.freeTimes > 0) {
            this.spr_point.active = true;
            this.spr_point.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.8, cc.v2(0, -40)), cc.moveBy(0.4, cc.v2(0, 40)))));
        }

        this.refreshStart();

        //获取超越好友的数据
        if (CC_WECHATGAME) {
            //console.log("-- WECHAT Start.js subPostMessage --");
            window.wx.postMessage({
                messageType: 6,
                MAIN_MENU_NUM: "scoreS",
                myScore: cc.dataMgr.userData.countJump
            });
        }
    }

    showGroup() {
        if (CC_WECHATGAME) {
            this.rankingView.active = true;
            this.rankingView.getChildByName("spr_friend").active = false;
            this.rankingView.getChildByName("spr_qun").active = true;
            console.log("-- 开局显示群排行 --" + cc.dataMgr.shareTicket);
            if (cc.dataMgr.shareTicket) {
                window.wx.postMessage({
                    messageType: 5,
                    MAIN_MENU_NUM: "scoreS",
                    shareTicket: cc.dataMgr.shareTicket
                });
            }

            this.node.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.updataSubCanvas, this)));
            this.scheduleOnce(this.updataSubCanvas, 2.4);
        }
    }

    showFriend() {
        if (CC_WECHATGAME) {
            this.rankingView.active = true;
            this.rankingView.getChildByName("spr_friend").active = true;
            this.rankingView.getChildByName("spr_qun").active = false;
            //console.log("-- WECHAT Start.js subPostMessage --");
            window.wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: "scoreS",
                myScore: cc.dataMgr.userData.countJump
            });
            this.node.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.updataSubCanvas, this)));
            this.scheduleOnce(this.updataSubCanvas, 2.4);
        }
    }

    refreshStart() {
        this.spr_point.active = (cc.dataMgr.haveProp.freeTimes > 0);
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs) {
            let roleSf = gameJs.getGameFrame_sf(cc.dataMgr.userData.useRoleName);
            this.spr_box.getChildByName("spr_role").getComponent(cc.Sprite).spriteFrame = roleSf;
        }
    }

    hideStart() {
        this.node.getChildByName("ziti_kaishiyouxi").active = false;
        this.node.getChildByName("prop").active = false;
        for (let i = 0; i < this.node_box.children.length; ++i) {
            let nodeN = this.node_box.children[i];
            nodeN.stopAllActions();

            let randY = Math.random() * 20 + 10;
            nodeN.runAction(cc.sequence(cc.moveBy(Math.random() * 0.5 + 0.5, cc.v2(0, -640)), cc.fadeOut(0.3)));
        }
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_paiming") {
                this.showFriend();
            } else if (btnN == "anniu_weixin") {
                let nodeRandom = cc.find("Canvas/node_random");
                if (nodeRandom) {
                    nodeRandom.getComponent("PanelRandom").initRand();
                    cc.find("Canvas/node_start").active = false;
                }
            } else if (btnN == "anniu_yinyue") {
                cc.director.loadScene("store");
            } else if (btnN == "anniu_shezhi") {
                if (cc.dataMgr.isShowShare)
                    cc.director.loadScene("invite");
            } else if (btnN == "anniu_backEnd") {
                this.rankingView.active = false;
            } else if (btnN == "more_icon") {
                if (CC_WECHATGAME) {
                    wx.navigateToMiniProgram({
                        appId: 'wx93fc27bed64ce802',
                        path: '',
                        extraData: '',
                        success(res) {
                        },
                        fail() {
                            let str_imageUrl = cc.dataMgr.imageUrl.urlMore
                            wx.previewImage({
                                current: str_imageUrl, // 当前显示图片的http链接
                                urls: [str_imageUrl] // 需要预览的图片http链接列表
                            });
                        }
                    })
                }
            }
            else if (btnN == "ziti_chakanqun") {
                let self = this;
                if (CC_WECHATGAME) {
                    window.wx.updateShareMenu({
                        withShareTicket: true,
                        success() {
                            window.wx.shareAppMessage({
                                title: cc.dataMgr.getShareDesc_s("qunRank"),
                                imageUrl: cc.dataMgr.imageUrl.qunRank,
                                query: "otherID=" + cc.dataMgr.openid,
                                success: (res) => {
                                    console.log("-- shareGroup success --");
                                    console.log(res);
                                    if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                                        cc.dataMgr.shareTicket = res.shareTickets[0];
                                        self.showGroup();
                                    }
                                }
                            });
                        }
                    });
                } else {
                    //console.log("-- Not is wechatGame --");
                }
            }
            else if (btnN == "ziti_chakanhaoyou") {
                this.showFriend();
            }
            else if (btnN == "anniu_share") {
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
        if (CC_WECHATGAME && this.rankingView.active) {
            //console.log("-- WECHAT Start.js updataSubCanvas --");
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.sub_list.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
            this.sub_my.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
            this.node_content.height = this.sub_list.height;
        }
    }

    //分享给好友
    shareFriend() {
        if (CC_WECHATGAME) {
            let type = "end";
            if (cc.dataMgr.userData.countJump <= 0)
                type = "random";
            window.wx.shareAppMessage({
                title: cc.dataMgr.getShareDesc_s(type),
                imageUrl: cc.dataMgr.imageUrl.relive,
                query: "otherID=" + cc.dataMgr.openid,
                success: (res) => {
                    cc.dataMgr.shareSuccess("end");
                    cc.director.loadScene("game");
                }
            });
        } else {
            //console.log("-- Not is wechatGame --");
            cc.dataMgr.shareSuccess("end");
        }
    }
}