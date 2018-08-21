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

    //显示微信子域排行
    @property(cc.Node)
    rankingView = null;
    @property(cc.Node)
    subCanvas = null;

    onLoad() {
        //console.log("--- onLoad Start ---");
    }

    start() {
        this.initStart();
        this.rankingView.active = false;
        this.initSubCanvas();
    }

    initStart() {
        //钻石数量
        // let lab_green = this.node.getChildByName("prop").getChildByName("prop_Label");
        // lab_green.getComponent(cc.Label).string = cc.dataMgr.userData.propGreenNum;
        this.node.getChildByName("more_icon").active = true;
        //点击开始游戏
        let spr_begin = this.node.getChildByName("ziti_kaishiyouxi");
        spr_begin.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(0.4), cc.fadeOut(0.6))));

        //主界面柱子和角色
        //this.spr_light.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(1.2), cc.fadeOut(3.6))));
        //this.spr_box.getComponent(cc.Sprite).spriteFrame = sprFrame;
        for (let i = 0; i < this.node_box.children.length; ++i) {
            let nodeN = this.node_box.children[i];
            //nodeN.getComponent(cc.Sprite).spriteFrame = sprFrame;
            let randY = Math.random() * 20 + 10;
            nodeN.runAction(cc.repeatForever(cc.sequence(cc.moveBy(1.8 + Math.random() * 2, cc.v2(0, randY)), cc.moveBy(1.2 + Math.random() * 2, cc.v2(0, -randY)))));
        }
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
                this.rankingView.active = true;
                if (CC_WECHATGAME) {
                    //console.log("-- WECHAT Start.js subPostMessage --");
                    window.wx.postMessage({
                        messageType: 1,
                        MAIN_MENU_NUM: "user_best_score",
                        myScore: cc.dataMgr.userData.countJump
                    });
                    this.node.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.updataSubCanvas, this)));
                    this.scheduleOnce(this.updataSubCanvas, 2.4);
                }
            } else if (btnN == "anniu_weixin") {
                let nodeRandom = cc.find("Canvas/node_random");
                if (nodeRandom) {
                    nodeRandom.getComponent("PanelRandom").initRand();
                }
            } else if (btnN == "anniu_yinyue") {
                cc.director.loadScene("store");
            } else if (btnN == "anniu_shezhi") {
                if (cc.dataMgr.isShowShare)
                    cc.director.loadScene("invite");
            } else if (btnN == "anniu_backEnd") {
                this.rankingView.active = false;
            } else if (btnN == "more_icon") {
                //let str_imageUrl = "https://bpw.blyule.com/res/raw-assets/Texture/propaganda.6b9b9.jpg";
                let str_imageUrl = cc.dataMgr.imageUrl.urlMore
                wx.previewImage({
                    current: str_imageUrl, // 当前显示图片的http链接
                    urls: [str_imageUrl] // 需要预览的图片http链接列表
                });
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
            this.subCanvas.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
        }
    }
}