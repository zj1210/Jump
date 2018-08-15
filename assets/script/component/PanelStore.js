const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelStore extends cc.Component {

    @property(cc.Node)
    node_content = null;
    @property(cc.Node)
    lab_buy = null;
    @property(cc.Node)
    spr_goumai = null;

    _firstPosX = -512; //界面中摆放的第一个 player 的位置
    _playerDis = 256; //两个player 之间的距离

    _showPlayerD = null; //显示角色的信息
    _showPlayerIdx = 0; //当前显示的 (最大的那个 角色的下标)
    _colorBegin = null; //初始颜色
    _onMoving = false;

    onLoad() {
        this._onMoving = false;
        this._colorBegin = this.node_content.children[0].color;
        this._firstPosX = this.node_content.children[0].x;
        this.node.getChildByName("prop").getChildByName("prop_Label").getComponent(cc.Label).string = cc.dataMgr.userData.propGreenNum;
        this.checkContentPos();

        //背景颜色
        let frame = cc.dataMgr.getBgFrame_sf(null);
        if (frame) {
            let spr_bg = this.node.getChildByName("game_bg");
            spr_bg.getComponent(cc.Sprite).spriteFrame = frame;
        }
    }

    //检查content 位置使至少一个角色是亮的(每次滑动后都调用),并确定 _playerIdx;
    checkContentPos() {
        let num = this.node_content.x % this._playerDis;
        //console.log("-- checkPos: " + num + " -- " + this.node_content.x);
        if (!this._onMoving) {
            this._onMoving = true;
            this.node_content.stopAllActions();
            let aimPosY = this.node_content.x - num + (Math.abs(num) > this._playerDis / 2 ? this._playerDis : 0) * (num > 0 ? 1 : -1);
            this.node_content.runAction(cc.sequence(cc.moveTo(0.1, cc.v2(aimPosY, this.node_content.y)), cc.callFunc(this.callMoveEnd, this)));
        }
    }

    callMoveEnd() {
        this._onMoving = false;
        //确定 那个是亮的
        for (let i = 0; i < this.node_content.children.length; ++i) {
            let nodeN = this.node_content.children[i];
            if (nodeN.scale > 0.9 * 2) {
                this._showPlayerIdx = i;
                break;
            }
        }
        //根据显示的更改钱数
        if (this._showPlayerIdx < cc.dataMgr.playerData.length) {
            this._showPlayerD = cc.dataMgr.playerData[this._showPlayerIdx];
            this.lab_buy.getComponent(cc.Label).string = this._showPlayerD.price;
            this.spr_goumai.active = true;
        } else {
            this._showPlayerD = null;
            this.lab_buy.getComponent(cc.Label).string = 0;
            this.spr_goumai.active = false;
        }
    }

    //根据 content 距中心点的位置设置 大小
    resetScale() {
        let centerX = -this.node_content.x;
        for (let i = 0; i < this.node_content.children.length; ++i) {
            let nodeN = this.node_content.children[i];
            let scale = 1 - (Math.abs(centerX - nodeN.x) / (this._playerDis * 2));
            if (scale < 0.7)
                scale = 0.7;
            else if (scale > 1)
                scale = 1;
            nodeN.scale = scale * 2;
            if (scale < 0.9)
                nodeN.color = cc.color(this._colorBegin.r * 0.5, this._colorBegin.g * 0.5, this._colorBegin.b * 0.5, 255);
            else
                nodeN.color = this._colorBegin;
        }
    }

    scrollEvent(sender, event) {
        switch (event) {
            case 0:
                //console.log("Scroll to Top");
                break;
            case 1:
                //console.log("Scroll to Bottom");
                break;
            case 2:
                //console.log("Scroll to Left");
                break;
            case 3:
                //console.log("Scroll to Right");
                break;
            case 4:
                //console.log("Scrolling");
                break;
            case 5:
                //console.log("Bounce Top");
                break;
            case 6:
                //console.log("Bounce bottom");
                break;
            case 7:
                //console.log("Bounce left");
                break;
            case 8:
                //console.log("Bounce right");
                break;
            case 9:
                //console.log("Auto scroll ended");
                this.checkContentPos();
                break;
        }
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_zhuyie") {
                cc.dataMgr.saveData();
                cc.director.loadScene("start");
            } else if (btnN == "kuangti_tongyong01") {
                console.log("--- 购买 ---" + this._onMoving);
                if (!this._onMoving && this._showPlayerD) {

                }
            }
        }
    }

    update(dt) {
        this.resetScale();
    }
}