import DataMgr from 'DataMgr';
import AudioMgr from 'AudioMgr';
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

    //显示微信子域排行
    @property(cc.Node)
    node_start = null;

    _isInitGame = false; //游戏是否初始化完成(完成后点击就开始跳了)

    //根据时间变颜色 相关
    _countSecond = 0;
    _countTime = 0;

    onLoad() {
        console.log("--- Game onLoad ---");

        //这样加载在微信中报错了,查找原因,ES5 写法探究 Start 中写法是正确的
        // let DataMgr = require("DataMgr");
        // cc.dataMgr = new DataMgr();

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
                let touchPos = touch.getLocation();
                if (cc.dataMgr.userData.pauseGame)
                    return true;
                if (cc.dataMgr.userData.isReady && cc.dataMgr.userData.loadOver) {
                    cc.dataMgr.userData.isReady = false;
                    self.showGame();
                }
                //在游戏中 且 不在加速状态 才能自由选择前进方向。
                else if (cc.dataMgr.userData.onGaming && cc.dataMgr.userData.speedNum <= 0) {
                    self.jumpRole(touchPos.x < 360);
                } else if (self._isInitGame) {
                    //背景音乐(两处播放音乐 一处这里 一处 在开局冲刺时)
                    if (cc.dataMgr.userData.countJump == 0)
                        cc.audioMgr.playBg();
                    else
                        cc.audioMgr.resumeAll();

                    self._isInitGame = false;
                    cc.dataMgr.userData.onGaming = true;
                    self.jumpRole(touchPos.x < 360);
                    self.node_game.getChildByName("node_hint").active = false;

                    //开始跳跃之后 再隐藏主界面
                    self.node_start.active = false;
                    self.node_role.opacity = 255;
                }
                return true;
            },
            onTouchMoved: function (touch, event) {},
            onTouchEnded: function (touch, event) {}
        }, self.node);

        this.showStart();
    }

    showStart() {
        this._isInitGame = false;
        cc.dataMgr.userData.isReady = true;

        this.node_start.active = true;
        this.node_game.active = false;
    }

    showGame() {
        let animation = this.node_start.getComponent(cc.Animation);
        animation.play("start");
        //animation.on("end", this.onPlayAnimation, this);
        this.scheduleOnce(this.onPlayAnimation, 1.8);
        this.node_start.getComponent("PanelStart").hideStart();
    }

    //动画播放完成 initGame
    onPlayAnimation(type, state) {
        cc.audioMgr.pauseAll();
        this.initGame(false);
        cc.dataMgr.userData.isReady = false;
    }

    //这里是初始游戏,再点击就开始跳了(是否为复活)
    initGame(isRelive) {
        cc.audioMgr.pauseAll();
        cc.dataMgr.userData.onGaming = false;

        this.node_game.active = true;

        if (!isRelive) {
            //初始化数据
            cc.dataMgr.userData.lastBoxX = cc.dataMgr.boxX;
            cc.dataMgr.userData.lastBoxY = -cc.dataMgr.boxY;
            cc.dataMgr.userData.countBox = 0;

            cc.dataMgr.userData.gameBgIdx = 0;
            cc.dataMgr.userData.boxName = "box1";
            cc.dataMgr.userData.nextChangeTime = 12;
            cc.dataMgr.userData.nextChangeIdx = 0;
            cc.dataMgr.userData.cutSpeed = 1;

            cc.dataMgr.userData.aimRoleX = 0;
            cc.dataMgr.userData.aimRoleY = 0;
            cc.dataMgr.userData.roleDieType = 0;
            cc.dataMgr.userData.countJump = 0;

            cc.dataMgr.userData.reliveTimes = 0;
            cc.dataMgr.userData.isReliveDrop = true;

            if (cc.dataMgr.userData.shareDouble > 0) {
                cc.dataMgr.userData.reliveHp = cc.dataMgr.userData.reliveNum * 2 + cc.dataMgr.userData.baseHp;
                cc.dataMgr.userData.shareDouble--;
            } else
                cc.dataMgr.userData.reliveHp = cc.dataMgr.userData.baseHp + cc.dataMgr.userData.reliveNum;
            cc.dataMgr.userData.reliveNum = 0;

            //检查道具是否过期 并使用道具
            cc.dataMgr.checkProp();

            //暂时加的 设置上限为 30
            if (cc.dataMgr.userData.reliveHp > 30)
                cc.dataMgr.userData.reliveHp = 30;

            //保证角色在中心点下两个 方块高度
            //this.node_camera.position = cc.v2(0, 2 * cc.dataMgr.boxY);

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

            //开局自动使用道具 冲刺 减速 光效效果
            this.useProp();
            if (cc.dataMgr.userData.speedNum > 0) {
                this.scheduleOnce(this.callBeginSpeed, 1.2);
            } else {
                //标识初始化完成 再点击屏幕可以开始跳跃了
                this._isInitGame = true;
            }
        } else {
            //确定复活点目标位置Y
            let aimY = cc.dataMgr.userData.aimRoleY - cc.dataMgr.boxX;

            //这里是复活(有些数据不需要初始化)
            cc.dataMgr.userData.roleDieType = 0;
            ++cc.dataMgr.userData.reliveTimes;
            cc.dataMgr.userData.isReliveDrop = false;

            console.log("--- initGame relive ---" + aimY + " -- " + this.node_camera.y);
            console.log(cc.dataMgr.userData);

            //给角色找一个合理的位置
            let posBegin = cc.v2(0, 0);
            let minDis = cc.dataMgr.boxY * 6;
            for (let i = 0; i < this.root_box.children.length; ++i) {
                let nodeN = this.root_box.children[i];
                let nodeNJs = nodeN.getComponent("NodeBox");
                if (nodeN && nodeNJs) {
                    let disY = Math.abs(nodeN.y - aimY);
                    //console.log("-- findPos : " + disY + " -- " + minDis);
                    //这种是可以 跳上去的砖块
                    if (nodeNJs._boxType == "box" || nodeNJs._boxType == "prop") {
                        if (disY < minDis) {
                            posBegin = nodeN.position;
                            minDis = disY;
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
            //this.node_game.getChildByName("node_hint").active = true;
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
        //开始跳跃之后 再隐藏主界面
        this.node_start.active = false;
        this.node_role.opacity = 255;

        this.jumpRole(true);
        this._isInitGame = false;

        //背景音乐
        cc.audioMgr.playBg();
        cc.dataMgr.userData.onGaming = true;
    }

    showRelive() {
        // this.node_relive.active = true;
        // this.node_relive.getComponent("PanelRelive").showRelive();
        // cc.dataMgr.saveData();
        if (cc.dataMgr.userData.reliveHp > 1) {
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
        // if (cc.dataMgr.userData.countJump > 0 && cc.dataMgr.userData.countJump % cc.dataMgr.userData.changeNum == 0)
        //     this.changeToNextBg();
        //更改为根据时间变换颜色 在updata 中调用

        this.node_ui.getChildByName("lab_score").getComponent(cc.Label).string = ("得分：" + cc.dataMgr.userData.countJump);

        let aimY = cc.dataMgr.boxY + cc.dataMgr.userData.aimRoleY;
        let aimX = (isLeft ? -1 : 1) * cc.dataMgr.boxX + cc.dataMgr.userData.aimRoleX;

        this.node_role.stopAllActions();

        //获取目标点是否有 box 及其类型, 并矫正 X Y
        let data = this.getAimPos_o(cc.v2(aimX, aimY));
        aimX = data.aimPosX;
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
                cc.audioMgr.pauseAll();
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

        //console.log("aimPos-- " + cc.dataMgr.userData.aimRoleX + " -- " + cc.dataMgr.userData.aimRoleY);

        //判断角色复活后是否达到安全距离
        if (!cc.dataMgr.userData.isReliveDrop) {
            //console.log(this.node_camera.y + " -- " + cc.dataMgr.userData.aimRoleY);
            if (this.node_camera.y < cc.dataMgr.userData.aimRoleY)
                cc.dataMgr.userData.isReliveDrop = true;
        }

        //最多比当前角色在的台阶高 5阶
        if (cc.dataMgr.userData.lastBoxY - cc.dataMgr.userData.aimRoleY < 5 * cc.dataMgr.boxY)
            this.createBox(null);
        if (cc.dataMgr.userData.speedNum > 0)
            --cc.dataMgr.userData.speedNum;
    }

    //开局加速会停下来 其它不会
    autoJump() {
        if (cc.dataMgr.userData.speedNum > 0) {
            this.jumpRole(false);
            this.node.getChildByName("node_hint").getComponent("NodeHint").changeNum("speed");
        } else {
            this._isInitGame = this.node_game.getChildByName("node_hint").active;
            this.node.getChildByName("node_hint").getComponent("NodeHint").showHint("speedEnd");

            if (this._isInitGame) {
                cc.audioMgr.pauseAll();
                cc.dataMgr.userData.onGaming = false;
            } else {
                cc.dataMgr.userData.onGaming = true;
            }
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

            //颜色要根据时间 
            cc.dataMgr.changeToNextBg();
            // ++cc.dataMgr.userData.gameBgIdx;
            // if (cc.dataMgr.userData.gameBgIdx >= cc.dataMgr.boxName.length)
            //     cc.dataMgr.userData.gameBgIdx = 0;
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

        //所有柱子变色
        // for (let i = 0; i < this.root_box.children.length; ++i) {
        //     let nodeN = this.root_box.children[i];
        //     if (nodeN)
        //         nodeN.getComponent("NodeBox").setBoxFrame();
        // }
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
            aimPosX: aimPos.x,
            boxType: "box"
        }
        for (let i = 0; i < this.root_box.children.length; ++i) {
            let nodeN = this.root_box.children[i];

            //当前踩的砖块 显示脚丫
            if (Math.abs(aimPos.y - nodeN.y - cc.dataMgr.boxY) < 10 && cc.dataMgr.userData.useFootName) {
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
                data.aimPosX = nodeN.x;
            }
        }
        return data;
    }

    //开局使用加速道具 和 减速道具 光效效果等
    useProp() {
        //加速道具
        if (cc.dataMgr.userData.useSpeedNum > 0) {
            cc.dataMgr.userData.speedNum = cc.dataMgr.userData.useSpeedNum;
            cc.dataMgr.userData.useSpeedNum = 0;
        }
        //减速道具
        if (cc.dataMgr.userData.useCutNum > 0) {
            cc.dataMgr.userData.cutSpeed = cc.dataMgr.userData.useCutNum;
            cc.dataMgr.userData.useCutNum = 0;
            cc.dataMgr.userData.cameraSpeedY = cc.dataMgr.userData.baseSpeedY * cc.dataMgr.userData.cutSpeed;

            this.scheduleOnce(this.callCameraSpeedY, Math.random() * 8 + 12);
            this.node.getChildByName("node_hint").getComponent("NodeHint").showHint("speedBegin");
            this.node.getChildByName("node_hint").getComponent("NodeHint").showHint("cut");
        }
        //光效效果

        //console.log("-- speedNum:" + cc.dataMgr.userData.speedNum + " -- " + cc.dataMgr.userData.cameraSpeedY);
    }

    callCameraSpeedY() {
        cc.dataMgr.userData.cutSpeed = 1;
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
            sf = this.atlas_game.getSpriteFrame("zz01");
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
        //游戏中 和 复活达到安全距离可以下落
        if (cc.dataMgr.userData.onGaming && cc.dataMgr.userData.isReliveDrop) {
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
            this.node_streak.active = (cc.dataMgr.userData.speedNum > 0);
            this.node_streak.position = cc.v2(this.node_role.x, this.node_role.y + 48);
        }

        //统计变色相关
        if (cc.dataMgr.userData.onGaming) {
            this._countTime += dt;
            if (this._countTime >= 1) {
                this._countSecond++;
                this._countTime = 0;
            }
        }

        if (this._countSecond >= cc.dataMgr.userData.nextChangeTime) {
            console.log("-- countSecond -- " + this._countSecond + " -- " + this._countTime + " -- " + cc.dataMgr.userData.nextChangeTime);
            this.changeToNextBg();
            this._countSecond = 0;
        }
    }
}