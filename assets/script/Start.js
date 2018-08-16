import DataMgr from 'DataMgr';
import AudioMgr from 'AudioMgr';
const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class Start extends cc.Component {
    /*
        重要提示 数据在start onLoad 中初始化,启动游戏一定要打这开始启动
    */
    @property(cc.SpriteAtlas) //图集
    atlas_game = null;

    @property(cc.Node)
    spr_light = null;
    @property(cc.Node)
    spr_box = null;
    @property(cc.Node)
    spr_role = null;
    @property(cc.Node)
    node_box = null;

    //显示微信子域排行
    @property(cc.Node)
    rankingView = null;
    @property(cc.Node)
    subCanvas = null;

    onLoad() {
        console.log("--- onLoad Start ---");
        if (!cc.dataMgr) {
            //let DataMgr = require("DataMgr");
            cc.dataMgr = new DataMgr();
            cc.dataMgr.initData();
        }
        if (!cc.audioMgr) {
            //let AudioMgr = require("AudioMgr");
            cc.audioMgr = new AudioMgr();
            cc.audioMgr.init();
        }
    }

    start() {
        let self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                cc.director.loadScene("game");
                return true;
            },
            onTouchMoved: function (touch, event) {},
            onTouchEnded: function (touch, event) {}
        }, self.node);

        this.initStart();

        this.rankingView.active = false;
        this.initSubCanvas();
        this.schedule(this.updataSubCanvas, 0.5);
    }

    initStart() {
        //钻石数量
        let lab_green = this.node.getChildByName("prop").getChildByName("prop_Label");
        lab_green.getComponent(cc.Label).string = cc.dataMgr.userData.propGreenNum;

        //点击开始游戏
        let spr_begin = this.node.getChildByName("ziti_kaishiyouxi");
        spr_begin.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(0.4), cc.fadeOut(0.6))));

        //背景颜色
        let frame = cc.dataMgr.getBgFrame_sf(null);
        if (frame) {
            let spr_bg = this.node.getChildByName("game_bg");
            spr_bg.getComponent(cc.Sprite).spriteFrame = frame;
        }

        //主界面柱子和角色
        //this.spr_light.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(1.2), cc.fadeOut(3.6))));
        let sprFrame = this.getGameFrame_sf(cc.dataMgr.userData.boxName);
        if (sprFrame) {
            this.spr_box.getComponent(cc.Sprite).spriteFrame = sprFrame;
            for (let i = 0; i < this.node_box.children.length; ++i) {
                let nodeN = this.node_box.children[i];
                nodeN.getComponent(cc.Sprite).spriteFrame = sprFrame;
                let randY = Math.random() * 20 + 10;
                nodeN.runAction(cc.repeatForever(cc.sequence(cc.moveBy(1.8 + Math.random()*2, cc.v2(0, randY)), cc.moveBy(1.2 + Math.random()*2, cc.v2(0, -randY)))));
            }
        }
    }

    //获取精灵图片
    getGameFrame_sf(name) {
        let sf = this.atlas_game.getSpriteFrame(name);
        if (!sf)
            sf = this.atlas_game.getSpriteFrame("zz01");
        return sf;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_paiming") {
                this.rankingView.active = true;
                if (CC_WECHATGAME) {
                    console.log("-- WECHAT Start.js subPostMessage --");
                    window.wx.postMessage({
                        messageType: 1,
                        MAIN_MENU_NUM: "user_best_score",
                        myScore: cc.dataMgr.userData.countJump
                    });
                }
            } else if (btnN == "anniu_weixin") {
                this.shareFriend();
            } else if (btnN == "anniu_yinyue") {
                cc.director.loadScene("store");
            } else if (btnN == "anniu_shezhi") {

            } else if (btnN == "anniu_backEnd") {
                this.rankingView.active = false;
            }
        }
    }

    //微信相关

    //初始化子域信息
    initSubCanvas() {
        if (!this.tex)
            this.tex = new cc.Texture2D();
        if (CC_WECHATGAME) {
            console.log("-- WECHAT Start.js initSubCanvas --");
            window.sharedCanvas.width = 720;
            window.sharedCanvas.height = 1280;
        }
    }

    updataSubCanvas() {
        if (CC_WECHATGAME && this.rankingView.active) {
            console.log("-- WECHAT Start.js updataSubCanvas --");
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.subCanvas.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
        }
    }

    //分享给好友
    shareFriend() {
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                title: "我再这里，等你来。--境之边缘",
                imageUrl: "https://bpw.blyule.com/res/raw-assets/Texture/shareImage0.a52e5.jpg",
                success: (res) => {
                    cc.dataMgr.shareSuccess();
                }
            });
        } else {
            console.log("-- Not is wechatGame --");
        }
    }
}