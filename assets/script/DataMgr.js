const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class DataMgr extends cc.Component {
    boxX = 72; //砖块平铺时 据上一个砖块位置的X 和 Y
    boxY = 72;

    openid = null;
    version = "20180831"; //不同的 version 版本会清空本地信息

    shareTicket = null;//群分享标签

    //服务器配置信息
    isShowShare = false; //显示引导分享
    isShowAd = false;
    isPopAd = false;//弹出广告
    popTime = 300;//弹出间隔时间
    shareQunRand = true;//是否分享群就立即抽奖
    reliveAdNum = 10;//第几次复活是弹出广告复活
    showAdType = null;//再那个界面 看的广告需要返回

    imageUrl = {
        urlGroup: "https://bpw.blyule.com/wxJump/res/jumpShare1.jpg",
        urlFriend: "https://bpw.blyule.com/wxJump/res/jumpShare2.jpg",
        urlMore: "https://bpw.blyule.com/wxJump/res/jumpShare3.jpg",
        urlXml: "https://bpw.blyule.com/wxJump/res/share.xml",
        urlJson: "https://bpw.blyule.com/wxJump/res/jump.json",
        random: "https://bpw.blyule.com/wxJump/res/end.jpg",
        sound: "https://bpw.blyule.com/wxJump/res/sound.jpg",
        invite: "https://bpw.blyule.com/wxJump/res/invite.jpg",
        relive: "https://bpw.blyule.com/wxJump/res/relive.jpg",
        end: "https://bpw.blyule.com/wxJump/res/end.jpg",
        qunRank: "https://bpw.blyule.com/wxJump/res/qunRank.jpg",
        forward: "https://bpw.blyule.com/wxJump/res/forward.jpg",
    };

    shareDesc = {
        random: [
            "点击这个杨超越，你会心想事成",
            "点击助我抽大奖",
        ],
        sound: [
            "我就是电音碑谷MVP~",
            "让我们一起摇摆~",
            "老年蹦蹦乐了解一下?",
        ],
        invite: [
            //为空说明要根据当前的信息动态生成。。。
        ],
        relive: [
            "左右脑并用，臣妾做不到啊~",
            "玩这个游戏戒掉了淘宝，因为手已经剁了…",
            "快拉我一把，我要掉下悬崖啦~"
        ],
        end: [

        ],
        qunRank: [
            "看看群里你能排第几？",
            "群里谁最高，点进来就知道~"
        ],
        forward: [
            "迁跃之地，以太阶梯，千回百转，境之边缘。",
            "旋转跳跃，永不停歇。--境之边缘"
        ]
    };

    userData = {
        //用户相关需要储存的数据
        bestScore: 0, //最高纪录
        reliveNum: 0, //复活币数目
        propGreenNum: 0, //获得游戏币道具个数
        addHpMax: 0, //可添加的生命值 最大值
        //addHpNow:5,//可添加的生命值 (翻倍也是翻这个数) 用 reliveNum 代替了。。

        //用户使用的数据
        useSpeedNum: 0, //加速台阶的个数
        useCutNum: 0, //减速的数值
        useFootName: null, //当前使用的脚印下标 默认:prop_foot1
        useRoleName: "role_right1", //当前使用的角色下标  默认:role_right1
        useStreakColor: null, //使用拖尾的下标
        useSoundName: null,//

        showParticle: false,

        //游戏 game 中需要的数据
        isReady: true, //在主界面中 已准备完成
        loadOver: false, //加载背景音乐完成
        pauseGame: false, //暂停游戏
        onGaming: false, //游戏正在进行中(砖块 下落 和 场景移动))

        //移动相机相关变量(相机的目标位置即是角色的目标位置 aimRoleX aimRoleY)
        baseSpeedY: 160, //相机移动的基础度
        cameraSpeedX: 50, //相机的移动的基础速度
        cameraSpeedY: 160, //相机的移动的Y速度
        dropPosY: 320, //当方块位置 小于摄像机位置这么多时消失

        lastBoxX: this.boxX, //最近生成的个 方块的X Y
        lastBoxY: -this.boxY, //确保第一个在 (0,0);
        countBox: 0, //盒子计数

        baseHp: 1, //基础生命值
        reliveHp: 0, //这一局游戏的命数
        shareDouble: 0, //分享获得的翻倍次数

        mainBgIdx: 0, //主场景背景的下标切进来一次换一张
        changeNum: 40, //跳多少次变一下场景
        gameBgIdx: 0, //游戏中背景和箱子的图片下标
        boxName: "zz01", //当前所出箱子的图片名称
        nextChangeTime: 12, //据下次变色的时间间隔
        nextChangeIdx: 0, //当前变色的时间间隔下标

        cutSpeed: 1, //减速中多少 0~1
        speedNum: 0, //当前加速的的数量
        nextSpeedPos: (parseInt(Math.random() * 40) + 15), //下一次一次出现 Speed 的位置

        aimRoleX: 0, //角色的目标位置
        aimRoleY: 0,
        jumpTime: 0.12, //角色跳动的时间(相机的移动要在这个时间内完成)
        roleDieType: 0, //1 跳空结束、2碰撞钉子结束、3 box下坠结束
        countJump: 0, //统计跳跃次数

        reliveTimes: 0, //已经连续复活的次数 在initGame 中初始化
        isReliveDrop: false, //是否复活后 可以下落(角色达到安全距离后可下落)
    };

    //场景资源的图片 名称
    gameBgName = ["cj01", "cj02", "cj03", "cj04", "cj05"];
    //砖块的图片 名称(顺序和出场顺序是一致的)
    boxName = ["zz01", "zz02", "zz03", "zz04", "zz05"];
    //游戏中的背景图片
    bgFrame = {};

    //音乐改变背景相关参数
    changeTime = [12, 11, 25, 23, 37, 23, 12, 30];
    //changeSpeed = [1, 1.2, 1.3, 2, 1.3, 1.2, 1.4, 1.3];
    changeSpeed = [1, 1.2, 1.4, 1.8, 1.4, 1.2, 1.6, 1.4];
    changeBg = [0, 1, 2, 4, 2, 1, 4, 3];

    //角色的数据
    roleData = [{
        name: "role_right1",
        price: 0,
        hp: 1
    },
    {
        name: "role_right2",
        price: 6,
        hp: 1
    },
    {
        name: "role_right3",
        price: 24,
        hp: 1
    },
    {
        name: "role_right4",
        price: 48,
        hp: 1
    },
    {
        name: "role_right5",
        price: 99,
        hp: 1
    }
    ];
    //拖尾的颜色(idx 偶数是12h、奇数是24h) idx1 是梦幻气泡
    streakColor = [cc.color(255, 0, 0, 255), cc.color(0, 255, 0, 255), cc.color(0, 0, 255, 255), cc.color(255, 0, 255, 255)];
    //脚印的名称(idx 偶数是12h、奇数是24h)
    footName = ["jiaoyin01", "jiaoyin01"];

    soundData = [
        {
            name: "bg_1",
            desc: "卡农",
        },
        {
            name: "bg_2",
            desc: "Flower",
        },
        {
            name: "bg_3",
            desc: "Flash Funk",
        },
        {
            name: "bg_4",
            desc: "V3",
        },
        {
            name: "bg_5",
            desc: "Skyland",
        }
    ]

    //玩家拥有的道具等
    haveProp = {
        haveSpeed: [], //50 和 100两种
        haveCut: [], //0.3 和 0.7 两种
        haveFoot: [], //存的是脚印的下标
        haveStreak: [], //存的时下标

        //玩家当前正在使用的东西
        useSpeed: {
            num: 0,
            beginTime: 0, //开始时间
            surplusTimes: 0, //剩余局数
        },
        useCut: {
            num: 0,
            beginTime: 0,
            surplusTimes: 0,
        },
        useFoot: {
            footIdx: null,
            beginTime: 0,
            continueTime: 12 * 3600, //持续时间
        },
        useStreak: {
            streakIdx: null,
            beginTime: 0,
            continueTime: 12 * 3600,
        },
        useRoleIdx: 0, //使用的角色下标
        useSoundIdx: 0,//使用的背景歌曲

        countShareNum: 0, //统计总的分享次数
        countShareToday: 0, //统计今天的分享次数
        countAdNum: 0, //统计总的广告此时
        countInvite: 0, //成功邀请好友进入数
        freeTimes: 3, //免费的转盘次数(新人免费送的)

        adCDBegin: 0, //看广告转转盘 冷却时间
        rewardTimes: 0, //观看视频获得的 转盘机会
        todayShareBegin: 0, //今日开始分享计数的时间
        autoAdTime: 0,

        inviteTake: [], //邀请有礼里领取的奖励
        isOwnSpeed: false, //永久加速
        isOwnCut: false, //永久拥有
        isOwnFoot: false, //永久拥有
        isOwnStreak: false, //永久拥有
    };

    initData() {
        //版本比较 是否重置数据
        let reset = false;
        let version = cc.sys.localStorage.getItem("version");
        if (version != this.version) {
            reset = true;
            cc.sys.localStorage.setItem("version", this.version);
        }
        console.log("--- initData ---");

        //玩家openid
        let openid = cc.sys.localStorage.getItem("openid");
        if (!openid || reset)
            cc.sys.localStorage.setItem("openid", 0);
        cc.dataMgr.openid = cc.sys.localStorage.getItem("openid");
        console.log(cc.dataMgr.openid);

        let score = cc.sys.localStorage.getItem("bestScore");
        if (!score)
            cc.sys.localStorage.setItem("bestScore", 0);
        else
            this.userData.bestScore = score;

        let propNum = cc.sys.localStorage.getItem("propGreenNum");
        if (!propNum)
            cc.sys.localStorage.setItem("propGreenNum", 0);
        else
            this.userData.propGreenNum = parseInt(propNum);

        let addHpMax = cc.sys.localStorage.getItem("addHpMax");
        if (!addHpMax || reset)
            cc.sys.localStorage.setItem("addHpMax", this.getAddHp_i());
        else
            this.userData.addHpMax = parseInt(addHpMax);

        let reliveNum = cc.sys.localStorage.getItem("reliveNum");
        if (!reliveNum || reset)
            cc.sys.localStorage.setItem("reliveNum", 0);
        else
            this.userData.reliveNum = parseInt(reliveNum);

        let reliveTime = cc.sys.localStorage.getItem("reliveTime")
        if (!reliveTime || reset) {
            cc.sys.localStorage.setItem("reliveTime", parseInt(Date.now() / 1000));
            cc.sys.localStorage.setItem("reliveNum", 0);
            this.userData.reliveNum = 0;
        } else {
            reliveTime = parseInt(reliveTime);
            let timeNow = parseInt(Date.now() / 1000);
            let num = parseInt((timeNow - reliveTime) / 1800);
            if (num > 0) {
                if (num + this.userData.reliveNum > this.userData.addHpMax) {
                    this.userData.reliveNum = this.userData.addHpMax;
                    cc.sys.localStorage.setItem("reliveTime", parseInt(Date.now() / 1000));
                } else {
                    this.userData.reliveNum += (num);
                    cc.sys.localStorage.setItem("reliveTime", reliveTime + num * 1800);
                }
                cc.sys.localStorage.setItem("reliveNum", this.userData.reliveNum);
            }
        }

        let mainIdx = cc.sys.localStorage.getItem("mainBgIdx");
        if (!mainIdx)
            cc.sys.localStorage.setItem("mainBgIdx", 0);
        else
            cc.dataMgr.userData.mainBgIdx = parseInt(mainIdx);

        let havePropStr = cc.sys.localStorage.getItem("haveProp");
        //console.log("-- haveProp : " + havePropStr);
        if (!havePropStr || reset) {
            if (reset && havePropStr) {
                console.log("--- reset 数据清空了 ---")
                let haveProp = JSON.parse(havePropStr);
                //this.haveProp.countShareNum = haveProp.countShareNum;
                //this.haveProp.countShareToday = haveProp.countShareToday;
                //this.haveProp.countAdNum = haveProp.countAdNum;
                this.haveProp.countInvite = haveProp.countInvite;
                //this.haveProp.freeTimes = 3;//haveProp.freeTimes;

                if (this.haveProp.countInvite > 100)
                    this.haveProp.countInvite = 100;
                this.userData.addHpMax = this.getAddHp_i();
                cc.sys.localStorage.setItem("addHpMax", this.userData.addHpMax);
            }
            this.haveProp.autoAdTime = this.getTimeSecond_i();
            cc.sys.localStorage.setItem("haveProp", JSON.stringify(this.haveProp));
        }
        else {
            this.haveProp = JSON.parse(havePropStr);
        }

        console.log(this.userData);
        console.log(this.haveProp);

        //加载图片资源
        cc.loader.loadRes("cj01", cc.SpriteFrame, function (err, frame) {
            if (!err)
                cc.dataMgr.bgFrame["cj01"] = frame;
        });
        cc.loader.loadRes("cj02", cc.SpriteFrame, function (err, frame) {
            if (!err)
                cc.dataMgr.bgFrame["cj02"] = frame;
        });
        cc.loader.loadRes("cj03", cc.SpriteFrame, function (err, frame) {
            if (!err)
                cc.dataMgr.bgFrame["cj03"] = frame;
        });
        cc.loader.loadRes("cj04", cc.SpriteFrame, function (err, frame) {
            if (!err)
                cc.dataMgr.bgFrame["cj04"] = frame;
        });
        cc.loader.loadRes("cj05", cc.SpriteFrame, function (err, frame) {
            if (!err) {
                cc.dataMgr.bgFrame["cj05"] = frame;
                //变背景
                let gameJs = cc.find("Canvas").getComponent("Game");
                if (gameJs)
                    gameJs.changeGameBg();
            }
        });

        //cc.loader.loadResDir()

        this.getUerOpenID();
        this.getShowShare();
        this.getShareReward();

        this.scheduleOnce(cc.dataMgr.initAD, 1.8);
    }

    //重大改变之前 如扣钱口金币等 要保存数据 
    saveData() {
        cc.sys.localStorage.setItem("propGreenNum", this.userData.propGreenNum);
        cc.sys.localStorage.setItem("addHpMax", this.userData.addHpMax);
        cc.sys.localStorage.setItem("reliveNum", this.userData.reliveNum);
        cc.sys.localStorage.setItem("haveProp", JSON.stringify(this.haveProp));
    }

    //每局开始 检查道具是否过期 并修改 userData 中对应的使用数据
    checkProp() {
        //加速冲刺道具
        if (this.haveProp.useSpeed.num < 0 || this.haveProp.useSpeed.beginTime + 3600 <= this.getTimeSecond_i()) {
            //如果有道具使用一个新的
            if (this.haveProp.haveSpeed.length > 0) {
                let num = this.haveProp.haveSpeed.shift();
                this.haveProp.useSpeed.num = num;
                this.haveProp.useSpeed.beginTime = this.getTimeSecond_i();
                this.haveProp.useSpeed.surplusTimes = 3;
            }
        }
        if (this.haveProp.useSpeed.num > 0 && this.haveProp.useSpeed.beginTime + 3600 > this.getTimeSecond_i()) {
            this.haveProp.useSpeed.surplusTimes--;
            this.userData.useSpeedNum = this.haveProp.useSpeed.num;
            if (this.haveProp.useSpeed.surplusTimes <= 0) {
                this.haveProp.useSpeed.num = 0;
                this.haveProp.useSpeed.beginTime = 0;
            }
        }
        //优先用一百阶的
        if (this.haveProp.isOwnSpeed && this.userData.useSpeedNum <= 50) {
            this.userData.useSpeedNum = 50;
        }


        //减速道具
        if (this.haveProp.isOwnCut) {
            this.userData.useCutNum = 0.3;
        } else {
            if (this.haveProp.useCut.num < 0 || this.haveProp.useCut.beginTime + 3600 <= this.getTimeSecond_i()) {
                //如果有道具使用一个新的
                if (this.haveProp.haveCut.length > 0) {
                    let num = this.haveProp.haveCut.shift();
                    this.haveProp.useCut.num = num;
                    this.haveProp.useCut.beginTime = this.getTimeSecond_i();
                    this.haveProp.useCut.surplusTimes = 3;
                }
            }
            if (this.haveProp.useCut.num > 0 && this.haveProp.useCut.beginTime + 3600 > this.getTimeSecond_i()) {
                this.haveProp.useCut.surplusTimes--;
                this.userData.useCutNum = this.haveProp.useCut.num;
                if (this.haveProp.useCut.surplusTimes <= 0) {
                    this.haveProp.useCut.num = 0;
                    this.haveProp.useCut.beginTime = 0;
                }
            }
        }

        //脚印效果
        if (this.haveProp.isOwnFoot) {
            this.userData.useFootName = this.footName[0];
        } else {
            if (this.haveProp.useFoot.beginTime + this.haveProp.useFoot.continueTime <= this.getTimeSecond_i()) {
                //过期了换个新的
                if (this.haveProp.haveFoot.length > 0) {
                    let footIdx = this.haveProp.haveFoot.shift();
                    if (footIdx < this.footName.length) {
                        this.userData.useFootName = this.footName[footIdx];

                        this.haveProp.useFoot.footIdx = footIdx;
                        this.haveProp.useFoot.beginTime = this.getTimeSecond_i();
                        this.haveProp.useFoot.continueTime = (footIdx % 2 == 0 ? 12 : 24) * 3600;
                    } else
                        this.userData.useFootName = null;
                } else
                    this.userData.useFootName = null;
            } else {
                //没过期
                if (this.haveProp.useFoot.footIdx < this.footName.length)
                    this.userData.useFootName = this.footName[this.haveProp.useFoot.footIdx];
                else
                    this.userData.useFootName = null;
            }
        }

        //光效效果
        this.userData.showParticle = false;
        if (this.haveProp.isOwnStreak) {
            this.userData.useStreakColor = this.streakColor[0];
        } else {
            if (this.haveProp.useStreak.beginTime + this.haveProp.useStreak.continueTime <= this.getTimeSecond_i()) {
                //过期了换个新的
                if (this.haveProp.haveStreak.length > 0) {
                    let streakIdx = this.haveProp.haveStreak.shift();
                    if (streakIdx < this.streakColor.length) {
                        this.userData.useStreakColor = this.streakColor[streakIdx];

                        this.haveProp.useStreak.streakIdx = streakIdx;
                        this.haveProp.useStreak.beginTime = this.getTimeSecond_i();
                        this.haveProp.useStreak.continueTime = (streakIdx % 2 == 0 ? 12 : 24) * 3600;

                        if (streakIdx == 1)
                            this.userData.showParticle = true;
                    } else
                        this.userData.useStreakColor = null;
                } else
                    this.userData.useStreakColor = null;
            } else {
                //没过期
                if (this.haveProp.useStreak.streakIdx < this.streakColor.length)
                    this.userData.useStreakColor = this.streakColor[this.haveProp.useStreak.streakIdx];
                else
                    this.userData.useStreakColor = null;
                if (this.haveProp.useStreak.streakIdx == 1)
                    this.userData.showParticle = true;
            }
        }

        //角色
        if (this.haveProp.useRoleIdx < this.roleData.length) {
            this.userData.useRoleName = this.roleData[this.haveProp.useRoleIdx].name;
            this.userData.baseHp = this.roleData[this.haveProp.useRoleIdx].hp;
        } else {
            this.haveProp.useRoleIdx = 0;
            this.userData.useRoleName = this.roleData[this.haveProp.useRoleIdx].name;
            this.userData.baseHp = this.roleData[this.haveProp.useRoleIdx].hp;
        }

        //背景歌曲
        if (this.haveProp.useSoundIdx < this.soundData.length) {
            this.userData.useSoundName = this.soundData[this.haveProp.useSoundIdx].name;
        }
        else {
            this.haveProp.useSoundIdx = 0;
            this.userData.useSoundName = this.soundData[this.haveProp.useSoundIdx].name;
        }


        //console.log("--- checkProp over ---");
        //console.log(this.haveProp);
        cc.sys.localStorage.setItem("haveProp", JSON.stringify(this.haveProp));
    }

    //改变角色
    changeRole(idx) {
        //判断角色是否可用
        let canUsed = false;
        for (let i = 0; i < this.roleData.length; ++i) {
            let roleD = this.roleData[i];
            if (i == idx && roleD.price <= this.haveProp.countShareNum)
                canUsed = true;
        }
        if (canUsed) {
            this.haveProp.useRoleIdx = idx;
            this.userData.useRoleName = this.roleData[idx].name;
            this.userData.baseHp = this.roleData[idx].hp;
        }
    }

    changeSound(idx) {
        this.haveProp.useSoundIdx = idx;
        if (this.haveProp.useSoundIdx < this.soundData.length) {
            this.userData.useSoundName = this.soundData[this.haveProp.useSoundIdx].name;
        }
        else {
            this.haveProp.useSoundIdx = 0;
            this.userData.useSoundName = this.soundData[this.haveProp.useSoundIdx].name;
        }
        cc.audioMgr.playBg();
    }

    //只改变改变颜色的数据
    changeToNextBg() {
        ++this.userData.nextChangeIdx;
        if (this.userData.nextChangeIdx >= this.changeTime.length) {
            this.userData.nextChangeIdx = 0;
            cc.audioMgr.playBg();
        }
        this.userData.nextChangeTime = this.changeTime[this.userData.nextChangeIdx];
        this.userData.gameBgIdx = this.changeBg[this.userData.nextChangeIdx];
        this.userData.cameraSpeedY = this.changeSpeed[this.userData.nextChangeIdx] * this.userData.baseSpeedY * this.userData.cutSpeed;
        //console.log("-- speed " + this.userData.cameraSpeedY + " -- " + this.userData.nextChangeIdx + " -- " + (this.userData.gameBgIdx + 1));
    }

    getShareDesc_s(type) {
        let shareStr = "千回百转，境之边缘。";
        if (type == "end") {
            //我才跳了10步，求大神帮我接力继续跑~
            //哇哈哈~一口气跳了1000步，你肯定跳不过我！
            if (cc.dataMgr.userData.countJump < 100) {
                shareStr = "我才跳了" + cc.dataMgr.userData.countJump + "步，求大神帮我接力继续跑~";
            }
            else {
                shareStr = "哇哈哈~一口气跳了" + cc.dataMgr.userData.countJump + "步，你肯定跳不过我！";
            }
        }
        else if (type == "invite") {
            //我想要道具/特效，帮忙解锁下！
            //帮我解锁XXX，送你一个么么哒~
            let prop = ["开局冲刺", "额外生命值+1", "脚印特效", "光效礼包", "额外生命值+1", "下坠减速"];
            let strProp = "无欲无求,只是想分享一下。 >_< "
            if (cc.dataMgr.haveProp.countInvite < prop.length)
                strProp = prop[cc.dataMgr.haveProp.countInvite];
            else
                return strProp;
            if (Math.random() > 0.5) {
                shareStr = "我想要" + strProp + "，帮忙解锁下！";
            }
            else
                shareStr = "帮我解锁" + strProp + "，送你一个么么哒~";
        }
        else {
            let descD = cc.dataMgr.shareDesc[type];
            console.log(descD);
            if (descD && descD.length > 0) {
                let idx = parseInt(Math.random() * descD.length);
                if (idx >= descD.length)
                    idx = 0;
                shareStr = descD[idx];
            }
        }
        console.log("--- shar：" + type + " -- " + shareStr);
        return shareStr;
    }

    //规则变化了。。
    getAddHp_i() {
        let addNum = 0;
        if (this.haveProp.countInvite >= 5)
            addNum = 2;
        else if (this.haveProp.countInvite >= 2)
            addNum = 1;
        return addNum;
    }

    getStreakName() {
        let idx = this.haveProp.useRoleIdx;
        if (idx >= this.roleData.length)
            idx = 0;
        ++idx;
        return ("role_streak" + idx);
    }

    getTimeSecond_i() {
        return parseInt(Date.now() / 1000);
    }

    //比较储存历史最高纪录
    getBestScore_i(nowScore) {
        if (nowScore > parseInt(this.userData.bestScore)) {
            this.userData.bestScore = nowScore;
            cc.sys.localStorage.setItem("bestScore", nowScore);
        }
        return this.userData.bestScore;
    }

    getBgFrame_sf(name) {
        if (!name)
            name = cc.dataMgr.gameBgName[cc.dataMgr.userData.gameBgIdx];
        return this.bgFrame[name];
    }

    //------ 广告相关 ------

    initAD() {
        console.log("--- initAD ---");
        console.log(cc.videoAd);
        if (!cc.videoAd && CC_WECHATGAME) {
            console.log("--- 加载广告 ---");
            cc.videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-6f2d1e64526046d9'
            });
            cc.videoAd.load();

            cc.videoAd.onClose(res => {
                console.log("广告onClose~！");
                console.log(res);

                if (res && res.isEnded || res === undefined) {
                    // 正常播放结束，可以下发游戏奖励
                    console.log("--- 发放奖励 ---");
                    cc.dataMgr.videoAdOver(true);
                }
                else {
                    // 播放中途退出，不下发游戏奖励
                    console.log("--- 中途退出，没有奖励---");
                    cc.dataMgr.videoAdOver(false);
                }
            });
        }
    }

    showAd(type) {
        this.showAdType = type;
        if (cc.videoAd && this.isShowAd) {
            cc.videoAd.show();
        }
    }

    autoPopAd() {
        if (!this.isPopAd)
            return;
        console.log("--- 自动弹出广告了 ---");
        if (this.getTimeSecond_i() > this.haveProp.autoAdTime + this.popTime) {
            this.haveProp.autoAdTime = this.getTimeSecond_i();
            this.showAd(null);
        }
    }

    //isSuccess 是否播放完成
    videoAdOver(isSuccess) {
        console.log("--- videoAdOver -- " + isSuccess + " -- " + this.showAdType);
        let hintStr = "感谢您的支持。";
        if (this.showAdType) {
            if (isSuccess) {
                hintStr = "已获得奖励,再接再厉。";
                if (this.showAdType == "random") {
                    //获得转转盘次数
                    this.haveProp.adCDBegin = this.getTimeSecond_i();
                    cc.dataMgr.haveProp.rewardTimes += 1;
                    //刷新界面
                    let nodeN = cc.find("Canvas/node_random");
                    if (nodeN && nodeN.getComponent("PanelRandom")) {
                        nodeN.getComponent("PanelRandom").initRand();
                    }
                }
                else if (this.showAdType == "relive") {
                    //看视频复活
                    cc.dataMgr.userData.reliveHp = cc.dataMgr.userData.baseHp + cc.dataMgr.userData.addHpMax;

                    let nodeN = cc.find("Canvas/node_relive");
                    if (nodeN && nodeN.getComponent("PanelRelive")) {
                        nodeN.getComponent("PanelRelive").reliveRole();
                    }
                }
            }
            else {
                hintStr = "中途推出,离奖励只差一步。"
            }
        }
        else {
            hintStr = "感谢您的支持。"
        }

        let node_hint = cc.find("Canvas/node_hint");
        if (node_hint) {
            //显示提示
        }
        this.showAdType = null;
    }

    //------ 账号奖励等相关 ------

    getUerOpenID() {
        if (CC_WECHATGAME) {

            let openid = cc.sys.localStorage.getItem("openid");
            if (!openid || openid - 1 == -1 || openid == "0") { //保证用户是第一次进游戏
                console.log("发送wx.login请求!");
                wx.login({
                    success: (res) => {
                        console.log("-- wx.login success --");
                        console.log(res);
                        if (res.code) {
                            //发起网络请求
                            wx.request({
                                url: 'https://bpw.blyule.com/game_2/public/index.php/index/index/getopenid?code=' + res.code,
                                data: {
                                    code: res.code,
                                },
                                success: (obj, statusCode, header) => {
                                    console.log("请求openid,服务器返回的数据！！--> " + obj);
                                    console.log(obj.data.openid);

                                    cc.dataMgr.openid = obj.data.openid;
                                    cc.sys.localStorage.setItem("openid", obj.data.openid); //之所以要存，是在分享的时候放入query中
                                    //微信官方文档那里写的调用函数是getLaunchInfoSync，但是根本搜不到这个API，应该是下面这个。
                                    let launchOption = wx.getLaunchOptionsSync();
                                    console.log(launchOption);
                                    if (launchOption.query.otherID == null || launchOption.query.otherID == undefined) {
                                        launchOption.query.otherID = 0;
                                    }
                                    console.log("看下 自己的openid 和 推荐方的openid");
                                    console.log(cc.dataMgr.openid);
                                    console.log(launchOption.query.otherID);
                                    wx.request({
                                        url: 'https://bpw.blyule.com/game_2/public/index.php/index/index/add?userid=' + cc.dataMgr.openid + "&" + "cuid=" + launchOption.query.otherID,
                                        data: {
                                            userid: cc.dataMgr.openid,
                                            cuid: launchOption.query.otherID,
                                        },
                                        success: (data, statusCode, header) => {
                                            console.log("添加用户成功！ 服务器返回的数据！！--> ");
                                            console.log(data);
                                        },
                                    });
                                },
                            });
                        }
                    }
                });
            }
        }
    }

    //从服务器获得用户的推荐奖励，并刷新在界面上
    getShareReward() {
        let openid = cc.sys.localStorage.getItem("openid");
        console.log("--- 获取分享奖励 ---" + openid);
        if (CC_WECHATGAME && openid) {
            wx.request({
                url: 'https://bpw.blyule.com/game_2/public/index.php/index/index/getprise?userid=' + openid,
                data: {
                    userid: openid,
                },
                success: (obj, statusCode, header) => {
                    console.log("--- 获取分享奖励 success ---");
                    console.log(obj);
                    if (obj.data.code > 0) {
                        let num = obj.data.code;
                        cc.dataMgr.haveProp.countInvite += num;
                        cc.dataMgr.refreshInvite();
                    }
                },
            });
        }
    }

    //获取是否显示引导分享。。 默认不显示
    getShowShare() {
        if (CC_WECHATGAME) {
            wx.request({
                url: this.imageUrl.urlJson,
                success: (obj, statusCode, header) => {
                    console.log("--- 游戏配置文件 getShowShare success ---");
                    console.log(obj);
                    if (obj.data && obj.data.reliveAdNum) {
                        cc.dataMgr.isShowShare = obj.data.showShare;
                        cc.dataMgr.isShowAd = obj.data.showAd;
                        cc.dataMgr.shareQunRand = obj.data.shareQunRand;
                        cc.dataMgr.reliveAdNum = obj.data.reliveAdNum;
                        cc.dataMgr.isPopAd = obj.data.popAd;
                        cc.dataMgr.popTime = obj.data.popTime;
                    }
                    //console.log("--- 关闭分享：--- " + cc.dataMgr.isShowShare);
                },
            });
        } else
            cc.dataMgr.isShowShare = false;
    }

    //刷新邀请奖励
    refreshInvite() {
        if (cc.dataMgr.haveProp.countInvite > 0) {
            if (cc.dataMgr.haveProp.countInvite > 100)
                cc.dataMgr.haveProp.countInvite = 100;
            cc.dataMgr.userData.addHpMax = this.getAddHp_i();
        }
        //邀请榜奖励 
        let inviteJs = cc.find("Canvas").getComponent("PanelInvite");
        if (inviteJs) {
            inviteJs.initInvite();
        }
    }

    //type : 分享的类型 不同的分享有不同的效果
    shareSuccess(type) {
        //三个小时分享十次
        if (this.getTimeSecond_i() > this.haveProp.todayShareBegin + 3 * 3600) {
            this.haveProp.todayShareBegin = this.getTimeSecond_i();
            this.haveProp.countShareToday = 0;
        }
        if (this.haveProp.countShareToday < 10) {
            this.haveProp.countShareToday++;
            this.haveProp.countShareNum++;
        }

        if (type == "end") {
            //这是分享成功给玩家的奖励 回满reliveNum 和 下局双倍
            this.userData.reliveNum = this.userData.addHpMax;
            this.userData.shareDouble = 1;
        } else if (type == "startAd" || type == "startAdCd") {
            //广告分享成功
            this.haveProp.adCDBegin = 0;
            if (type == "startAd" && this.shareQunRand)//这里是分享到群，立即抽奖一次
                cc.dataMgr.haveProp.rewardTimes += 1;
            //刷新界面
            let nodeNJs = cc.find("Canvas/node_random").getComponent("PanelRandom");
            if (nodeNJs) {
                nodeNJs.initRand();
            }
        } else if (type == "endRelive") {
            //调用结束界面的复活接口
            cc.dataMgr.userData.reliveHp = cc.dataMgr.userData.baseHp + cc.dataMgr.userData.addHpMax;
            let nodeNJs = cc.find("Canvas/node_relive").getComponent("PanelRelive");
            //console.log(nodeNJs);
            if (nodeNJs) {
                nodeNJs.reliveRole();
            }
        } else if (type == "store") {
            let nodeNJs = cc.find("Canvas").getComponent("PanelStore");
            //console.log(nodeNJs);
            if (nodeNJs) {
                nodeNJs.refreshShareNum();
            }
        }
    }
}