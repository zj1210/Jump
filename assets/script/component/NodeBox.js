const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class NodeBox extends cc.Component {
    @property(cc.Node)
    spr_box = null;
    @property(cc.Node) //障碍物的下一级方块
    spr_block = null;
    @property(cc.Node) //道具
    spr_prop = null;

    _footY = -4; //脚印的偏移量
    _propY = -20; //障碍物、道具 的偏移量

    _blockMaxNum = 5; //障碍物当前的最大个数

    _isAlive = true;
    _boxType = null; //有三个值:box、prop(道具)、"block"

    _colorBegin = null;

    onLoad() {

    }

    initBox(countBox, aimPos, isLeft, boxType) {
        //console.log("-- initBox:" + countBox + " -- " + aimPos.x + " -- " + aimPos.y);
        this._isAlive = true;
        this.node.stopAllActions();
        this.node.setLocalZOrder(6000 - cc.dataMgr.userData.countBox);
        if (countBox > 5) {
            this.node.setPosition(cc.v2(aimPos.x, aimPos.y + cc.dataMgr.boxY * 2));
            this.node.runAction(cc.fadeIn(0.15));
            this.node.runAction(cc.moveTo(0.2, aimPos));
        } else {
            this.node.setPosition(aimPos);
            //为了无缝衔接 第一个为 node_start 中的台阶 游戏中第一个不显示
            if (countBox != 1)
                this.node.runAction(cc.fadeIn(0.15));
        }

        //显示障碍或道具
        this._boxType = boxType;
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs) {
            if (this._boxType == "prop") {
                this.spr_block.active = false;
                this.spr_prop.active = true;

                this.spr_prop.getComponent(cc.Sprite).spriteFrame = gameJs.getGameFrame_sf("daoju_zuanshi");
                this.spr_prop.y = this._propY;
            } else if (this._boxType == "block") {
                this.spr_block.active = true;
                this.spr_prop.active = true;

                let randNum = parseInt(Math.random() * this._blockMaxNum) + 1;
                let blockName = "zhangai0" + randNum;
                this.spr_prop.getComponent(cc.Sprite).spriteFrame = gameJs.getGameFrame_sf(blockName);
                this.spr_prop.y = this._propY;

                this.spr_block.setPosition(cc.v2((isLeft ? -1 : 1) * cc.dataMgr.boxX, cc.dataMgr.boxY));
                this.spr_block.getComponent(cc.Sprite).spriteFrame = gameJs.getGameFrame_sf(cc.dataMgr.userData.boxName);

                this.spr_prop.scale = 0;
                this.spr_prop.runAction(cc.sequence(cc.delayTime(0.2), cc.scaleTo(0.2, 1)));

                this._colorBegin = this.spr_box.color;
                this.spr_box.color = cc.color(this._colorBegin.r * 0.72, this._colorBegin.g * 0.72, this._colorBegin.b * 0.72, 255);
            } else {
                this.spr_block.active = false;
                this.spr_prop.active = false;
            }
            let boxName = cc.dataMgr.userData.boxName;
            if (countBox == 1)
                boxName = cc.dataMgr.boxName[cc.dataMgr.userData.mainBgIdx];
            this.spr_box.getComponent(cc.Sprite).spriteFrame = gameJs.getGameFrame_sf(boxName);

            //触发 生成加速道具
            if (countBox == cc.dataMgr.userData.nextSpeedPos) {
                cc.dataMgr.userData.nextSpeedPos += (parseInt(Math.random() * cc.dataMgr.userData.changeNum) + 10);
                if (this._boxType == "box") {
                    this._boxType = "speed";
                    this.spr_prop.active = true;
                    this.spr_prop.getComponent(cc.Sprite).spriteFrame = gameJs.getGameFrame_sf("daoju_speed");
                    this.spr_prop.y = this._propY;
                }
            } else if (countBox - cc.dataMgr.userData.nextSpeedPos > cc.dataMgr.userData.changeNum) {
                cc.dataMgr.userData.nextSpeedPos = countBox + 12;
            }
        }
    }

    setBoxFrame() {
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs && this._isAlive) {
            if (this.spr_block.active)
                this.spr_block.getComponent(cc.Sprite).spriteFrame = gameJs.getGameFrame_sf(cc.dataMgr.userData.boxName);
            this.spr_box.getComponent(cc.Sprite).spriteFrame = gameJs.getGameFrame_sf(cc.dataMgr.userData.boxName);
        }
    }

    //角色向左边跳的
    leaveBox(isLeft) {
        //console.log("--- leaveBox ---" + isLeft);
        if (cc.dataMgr.userData.useFootName && this._boxType != "block") {
            this.spr_prop.active = true;
            this.spr_prop.scaleX = (isLeft ? -1 : 1);
            let gameJs = cc.find("Canvas").getComponent("Game");
            if (gameJs)
                this.spr_prop.getComponent(cc.Sprite).spriteFrame = gameJs.getGameFrame_sf(cc.dataMgr.userData.useFootName);
            this.spr_prop.y = this._footY;
        }
    }

    leaveFrist() {
        this.node.active = true;
        this.node.opacity = 255;
        this.spr_box.opacity = 255;
        //this.node.runAction(cc.fadeIn(0.15));
    }

    //角色碰到 砖块了
    touchBox() {
        //todo 第一个砖块消失了。。。
        this.node.opacity = 255;
        if (this._boxType == "prop") {
            ++cc.dataMgr.userData.propGreenNum;
            //cc.audioMgr.playEffect("prop_score");
            this.spr_prop.active = false;
        } else if (this._boxType == "speed") {
            let num = parseInt(Math.random() * 10 + 10);
            if (cc.dataMgr.userData.speedNum < num)
                cc.dataMgr.userData.speedNum = num;
            this.spr_prop.active = false;

            let node_hint = cc.find("Canvas/node_hint");
            if (node_hint && node_hint.getComponent("NodeHint")) {
                node_hint.getComponent("NodeHint").showHint("speed");
            }
        }
    }

    toDie() {
        if (this._isAlive) {
            this._isAlive = false;
            this.node.stopAllActions();

            //判断角色在不在这个方块上如果在通知角色死亡
            let dis = cc.pDistance(this.node.position, cc.v2(cc.dataMgr.userData.aimRoleX, cc.dataMgr.userData.aimRoleY));
            if (dis < 10) {
                //设置角色的死亡方式
                cc.dataMgr.userData.roleDieType = 3;
                cc.dataMgr.userData.onGaming = false;
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs) {
                    gameJs.node_role.getComponent("NodeRole").toDie();
                }
            }

            let moveBy = cc.moveBy(1.2, cc.v2(0, -420));
            moveBy.easing(cc.easeIn(1.2));
            this.node.runAction(cc.fadeOut(1.2));
            this.node.runAction(cc.sequence(moveBy, cc.removeSelf(), cc.callFunc(this.callDestory, this)));

            //溶解
            this.spr_box.getComponent("EDissolve").useDissolve();
            if (this.spr_block.active)
                this.spr_block.getComponent("EDissolve").useDissolve();
        }
    }

    callDestory() {
        this.node.destroy();
    }

    killBox() {
        this._isAlive = false;
        this.node.runAction(cc.sequence(cc.removeSelf(), cc.callFunc(this.callDestory, this)));
    }
}