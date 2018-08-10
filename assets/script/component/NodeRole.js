const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class NodeRole extends cc.Component {
    @property(cc.Prefab)
    pre_particle = null;

    @property(cc.Node)
    spr_role = null;
    @property(cc.Node)
    node_particle = null;

    _isAlive = true;

    onLoad() {

    }

    initRole(posBegin) {
        this._isAlive = true;
        this.node.setLocalZOrder(1);
        this.node.stopAllActions();
        if (!posBegin)
            posBegin = cc.v2(0, 0);
        this.node.setPosition(posBegin);
        this.node.runAction(cc.fadeIn(0.1));

        this.spr_role.active = true;
        for (let i = 0; i < this.node_particle.children.length; ++i) {
            let nodeN = this.node_particle.children[i];
            if (cc.isValid(nodeN))
                nodeN.destroy();
        }
        this.node_particle.removeAllChildren(true);
    }

    toDie() {
        if (this._isAlive) {
            this._isAlive = false;
            this.node.stopAllActions();

            cc.dataMgr.userData.onGaming = false;

            //除了下坠 和 跳空 其它的立即显示 结束
            if (cc.dataMgr.userData.roleDieType == 3) {
                cc.audioMgr.playEffect("prop_empy");

                this.node.runAction(cc.fadeOut(1.2));
                let moveBy = cc.moveBy(1.2, cc.v2(0, -360));
                moveBy.easing(cc.easeIn(1.2));
                this.node.runAction(cc.sequence(moveBy, cc.callFunc(this.callEnd, this)));
            } else if (cc.dataMgr.userData.roleDieType == 1) {
                cc.audioMgr.playEffect("prop_empy");

                this.node.setLocalZOrder(-1);
                this.node.runAction(cc.fadeOut(0.3));
                let moveBy = cc.moveBy(0.3, cc.v2(0, -3 * cc.dataMgr.boxY));
                moveBy.easing(cc.easeIn(0.6));
                this.node.runAction(cc.sequence(moveBy, cc.callFunc(this.callEnd, this)));
            } else {
                this.callEnd();
                cc.audioMgr.playEffect("prop_block");
                let parN = cc.instantiate(this.pre_particle);
                this.node_particle.addChild(parN);
            }
        }
    }

    callEnd() {
        this.spr_role.active = false;
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs) {
            gameJs.showRelive();
        }
    }
}