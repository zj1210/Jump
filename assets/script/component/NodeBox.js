const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class NodeBox extends cc.Component {
    @property(cc.Node) //障碍物的下一级方块
    spr_block = null;
    @property(cc.Node) //道具
    spr_prop = null;

    _greenY = -4; //绿色菱型偏移量
    _block1Y = -23; //钉子偏移量
    _block2Y = -10; //钉子偏移量

    _isAlive = true;
    _boxType = null; //有三个值:box、prop(道具)、"block"

    onLoad() {

    }

    initBox(countBox, aimPos, isLeft, boxType) {
        //console.log("-- countBox:" + countBox + " -- " + isLeft + " -- " + boxType);
        this._isAlive = true;
        this.node.stopAllActions();
        this.node.setLocalZOrder(6000 - cc.dataMgr.userData.countBox);
        if (countBox > 5) {
            this.node.setPosition(cc.v2(aimPos.x, aimPos.y + cc.dataMgr.boxY * 2));
            this.node.runAction(cc.fadeIn(0.15));
            this.node.runAction(cc.moveTo(0.2, aimPos));
        } else {
            this.node.setPosition(aimPos);
        }

        //显示障碍或道具
        this._boxType = boxType;
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs) {
            if (this._boxType == "prop") {
                this.spr_block.active = false;
                this.spr_prop.active = true;

                this.spr_prop.getComponent(cc.Sprite).spriteFrame = gameJs.getGameFrame_sf("prop_green");
                this.spr_prop.y = this._greenY;
            } else if (this._boxType == "block") {
                this.spr_block.active = true;
                this.spr_prop.active = true;

                let randNum = Math.random();
                let blockName = (randNum > 0.5 ? "prop_block1" : "prop_block2")
                this.spr_prop.getComponent(cc.Sprite).spriteFrame = gameJs.getGameFrame_sf(blockName);
                this.spr_prop.y = (randNum > 0.5 ? this._block1Y : this._block2Y);

                this.spr_block.setPosition(cc.v2((isLeft ? -1 : 1) * cc.dataMgr.boxX, cc.dataMgr.boxY));
            } else {
                this.spr_block.active = false;
                this.spr_prop.active = false;
            }
        }
    }

    //角色碰到 道具
    touchProp() {
        this.spr_prop.runAction(cc.sequence(cc.delayTime(0.1), cc.hide()));
        
        cc.audioMgr.playEffect("prop_score");
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

            let moveBy = cc.moveBy(0.8, cc.v2(0, -420));
            moveBy.easing(cc.easeIn(0.8));
            this.node.runAction(cc.fadeOut(0.6));
            this.node.runAction(cc.sequence(moveBy, cc.removeSelf(), cc.callFunc(this.callDestory, this)));
        }
    }

    callDestory() {
        this.node.destroy();
    }

    killBox() {
        this.node.runAction(cc.sequence(cc.removeSelf(), cc.callFunc(this.callDestory, this)));
    }
}