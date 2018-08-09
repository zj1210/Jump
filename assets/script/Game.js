const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class Game extends cc.Component {
    @property(cc.SpriteAtlas)
    atlas_game = null;

    @property(cc.Prefab) //预置box
    pre_box = null;

    @property(cc.Node) //主界面 提示界面
    node_panel = null;
    @property(cc.Node) //提示界面
    node_hint = null;

    @property(cc.Node) //游戏节点
    node_game = null;
    @property(cc.Node) //所有砖块的根节点
    root_box = null;
    @property(cc.Node) //角色
    node_role = null;
    @property(cc.Node)
    node_ui = null;
    @property(cc.Node) //相机
    node_camera = null;

    _isInitGame = false; //游戏是否初始化完成(完成后点击就开始跳了)

    onLoad() {
        console.log("--- Game onLoad ---");

        //TODO 这样加载在微信中报错了,查找原因,ES5 写法探究
        // let DataMgr = require("DataMgr");
        // cc.dataMgr = new DataMgr();

        cc.dataMgr = this.node.getComponent("DataMgr");
        //读取本地储存的 玩家闯关的信息
        cc.dataMgr.initData();

        cc.audioMgr = this.node.getComponent("AudioMgr");
        cc.audioMgr.init();
    }

    start() {
        let self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                let touchPos = touch.getLocation();
                if (cc.dataMgr.userData.pauseGame)
                    return true;
                if (cc.dataMgr.userData.gameReady) {
                    cc.dataMgr.userData.gameReady = false;
                    self.initGame(false);
                } else if (cc.dataMgr.userData.onGaming) {
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

        this.showPanel("node_main");
    }

    //这里是初始游戏,再点击就开始跳了(是否为复活)
    initGame(isRelive) {
        if (!isRelive) {
            //初始化数据
            cc.dataMgr.userData.onGaming = false;
            cc.dataMgr.userData.lastBoxX = cc.dataMgr.boxX;
            cc.dataMgr.userData.lastBoxY = -cc.dataMgr.boxY;
            cc.dataMgr.userData.countBox = 0;
            cc.dataMgr.userData.aimRoleX = 0;
            cc.dataMgr.userData.aimRoleY = 0;
            cc.dataMgr.userData.roleDieType = 0;
            cc.dataMgr.userData.countJump = 0;

            //保证角色在中心点下两个 方块高度
            this.node_camera.position = cc.v2(0, 2 * cc.dataMgr.boxY);

            console.log("--- initGame ---");
            console.log(cc.dataMgr.userData);

            for (let i = 0; i < this.root_box.children.length; ++i) {
                this.root_box.children[i].getComponent("NodeBox").killBox();
            }

            //界面及角色 显示
            this.hidePanel();
            this.node_game.active = true;
            this.node_game.getChildByName("node_hint").active = true;
            this.node_role.active = true;
            this.node_role.getComponent("NodeRole").initRole(null);

            this.node_ui.getChildByName("lab_score").active = true;
            this.node_ui.getChildByName("lab_score").getComponent(cc.Label).string = cc.dataMgr.userData.countJump;

            //初始化
            for (let i = 0; i < 6; ++i)
                this.createBox(null);

            //标识初始化完成 再点击屏幕可以开始跳跃了
            this._isInitGame = true;
        } else {
            //这里是复活(有些数据不需要初始化)
            cc.dataMgr.userData.onGaming = false;
            //cc.dataMgr.userData.lastBoxX = cc.dataMgr.boxX;
            //cc.dataMgr.userData.lastBoxY = -cc.dataMgr.boxY;
            //cc.dataMgr.userData.countBox = 0;
            //cc.dataMgr.userData.aimRoleX = 0;
            //cc.dataMgr.userData.aimRoleY = 0;
            cc.dataMgr.userData.roleDieType = 0;
            //cc.dataMgr.userData.countJump = 0;

            //保证角色在中心点下两个 方块高度
            //this.node_camera.position = cc.v2(0, 2 * cc.dataMgr.boxY);

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

            //如果这个位置上有 道具用来消除道具
            this.getAimPos_o(posBegin);

            //界面及角色 显示
            this.hidePanel();
            this.node_game.active = true;
            this.node_game.getChildByName("node_hint").active = true;
            this.node_role.active = true;
            this.node_role.getComponent("NodeRole").initRole(posBegin);

            this.node_ui.getChildByName("lab_score").active = true;
            this.node_ui.getChildByName("lab_score").getComponent(cc.Label).string = cc.dataMgr.userData.countJump;

            //补充台阶数
            let supr = parseInt((cc.dataMgr.userData.lastBoxY - posBegin.y) / cc.dataMgr.boxY);
            for (let i = 0; i < 5 - supr; ++i)
                this.createBox(null);

            console.log("-- 补 " + supr + " --R " + posBegin.y + " --B " + cc.dataMgr.userData.lastBoxY + " --C " + this.node_camera.y);

            //标识初始化完成 再点击屏幕可以开始跳跃了
            this._isInitGame = true;
        }
    }

    showPanel(nodeName) {
        for (let i = 0; i < this.node_panel.children.length; ++i)
            this.node_panel.children[i].active = false;

        let nodePanel = this.node_panel.getChildByName(nodeName);
        if (nodePanel) {
            nodePanel.active = true;
            if (nodeName == "node_main") {
                cc.dataMgr.userData.gameReady = true;

                this.node_game.active = false;

                let lab_begin = nodePanel.getChildByName("lab_begin");
                lab_begin.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.4, 1.2), cc.scaleTo(0.6, 1))));
            } else if (nodeName == "node_end") {
                cc.dataMgr.userData.gameReady = true;
                let lab_reBegin = nodePanel.getChildByName("lab_begin");
                lab_reBegin.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.4, 1.2), cc.scaleTo(0.6, 1))));

                //得分显示
                this.node_ui.getChildByName("lab_score").active = false;
                nodePanel.getChildByName("lab_score").getComponent(cc.Label).string = ("得分:" + cc.dataMgr.userData.countJump); //propGreenNum;
            } else if (nodeName == "node_relive") {
                nodePanel.getComponent("PanelRelive").showRelive();
            }
        }
    }

    hidePanel() {
        for (let i = 0; i < this.node_panel.children.length; ++i)
            this.node_panel.children[i].active = false;
    }

    //是否向左跳
    jumpRole(isLeft) {
        ++cc.dataMgr.userData.countJump;
        this.node_ui.getChildByName("lab_score").getComponent(cc.Label).string = cc.dataMgr.userData.countJump;

        let aimY = cc.dataMgr.boxY + cc.dataMgr.userData.aimRoleY;
        let aimX = (isLeft ? -1 : 1) * cc.dataMgr.boxX + cc.dataMgr.userData.aimRoleX;

        this.node_role.scaleX = (isLeft ? -1 : 1);

        //获取目标点是否有 box 及其类型, 并矫正Y
        let data = this.getAimPos_o(cc.v2(aimX, aimY));
        aimY = data.aimPosY;
        //落到空 box 上才有声音
        // if (data && data.boxType == "box")
        //     cc.audioMgr.playEffect("role_jump1");
        if (data.dieType > 0) {
            cc.dataMgr.userData.roleDieType = data.dieType;
            cc.dataMgr.userData.onGaming = false;
            let roleJs = this.node_role.getComponent("NodeRole");
            this.node_role.runAction(cc.sequence(cc.jumpTo(cc.dataMgr.userData.jumpTime, cc.v2(aimX, aimY), cc.dataMgr.boxY, 1), cc.callFunc(roleJs.toDie, roleJs)));
        } else {
            this.node_role.runAction(cc.jumpTo(cc.dataMgr.userData.jumpTime, cc.v2(aimX, aimY), cc.dataMgr.boxY, 1));
        }

        cc.dataMgr.userData.aimRoleX = aimX;
        cc.dataMgr.userData.aimRoleY = aimY;

        //最多比当前角色在的台阶高 5阶
        if (cc.dataMgr.userData.lastBoxY - cc.dataMgr.userData.aimRoleY < 5 * cc.dataMgr.boxY)
            this.createBox(null);
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

    getAimPos_o(aimPos) {
        let data = {
            dieType: 1,
            aimPosY: aimPos.y,
            boxType: "box"
        }
        for (let i = 0; i < this.root_box.children.length; ++i) {
            let nodeN = this.root_box.children[i];
            let dis = cc.pDistance(nodeN.position, aimPos);
            if (dis < 10) {
                //判断是否为障碍物
                let nodeNJs = nodeN.getComponent("NodeBox");
                if (nodeNJs) {
                    let boxType = nodeNJs._boxType;
                    if (boxType == "box")
                        data.dieType = 0;
                    else if (boxType == "prop") {
                        data.dieType = 0;
                        nodeNJs.touchProp();
                        ++cc.dataMgr.userData.propGreenNum;
                    } else
                        data.dieType = 2;
                    data.boxType = boxType;
                }
                data.aimPosY = nodeN.y;
                break;
            }
        }
        return data;
    }

    pauseGame(isPause) {
        if (isPause) {

        } else {

        }
        cc.dataMgr.pauseGame = isPause;
    }

    getGameFrame_sf(name) {
        let sf = this.atlas_game.getSpriteFrame(name);
        if (!sf)
            sf = this.atlas_game.getSpriteFrame("box");
        return sf;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "btn_home") {
                this.showPanel("node_main");
            }
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
        }
    }
}