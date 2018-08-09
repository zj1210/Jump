const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelStore extends cc.Component {


    onLoad() {
        cc.audioMgr.init();
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "") {}
        }
    }
}