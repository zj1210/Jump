const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class PanelRandom extends cc.Component {
    @property(cc.Node)
    node_panBg = null;
    @property(cc.Node)
    node_point = null;

    @property(cc.Node)
    btn_share = null;
    @property(cc.Node) //引导提示
    lab_share = null;

    @property(cc.Node) //最后的提示获得。
    node_reward = null;
    @property(cc.Node)
    node_label = null;

    //转盘的奖励及 角度(所有判断都包含边界)
    _randData = [{
            rotaMax: 90,
            rotaMin: 30,
            rewardName: "cut30",
            prob: 0.2, //概率
        },
        {
            rotaMax: 150,
            rotaMin: 90,
            rewardName: "cut70",
            prob: 0.15, //概率
        },
        {
            rotaMax: 210,
            rotaMin: 150,
            rewardName: "foot",
            prob: 0.05, //概率
        },
        {
            rotaMax: 270,
            rotaMin: 210,
            rewardName: "speed100",
            prob: 0.15, //概率
        },
        {
            rotaMax: 330,
            rotaMin: 270,
            rewardName: "speed50",
            prob: 0.4, //概率
        },
        {
            rotaMax: 30,
            rotaMin: 330,
            rewardName: "streak",
            prob: 0.05, //概率
        },
    ]

    _freeReward = ["streak", "cut70", "speed100"];

    _cdTime = 300; //冷却时间为 五分钟

    _rewardName = null;

    onLoad() {
        //console.log("--- onLoad PanelRandom ---");
        //this.node.active = false;
    }

    start() {
        this.node_reward.active = false;
    }

    //初始化界面
    initRand() {
        console.log("--- initRand ---" + cc.dataMgr.isShowShare);

        //是否显示分享引导
        this.node.active = true;
        this.btn_share.active = cc.dataMgr.isShowShare;
        this.lab_share.active = cc.dataMgr.isShowShare;
        this.node.getChildByName("anniu_zhuyie").x = (cc.dataMgr.isShowShare ? 100 : 0);
        this.btn_share.x = (cc.dataMgr.isShowShare ? -100 : 0);
        this.lab_share.x = -100;

        if (cc.dataMgr.haveProp.freeTimes > 0 || cc.dataMgr.haveProp.rewardTimes > 0) {
            this.node_point.getComponent(cc.Button).interactable = true;
            this.node_point.getChildByName("lab_title").getComponent(cc.Label).string = "点击抽奖";
            this.node_point.getChildByName("lab_num").getComponent(cc.Label).string = ("x" + cc.dataMgr.haveProp.freeTimes);
        } else if (cc.dataMgr.getTimeSecond_i() >= cc.dataMgr.haveProp.adCDBegin + this._cdTime) {
            //广告接口暂时 不用
            this.node_point.getComponent(cc.Button).interactable = true;
            //this.node_point.getComponent(cc.Button).interactable = false;
            this.node_point.getChildByName("lab_title").getComponent(cc.Label).string = "观看视频\n立即抽奖";
            this.node_point.getChildByName("lab_num").getComponent(cc.Label).string = "";
        } else {
            //这里是广告倒计时
            this.node_point.getComponent(cc.Button).interactable = false;

            let nextTime = this.getNextADTime_i();
            this.node_point.getChildByName("lab_title").getComponent(cc.Label).string = "下次观看";
            this.node_point.getChildByName("lab_num").getComponent(cc.Label).string = nextTime;
            if (nextTime > 0) {
                this.node_point.stopAllActions();

                this.node_point.runAction(cc.sequence(cc.repeat(cc.sequence(cc.delayTime(1), cc.callFunc(this.refreshTime, this)), nextTime), cc.callFunc(this.initRand, this)));
            } else {
                this.node_point.stopAllActions();
                this.node_point.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(this.initRand, this)));
            }
        }
    }

    refreshTime() {
        let nextTime = this.getNextADTime_i();
        if (nextTime <= 0) {
            this.node_point.stopAllActions();
            this.initRand();
        } else {
            this.node_point.getChildByName("lab_title").getComponent(cc.Label).string = "下次观看";
            this.node_point.getChildByName("lab_num").getComponent(cc.Label).string = nextTime;
        }
    }

    getNextADTime_i() {
        return -cc.dataMgr.getTimeSecond_i() + cc.dataMgr.haveProp.adCDBegin + this._cdTime;
    }

    //开始转转盘
    randBegin() {
        //确定奖励那个东西
        if (cc.dataMgr.haveProp.freeTimes > 0) {
            if (cc.dataMgr.haveProp.freeTimes - 1 >= this._freeReward.length)
                this._rewardName = "speed50";
            else
                this._rewardName = this._freeReward[cc.dataMgr.haveProp.freeTimes - 1];

        } else if (cc.dataMgr.haveProp.rewardTimes > 0) {
            this._rewardName = "speed50";
            let randNum = Math.random();
            let addProb = 0;
            for (let i = 0; i < this._randData.length; ++i) {
                let data = this._randData[i];
                addProb += data.prob;
                if (randNum <= addProb) {
                    this._rewardName = data.rewardName;
                    break;
                }
            }
        }

        let aimAngle = this.getAimAngle_i();
        let rotaTo = cc.rotateTo(6.2 + Math.random(), 720 + 720 + 720 + aimAngle);
        rotaTo.easing(cc.easeElasticInOut(4));
        this.node_panBg.runAction(cc.sequence(rotaTo, cc.delayTime(0.4), cc.callFunc(this.randEnd, this)));
    }

    //转盘结束奖励商品
    randEnd() {
        console.log("--- randEnd ---" + this._rewardName);
        //时间改变
        if (cc.dataMgr.haveProp.freeTimes > 0) {
            cc.dataMgr.haveProp.freeTimes--;
        } else if (cc.dataMgr.haveProp.rewardTimes > 0) {
            cc.dataMgr.haveProp.rewardTimes--;
        }
        cc.dataMgr.haveProp.adCDBegin = cc.dataMgr.getTimeSecond_i();

        let rewardStr = "未知。";
        let numStr = "";
        if (this._rewardName == "cut30") {
            cc.dataMgr.haveProp.haveCut.push(0.7);
            rewardStr = "开局阶梯下坠减速";
            numStr = "30%x3";
        } else if (this._rewardName == "cut70") {
            //减速70%存入0.3 剩余速度为0.3
            cc.dataMgr.haveProp.haveCut.push(0.3);
            rewardStr = "开局阶梯下坠减速";
            numStr = "70%x3";
        } else if (this._rewardName == "foot") {
            //存入脚印下标
            cc.dataMgr.haveProp.haveFoot.push(0);
            rewardStr = "脚印";
            numStr = "12小时";
        } else if (this._rewardName == "speed100") {
            cc.dataMgr.haveProp.haveSpeed.push(100);
            rewardStr = "开局冲刺";
            numStr = "100阶x3";
        } else if (this._rewardName == "speed50") {
            cc.dataMgr.haveProp.haveSpeed.push(50);
            rewardStr = "开局冲刺";
            numStr = "50阶x3";
        } else if (this._rewardName == "streak") {
            cc.dataMgr.haveProp.haveStreak.push(0);
            rewardStr = "动态光效";
            numStr = "12小时";
        }
        cc.dataMgr.saveData();

        this.node_reward.active = true;
        this.node_label.scale = 2.4;
        this.node_label.getChildByName("lab_reward").getComponent(cc.Label).string = rewardStr;
        this.node_label.getChildByName("lab_num").getComponent(cc.Label).string = numStr;
        this.node_label.runAction(cc.sequence(cc.fadeIn(0.2), cc.scaleTo(0.3, 0.9), cc.scaleTo(0.1, 1)));
        this.scheduleOnce(this.initRand, 0.8);
    }

    getAimAngle_i() {
        let aimAngle = 0;
        for (let i = 0; i < this._randData.length; ++i) {
            let data = this._randData[i];
            if (this._rewardName == data.rewardName) {
                aimAngle = Math.random() * 60 + data.rotaMin;
                if (aimAngle > 360)
                    aimAngle -= 360;
                break;
            }
        }
        return aimAngle;
    }

    onClickBtn(event, customeData) {
        if (event.target) {
            cc.audioMgr.playEffect("btn_click");
            let btnN = event.target.name;
            if (btnN == "anniu_zhuyie") {
                this.node.active = false;
                cc.find("Canvas/node_start").active = true;
                //手指显示
                let startJs = cc.find("Canvas/node_start").getComponent("PanelStart");
                if (startJs)
                    startJs.refreshStart();
            } else if (btnN == "anniu_weixin") {
                this.shareFriend();
            } else if (btnN == "zp01") {
                event.target.getComponent(cc.Button).interactable = false;
                if (cc.dataMgr.haveProp.freeTimes > 0 || cc.dataMgr.haveProp.rewardTimes > 0)
                    this.randBegin();
                else
                    this.initRand();
            } else if (btnN == "spr_bg") {
                this.node_reward.active = false;
            }
        }
    }

    //分享给好友
    shareFriend() {
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                title: "我在这里，等你来。--境之边缘",
                imageUrl: cc.dataMgr.imageUrl.urlFriend,
                query: "otherID=" + cc.dataMgr.openid,
                success: (res) => {
                    cc.dataMgr.shareSuccess("startAd");
                }
            });
        } else {
            //console.log("-- Not is wechatGame Start --");
            cc.dataMgr.shareSuccess("startAd");
        }
    }
}