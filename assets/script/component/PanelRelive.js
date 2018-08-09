const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelRelive extends cc.Component {

    @property(cc.Node)
    spr_circle = null;
    @property(cc.Node)
    lab_time = null;

    _timeCD = 6;
    _timeCount = 0;

    onLoad() {

    }

    showRelive() {
        this._timeCount = 6;
        this.spr_circle.stopAllActions();
        this.lab_time.stopAllActions();
        this.lab_time.getComponent(cc.Label).string = this._timeCount;
        this.spr_circle.runAction(this.myCircleTo_act(this._timeCD, 1));
        this.lab_time.runAction(cc.sequence(cc.repeat(cc.sequence(cc.delayTime(1), cc.callFunc(this.callChengNum, this)), 6), cc.delayTime(0.2), cc.callFunc(this.callEnd, this)));
    }

    //圆形cd:总时间、百分比(0~1)
    myCircleTo_act(timeT, aimRange) {
        let action = cc.delayTime(timeT);
        action.aimRange = aimRange;
        action.update = function (dt) {
            let node = action.getTarget();
            if (node) {
                node.getComponent(cc.Sprite).fillRange = (1 - dt);
            }
        };
        return action;
    }

    callChengNum() {
        this._timeCount--;
        if (this._timeCount < 0)
            this._timeCount = 0;
        this.lab_time.getComponent(cc.Label).string = this._timeCount;
    }

    callEnd() {
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs) {
            gameJs.showPanel("node_end");
        }
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "btn_relive") {
                //这里要复活了
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs) {
                    gameJs.initGame(true);
                }
            }
        }
    }
}