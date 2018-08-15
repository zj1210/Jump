const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class Game extends cc.Component {
    @property(cc.SpriteAtlas) //图集
    atlas_game = null;

    @property(cc.SpriteFrame) //溶解所需
    noiseTexture = null;

    @property(cc.Prefab) //预置box
    pre_box = null;

    @property(cc.Node) //复活界面
    node_relive = null;

    @property(cc.Node) //游戏节点
    node_game = null;
    @property(cc.Node) //所有砖块的根节点
    root_box = null;
    @property(cc.Node) //角色
    node_role = null;
    @property(cc.Node) //拖尾效果实验
    node_streak = null;
    @property(cc.Node)
    node_ui = null;
    @property(cc.Node) //相机
    node_camera = null;

    @property(cc.Node) //微信子域显示下一个好友
    subCanvas = null;

    _isInitGame = false; //游戏是否初始化完成(完成后点击就开始跳了)

    onLoad() {
        console.log("--- Game onLoad ---");

        //TODO 这样加载在微信中报错了,查找原因,ES5 写法探究
        // let DataMgr = require("DataMgr");
        // cc.dataMgr = new DataMgr();

        // cc.dataMgr = this.node.getComponent("DataMgr");
        // //读取本地储存的 玩家闯关的信息
        // cc.dataMgr.initData();

        // cc.audioMgr = this.node.getComponent("AudioMgr");
        // cc.audioMgr.init();
    }

    start() {
        let self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                let touchPos = touch.getLocation();
                if (cc.dataMgr.userData.pauseGame)
                    return true;
                //在游戏中 且 不在加速状态 才能自由选择前进方向。
                if (cc.dataMgr.userData.onGaming && cc.dataMgr.userData.speedNum <= 0) {
                    self.jumpRole(touchPos.x < 360);
                } else if (self._isInitGame) {
                    self._isInitGame = false;
                    cc.dataMgr.userData.onGaming = true;
                    self.jumpRole(touchPos.x < 360);
                    self.node_game.getChildByName("node_hint").active = false;
                }
                return true;
            },
            onTouchMoved: function (touch, event) {},
            onTouchEnded: function (touch, event) {}
        }, self.node);

        //背景音乐
        cc.audioMgr.playBg();

        this.initGame(false);

        //微信子域
        this.initSubCanvas();
    }

    //这里是初始游戏,再点击就开始跳了(是否为复活)
    initGame(isRelive) {
        if (!isRelive) {
            //初始化数据
            cc.dataMgr.userData.onGaming = false;
            cc.dataMgr.userData.lastBoxX = cc.dataMgr.boxX;
            cc.dataMgr.userData.lastBoxY = -cc.dataMgr.boxY;
            cc.dataMgr.userData.countBox = 0;

            cc.dataMgr.userData.gameBgIdx = 0;
            cc.dataMgr.userData.boxName = "box1";

            cc.dataMgr.userData.aimRoleX = 0;
            cc.dataMgr.userData.aimRoleY = 0;
            cc.dataMgr.userData.roleDieType = 0;
            cc.dataMgr.userData.countJump = 0;

            cc.dataMgr.userData.reliveTimes = 0;

            if (cc.dataMgr.userData.shareDouble > 0) {
                cc.dataMgr.userData.reliveHp = cc.dataMgr.userData.reliveNum * 2 + cc.dataMgr.userData.baseHp;
                cc.dataMgr.userData.shareDouble--;
            } else
                cc.dataMgr.userData.reliveHp = cc.dataMgr.userData.baseHp + cc.dataMgr.userData.reliveNum;
            cc.dataMgr.userData.reliveNum = 0;

            //暂时加的 设置上限为 30
            if (cc.dataMgr.userData.reliveHp > 30)
                cc.dataMgr.userData.reliveHp = 30;

            //保证角色在中心点下两个 方块高度
            this.node_camera.position = cc.v2(0, 2 * cc.dataMgr.boxY);

            console.log("--- initGame ---");
            console.log(cc.dataMgr.userData);

            for (let i = 0; i < this.root_box.children.length; ++i) {
                this.root_box.children[i].getComponent("NodeBox").killBox();
            }

            //界面及角色 显示
            this.hideRelive();
            this.node_game.active = true;
            this.node_game.getChildByName("node_hint").active = true;
            this.node_role.active = true;
            this.node_role.getComponent("NodeRole").initRole(null);

            this.node_ui.getChildByName("lab_score").active = true;
            this.node_ui.getChildByName("lab_score").getComponent(cc.Label).string = ("得分：" + cc.dataMgr.userData.countJump);
            this.node_ui.getChildByName("lab_hp").getComponent(cc.Label).string = cc.dataMgr.userData.reliveHp;

            //改变背景 和 boxName
            this.changeToNextBg();

            //初始化
            for (let i = 0; i < 6; ++i)
                this.createBox(null);

            //标识初始化完成 再点击屏幕可以开始跳跃了
            //this._isInitGame = true;

            //开局自动使用道具
            this.usePropSpeedOrCut();
            if (cc.dataMgr.userData.speedNum > 0) {
                this.node.runAction(cc.sequence(cc.delayTime(1.2), cc.callFunc(this.callBeginSpeed, this)));
            } else
                this._isInitGame = true;

        } else {
            //这里是复活(有些数据不需要初始化)
            cc.dataMgr.userData.onGaming = false;
            cc.dataMgr.userData.roleDieType = 0;
            ++cc.dataMgr.userData.reliveTimes;

            console.log("--- initGame relive ---");
            console.log(cc.dataMgr.userData);

            //给角色找一个合理的位置
            let posBegin = cc.v2(0, 0);
            let minDis = cc.dataMgr.boxY * 2;
            let aimY = cc.dataMgr.userData.aimRoleY;
            if (aimY <= this.node_camera.y)
                aimY = this.node_camera.y;
            for (let i = 0; i < this.root_box.children.length; ++i) {
                let nodeN = this.root_box.children[i];
                let nodeNJs = nodeN.getComponent("NodeBox");
                if (nodeN && nodeNJs && nodeN.y <= aimY) {
                    let disY = Math.abs(nodeN.y - aimY);
                    //这种是可以 跳上去的砖块
                    if (nodeNJs._boxType == "box" || nodeNJs._boxType == "prop") {
                        if (disY < minDis) {
                            posBegin = nodeN.position;
                        }
                    }
                }
            }

            cc.dataMgr.userData.aimRoleX = posBegin.x;
            cc.dataMgr.userData.aimRoleY = posBegin.y;

            //如果这个位置上有道具 用来消除道具
            this.getAimPos_o(posBegin);

            //界面及角色 显示
            this.hideRelive();
            this.node_game.active = true;
            this.node_game.getChildByName("node_hint").active = true;
            this.node_role.active = true;
            this.node_role.getComponent("NodeRole").initRole(posBegin);
            this.node_role.getComponent("NodeRole").blinkRole();

            this.node_ui.getChildByName("lab_score").active = true;
            this.node_ui.getChildByName("lab_score").getComponent(cc.Label).string = ("得分：" + cc.dataMgr.userData.countJump);
            this.node_ui.getChildByName("lab_hp").getComponent(cc.Label).string = cc.dataMgr.userData.reliveHp;

            //补充台阶数
            let supr = parseInt((cc.dataMgr.userData.lastBoxY - posBegin.y) / cc.dataMgr.boxY);
            for (let i = 0; i < 5 - supr; ++i)
                this.createBox(null);

            //console.log("-- 补 " + supr + " --R " + posBegin.y + " --B " + cc.dataMgr.userData.lastBoxY + " --C " + this.node_camera.y);

            //标识初始化完成 再点击屏幕可以开始跳跃了
            this._isInitGame = true;
        }
        cc.dataMgr.saveData();
    }

    //开局加速
    callBeginSpeed() {
        this.jumpRole(true);
        this._isInitGame = false;
        cc.dataMgr.userData.onGaming = true;

        this.node.getChildByName("node_hint").getComponent("NodeHint").showHint("speed");
    }

    showRelive() {
        // this.subPostMessage("submit");

        // this.node_relive.active = true;
        // this.node_relive.getComponent("PanelRelive").showRelive();
        // cc.dataMgr.saveData();
        if (cc.dataMgr.userData.reliveHp > 0) {
            cc.dataMgr.userData.reliveHp--;
            this.initGame(true);
        } else {
            //直接结束游戏
            cc.director.loadScene("end");
        }
    }

    hideRelive() {
        this.node_relive.active = false;
    }

    //是否向左跳
    jumpRole(isLeft) {
        ++cc.dataMgr.userData.countJump;
        //判断是否可以替换场景图片
        if (cc.dataMgr.userData.countJump > 0 && cc.dataMgr.userData.countJump % cc.dataMgr.userData.changeNum == 0)
            this.changeToNextBg();

        this.node_ui.getChildByName("lab_score").getComponent(cc.Label).string = ("得分：" + cc.dataMgr.userData.countJump);

        let aimY = cc.dataMgr.boxY + cc.dataMgr.userData.aimRoleY;
        let aimX = (isLeft ? -1 : 1) * cc.dataMgr.boxX + cc.dataMgr.userData.aimRoleX;

        this.node_role.stopAllActions();

        //获取目标点是否有 box 及其类型, 并矫正Y
        let data = this.getAimPos_o(cc.v2(aimX, aimY));
        aimY = data.aimPosY;
        //落到空 box 上才有声音
        // if (data && data.boxType == "box") 
        //     cc.audioMgr.playEffect("role_jump1");
        if (data.dieType > 0) {
            //加速的时候是不让死的
            if (cc.dataMgr.userData.speedNum > 0) {
                isLeft = !isLeft;
                aimX = (isLeft ? -1 : 1) * cc.dataMgr.boxX + cc.dataMgr.userData.aimRoleX;
                this.getAimPos_o(cc.v2(aimX, aimY)); //加速的时候拾取道具
                this.node_role.runAction(cc.sequence(cc.jumpTo(cc.dataMgr.userData.jumpTime, cc.v2(aimX, aimY), (aimY - this.node_role.y) * 0.35, 1), cc.callFunc(this.autoJump, this)));
            } else {
                cc.dataMgr.userData.roleDieType = data.dieType;
                cc.dataMgr.userData.onGaming = false;
                let roleJs = this.node_role.getComponent("NodeRole");
                this.node_role.runAction(cc.sequence(cc.jumpTo(cc.dataMgr.userData.jumpTime, cc.v2(aimX, aimY), (aimY - this.node_role.y) * 0.35, 1), cc.callFunc(roleJs.toDie, roleJs)));
            }
        } else if (cc.dataMgr.userData.speedNum > 0) {
            this.node_role.runAction(cc.sequence(cc.jumpTo(cc.dataMgr.userData.jumpTime, cc.v2(aimX, aimY), (aimY - this.node_role.y) * 0.35, 1), cc.callFunc(this.autoJump, this)));
        } else {
            this.node_role.runAction(cc.jumpTo(cc.dataMgr.userData.jumpTime, cc.v2(aimX, aimY), (aimY - this.node_role.y) * 0.35, 1));
        }
        this.node_role.scaleX = (isLeft ? -1 : 1);

        cc.dataMgr.userData.aimRoleX = aimX;
        cc.dataMgr.userData.aimRoleY = aimY;

        //最多比当前角色在的台阶高 5阶
        if (cc.dataMgr.userData.lastBoxY - cc.dataMgr.userData.aimRoleY < 5 * cc.dataMgr.boxY)
            this.createBox(null);
        if (cc.dataMgr.userData.speedNum > 0)
            --cc.dataMgr.userData.speedNum;

        //不是在加速状态 且跳过了五个台阶提交子域超过好友
        if (cc.dataMgr.userData.countJump % 5 == 0 && cc.dataMgr.userData.speedNum <= 0)
            this.subPostMessage("nextBeyond");
    }

    //开局加速会停下来 其它不会
    autoJump() {
        if (cc.dataMgr.userData.speedNum > 0)
            this.jumpRole(false);
        else {
            cc.dataMgr.userData.onGaming = !(this.node_game.getChildByName("node_hint").active);
            this._isInitGame = this.node_game.getChildByName("node_hint").active;
            this.node.getChildByName("node_hint").getComponent("NodeHint").showHint("speedEnd");
        }
    }

    //如果nodeN 存在只是初始化它的位置 及信息
    createBox(nodeN) {
        ++cc.dataMgr.userData.countBox;
        //这里的isLeft 表示砖块是否在左边(第一个砖块一定在左边)
        let isLeft = (Math.random() > 0.5 || cc.dataMgr.userData.countBox == 1);
        let posX = cc.dataMgr.boxX * (isLeft ? -1 : 1) + cc.dataMgr.userData.lastBoxX;
        let posY = cc.dataMgr.boxY + cc.dataMgr.userData.lastBoxY;
        let boxType = (cc.dataMgr.userData.countBox % 9 == 0 ? "prop" : "box");

        if (!nodeN) {
            nodeN = cc.instantiate(this.pre_box);
            this.root_box.addChild(nodeN);
        }
        nodeN.active = true;
        nodeN.getComponent("NodeBox").initBox(cc.dataMgr.userData.countBox, cc.v2(posX, posY), isLeft, boxType);

        //是否显示障碍物
        let showBlock = Math.random() > 0.8;
        if (showBlock && cc.dataMgr.userData.countBox > 5) {
            let blockX = cc.dataMgr.boxX * (!isLeft ? -1 : 1) + cc.dataMgr.userData.lastBoxX;
            let block = cc.instantiate(this.pre_box);
            this.root_box.addChild(block);
            block.active = true;
            block.getComponent("NodeBox").initBox(cc.dataMgr.userData.countBox, cc.v2(blockX, posY), !isLeft, "block");
        }

        cc.dataMgr.userData.lastBoxX = posX;
        cc.dataMgr.userData.lastBoxY = posY;
    }

    //改变一下游戏场景 背景及砖块样式
    changeToNextBg() {
        //console.log("--- 变色了 ---");
        //判断确定 idx
        let lastBgName = null;
        if (cc.dataMgr.userData.countJump == 0)
            cc.dataMgr.userData.gameBgIdx = 0;
        else {
            lastBgName = cc.dataMgr.gameBgName[cc.dataMgr.userData.gameBgIdx];

            ++cc.dataMgr.userData.gameBgIdx;
            if (cc.dataMgr.userData.gameBgIdx >= cc.dataMgr.boxName.length)
                cc.dataMgr.userData.gameBgIdx = 0;
        }
        cc.dataMgr.userData.boxName = cc.dataMgr.boxName[cc.dataMgr.userData.gameBgIdx];

        let bgName = cc.dataMgr.gameBgName[cc.dataMgr.userData.gameBgIdx];
        let spr_bg = this.node.getChildByName("node_bg").getChildByName("spr_bg1");
        spr_bg.opacity = 0;
        let frameBg = cc.dataMgr.getBgFrame_sf(bgName);
        if (frameBg)
            spr_bg.getComponent(cc.Sprite).spriteFrame = frameBg;

        //console.log("--- " + bgName + " -- " + lastBgName);
        if (lastBgName) {
            let spr_bg2 = this.node.getChildByName("node_bg").getChildByName("spr_bg2");
            let frameLast = cc.dataMgr.getBgFrame_sf(lastBgName);
            if (frameLast)
                spr_bg2.getComponent(cc.Sprite).spriteFrame = frameLast;
            spr_bg2.opacity = 255;
            spr_bg2.runAction(cc.sequence(cc.callFunc(this.callShowBg, this), cc.fadeOut(0.8)));
        } else
            spr_bg.opacity = 255;

        for (let i = 0; i < this.root_box.children.length; ++i) {
            let nodeN = this.root_box.children[i];
            if (nodeN)
                nodeN.getComponent("NodeBox").setBoxFrame();
        }
    }

    callShowBg() {
        let spr_bg = this.node.getChildByName("node_bg").getChildByName("spr_bg1");
        spr_bg.opacity = 255;
    }

    //获取目标位置的砖块(同时找出要离开那一块砖)、同时判断道具拾取
    getAimPos_o(aimPos) {
        let data = {
            dieType: 1,
            aimPosY: aimPos.y,
            boxType: "box"
        }
        for (let i = 0; i < this.root_box.children.length; ++i) {
            let nodeN = this.root_box.children[i];

            //当前踩的砖块 显示脚丫
            if (Math.abs(aimPos.y - nodeN.y - cc.dataMgr.boxY) < 10 && cc.dataMgr.userData.useFootIdx > 0) {
                let nodeNJs = nodeN.getComponent("NodeBox");
                if (nodeNJs)
                    nodeNJs.leaveBox(aimPos.x - cc.dataMgr.userData.aimRoleX < 0);
            }

            //目标砖块
            let dis = cc.pDistance(nodeN.position, aimPos);
            if (dis < 10) {
                //判断是否为障碍物
                let nodeNJs = nodeN.getComponent("NodeBox");
                if (nodeNJs) {
                    let boxType = nodeNJs._boxType;
                    if (boxType == "block")
                        data.dieType = 2;
                    else {
                        data.dieType = 0;
                        nodeNJs.touchBox();
                    }
                    data.boxType = boxType;
                }
                data.aimPosY = nodeN.y;
            }
        }
        return data;
    }

    //开局使用加速道具 和 减速道具等
    usePropSpeedOrCut() {
        //加速道具
        if (cc.dataMgr.userData.propSpeedNum > 0) {
            cc.dataMgr.userData.propSpeedNum -= 1;
            let numS = parseInt(Math.random() * 40 + 20);
            cc.dataMgr.userData.speedNum = numS;
        }

        //减速道具
        if (cc.dataMgr.userData.propCutNum > 0) {
            cc.dataMgr.userData.propCutNum -= 1;
            cc.dataMgr.userData.cameraSpeedY = cc.dataMgr.userData.baseSpeedY * (1 - Math.random() * 0.8);
            this.node.runAction(cc.sequence(cc.delayTime(Math.random() * 10 + 10), cc.callFunc(this.callCameraSpeedY, this)));
            this.node.getChildByName("node_hint").getComponent("NodeHint").showHint("speedBegin");
            this.node.getChildByName("node_hint").getComponent("NodeHint").showHint("cut");
        }
        //console.log("-- speedNum:" + cc.dataMgr.userData.speedNum + " -- " + cc.dataMgr.userData.cameraSpeedY);
    }

    callCameraSpeedY() {
        cc.dataMgr.userData.cameraSpeedY = cc.dataMgr.userData.baseSpeedY;
        this.node.getChildByName("node_hint").getComponent("NodeHint").showHint("cutEnd");
    }

    pauseGame(isPause) {
        if (isPause) {

        } else {

        }
        cc.dataMgr.pauseGame = isPause;
    }

    //获取精灵图片
    getGameFrame_sf(name) {
        let sf = this.atlas_game.getSpriteFrame(name);
        if (!sf)
            sf = this.atlas_game.getSpriteFrame("box1");
        return sf;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "") {}
        }
    }

    lateUpdate(dt) {
        if (cc.dataMgr.userData.onGaming) {
            //相机的位置 和 角色位置的差值
            let suprX = cc.dataMgr.userData.aimRoleX - this.node_camera.x
            let suprY = (cc.dataMgr.userData.aimRoleY + 2 * cc.dataMgr.boxY) - this.node_camera.y;
            if (!cc.dataMgr.userData.pauseGame) {
                let moveX = dt * cc.dataMgr.userData.cameraSpeedX;
                if (moveX > Math.abs(suprX))
                    moveX = Math.abs(suprX);
                else {
                    let aimMoveX = dt * Math.abs(suprX) / cc.dataMgr.userData.jumpTime;
                    moveX += aimMoveX / 4;
                }

                let moveY = dt * cc.dataMgr.userData.cameraSpeedY;
                if (suprY > 0) {
                    let aimMoveY = dt * suprY / cc.dataMgr.userData.jumpTime;
                    moveY += aimMoveY / 4;
                }

                let aimX = this.node_camera.x + (suprX > 0 ? 1 : -1) * moveX;
                let aimY = this.node_camera.y + moveY;
                this.node_camera.position = cc.v2(aimX, aimY);
            }

            //判断 方块是否过界
            let posCamera = this.node_camera.y;
            for (let i = 0; i < this.root_box.children.length; ++i) {
                let nodeN = this.root_box.children[i];
                if (nodeN.y + cc.dataMgr.userData.dropPosY < posCamera) {
                    nodeN.getComponent("NodeBox").toDie();
                }
            }
            this.node_streak.position = cc.v2(this.node_role.x, this.node_role.y + 80);
        }
    }

    //------ 微信子域游戏内所有操作 ------

    //初始化子域信息
    initSubCanvas() {
        this.tex = new cc.Texture2D();
        if (CC_WECHATGAME) {
            console.log("-- WECHAT Game.js initSubCanvas --");
            window.sharedCanvas.width = 720;
            window.sharedCanvas.height = 1280;

            this.subPostMessage("gameBegin");
        }
    }

    updataSubCanvas() {
        if (CC_WECHATGAME) {
            //console.log("-- WECHAT Game.js updataSubCanvas --");
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.subCanvas.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.tex);
        }
    }

    //这里type: gameBegin(游戏开始请求好友数据)、nextBeyond(将要超越的好友)
    subPostMessage(type) {
        if (CC_WECHATGAME) {
            console.log("-- WECHAT Game.js subPostMessage --" + type);
            if (type == "submit") {
                window.wx.postMessage({
                    messageType: 2,
                    MAIN_MENU_NUM: "user_best_score",
                    myScore: cc.dataMgr.userData.countJump
                });
            } else if (type == "gameBegin") {
                window.wx.postMessage({
                    messageType: 6,
                    MAIN_MENU_NUM: "user_best_score",
                    myScore: cc.dataMgr.userData.countJump
                });
            } else if (type == "nextBeyond") {
                console.log("-- nextBeyond --" + type);
                window.wx.postMessage({
                    messageType: 8,
                    MAIN_MENU_NUM: "user_best_score",
                    myScore: cc.dataMgr.userData.countJump
                });
                this.updataSubCanvas();
            }
        }
    }
}