const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class NodeRole extends cc.Component {
    //控件的透明度 都设置为0 用fadeIn等操作显示

    onLoad() {
        this.node.active = false;
    }

    //减速 冲刺等 提示
    showHint(type) {
        console.log("--- hint --- " + type);
        this.node.active = true;
        if (type == "speedBegin") {
            //提示开始开局冲刺
            let nodeN = this.node.getChildByName("lab_speed");
            nodeN.active = true;
            nodeN.getComponent(cc.Label).string = ("即将开始开局冲刺 x" + cc.dataMgr.userData.speedNum);
            nodeN.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.8, 1.2), cc.scaleTo(0.6, 1))));
        } else if (type == "speed") {
            let nodeN = this.node.getChildByName("lab_speed");
            nodeN.getComponent(cc.Label).string = ("开局冲刺 x" + cc.dataMgr.userData.speedNum);
        } else if (type == "speedEnd") {
            let nodeN = this.node.getChildByName("lab_speed");
            nodeN.stopAllActions();
            nodeN.active = false;
        } else if (type == "cut") {
            let nodeN = this.node.getChildByName("lab_cut");
            nodeN.active = true;
            nodeN.runAction(cc.fadeIn(0.4));
        } else if (type == "cutEnd") {
            let nodeN = this.node.getChildByName("lab_cut");
            nodeN.stopAllActions();
            nodeN.active = false;
        }
    }

    hideHint() {
        this.node.active = false;
    }
}