const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class NodeHint extends cc.Component {
    //控件的透明度 都设置为0 用fadeIn等操作显示

    @property(cc.Node)
    node_speed = null;
    @property(cc.Node)
    node_cut = null;

    onLoad() {
        this.node_cut.active = false;
        this.node_speed.active = false;
        this.node.active = false;
    }

    //speedBegin 开局加速 speed 冲刺 cut 减速
    showHint(type) {
        //console.log("--- showHint --- " + type);
        this.node.active = true;
        if (type == "speedBegin") {
            //提示开局冲刺
            this.node_speed.active = true;
            this.node_speed.getChildByName("lab_title").getComponent(cc.Label).string = "开局冲刺x";
            this.node_speed.getChildByName("lab_speed").getComponent(cc.Label).string = cc.dataMgr.userData.speedNum;
        } else if (type == "speed") {
            this.node_speed.active = true;
            this.node_speed.getChildByName("lab_title").getComponent(cc.Label).string = "加速冲刺x";
            this.node_speed.getChildByName("lab_speed").getComponent(cc.Label).string = cc.dataMgr.userData.speedNum;
        } else if (type == "speedEnd") {
            this.node_speed.stopAllActions();
            this.node_speed.active = false;
        } else if (type == "cut") {
            this.node_cut.active = true;
            this.node_cut.runAction(cc.fadeIn(0.4));
        } else if (type == "cutEnd") {
            this.node_cut.stopAllActions();
            this.node_cut.active = false;
        }
    }

    changeNum(type) {
        if (type == "speed") {
            this.node_speed.getChildByName("lab_speed").getComponent(cc.Label).string = cc.dataMgr.userData.speedNum;
        }
    }

    hideHint() {
        this.node.active = false;
    }
}