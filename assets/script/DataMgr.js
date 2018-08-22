const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class DataMgr extends cc.Component {
    boxX = 64; //砖块平铺时 据上一个砖块位置的X 和 Y
    boxY = 64;

    openid = null;
    isShowShare = false; //显示引导分享

    imageUrl = {
        urlGroup: "https://bpw.blyule.com/wxJump/res/jumpShare1.jpg",
        urlFriend: "https://bpw.blyule.com/wxJump/res/jumpShare2.jpg",
        urlMore: "https://bpw.blyule.com/wxJump/res/jumpShare3.jpg",
        urlXml: "https://bpw.blyule.com/wxJump/res/share.xml",
    }

    userData = {
        //用户相关需要储存的数据
        bestScore: 0, //最高纪录
        reliveNum: 0, //复活币数目
        propGreenNum: 0, //获得游戏币道具个数
        addHpMax: 5, //可添加的生命值 最大值
        //addHpNow:5,//可添加的生命值 (翻倍也是翻这个数) 用 reliveNum 代替了。。

        //用户使用的数据
        useSpeedNum: 0, //加速台阶的个数
        useCutNum: 0, //减速的数值
        useFootName: null, //当前使用的脚印下标 默认:prop_foot1
        useRoleName: "role_right1", //当前使用的角色下标  默认:role_right1
        useStreakColor: null, //使用拖尾的下标

        //游戏 game 中需要的数据
        isReady: true, //在主界面中 已准备完成
        loadOver: false, //加载背景音乐完成
        pauseGame: false, //暂停游戏
        onGaming: false, //游戏正在进行中(砖块 下落 和 场景移动))

        //移动相机相关变量(相机的目标位置即是角色的目标位置 aimRoleX aimRoleY)
        baseSpeedY: 100, //相机移动的基础度
        cameraSpeedX: 50, //相机的移动的基础速度
        cameraSpeedY: 100, //相机的移动的Y速度
        dropPosY: 200, //当方块位置 小于摄像机位置这么多时消失

        lastBoxX: this.boxX, //最近生成的个 方块的X Y
        lastBoxY: -this.boxY, //确保第一个在 (0,0);
        countBox: 0, //盒子计数

        baseHp: 5, //基础生命值
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
    changeSpeed = [1, 1.2, 1.3, 2, 1.3, 1.2, 1.4, 1.3];
    changeBg = [0, 1, 2, 4, 2, 1, 4, 3];

    //角色的数据
    roleData = [{
            name: "role_right1",
            price: 0
        },
        {
            name: "role_right2",
            price: 6
        },
        {
            name: "role_right3",
            price: 24
        },
        {
            name: "role_right4",
            price: 48
        },
        {
            name: "role_right5",
            price: 99
        }
    ];
    //拖尾的颜色(idx 偶数是12h、奇数是24h)
    streakColor = [cc.color(255, 0, 0, 255), cc.color(0, 255, 0, 255), cc.color(0, 0, 255, 255), cc.color(255, 0, 255, 255)];
    //脚印的名称(idx 偶数是12h、奇数是24h)
    footName = ["jiaoyin01", "jiaoyin01"];

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

        countShareNum: 0, //统计总的分享次数
        countShareToday: 0, //统计今天的分享次数
        countAdNum: 0, //统计总的广告此时
        countInvite: 0, //成功邀请好友进入数
        freeTimes: 3, //免费的转盘次数(新人免费送的)

        adCDBegin: 0, //看广告转转盘 冷却时间
        rewardTimes: 0, //观看视频获得的 转盘机会
        todayShareBegin: 0, //今日开始分享计数的时间

        inviteTake: [], //邀请有礼里领取的奖励
        isOwnSpeed: false, //永久加速
        isOwnCut: false, //永久拥有
        isOwnFoot: false, //永久拥有
        isOwnStreak: false, //永久拥有
    };

    initData() {
        console.log("--- initData ---");
        let openid = cc.sys.localStorage.getItem("openid");
        //if (!openid)
            cc.sys.localStorage.setItem("openid", 0);
        cc.dataMgr.openid = cc.sys.localStorage.getItem("openid");
        //console.log(cc.dataMgr.openid);

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
        if (!addHpMax)
            cc.sys.localStorage.setItem("addHpMax", 5);
        else
            this.userData.addHpMax = parseInt(addHpMax);

        let reliveNum = cc.sys.localStorage.getItem("reliveNum");
        if (!reliveNum)
            cc.sys.localStorage.setItem("reliveNum", 0);
        else
            this.userData.reliveNum = parseInt(reliveNum);

        let reliveTime = cc.sys.localStorage.getItem("reliveTime")
        if (!reliveTime) {
            cc.sys.localStorage.setItem("reliveTime", parseInt(Date.now() / 1000));
            cc.sys.localStorage.setItem("reliveNum", this.userData.addHpMax);
            this.userData.reliveNum = this.userData.addHpMax;
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

        // let havePropStr = cc.sys.localStorage.getItem("haveProp");
        // //console.log("-- haveProp : " + havePropStr);
        // if (!havePropStr)
        //     cc.sys.localStorage.setItem("haveProp", JSON.stringify(this.haveProp));
        // else {
        //     this.haveProp = JSON.parse(havePropStr);
        // }

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
            if (!err)
                cc.dataMgr.bgFrame["cj05"] = frame;
        });

        this.getUerOpenID();
        this.getShowShare();
        this.getShareReward();
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
        if (this.haveProp.isOwnSpeed) {
            this.userData.useSpeedNum = 100;
        } else {
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
            }
        }

        //角色
        if (this.haveProp.useRoleIdx < this.roleData.length) {
            this.userData.useRoleName = this.roleData[this.haveProp.useRoleIdx].name;
        } else {
            this.haveProp.useRoleIdx = 0;
            this.userData.useRoleName = this.roleData[this.haveProp.useRoleIdx].name;
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
        }
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

    getUerOpenID() {
        if (CC_WECHATGAME) {

            let openid = cc.sys.localStorage.getItem("openid");
            if (!openid || openid - 1 == -1) { //保证用户是第一次进游戏
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
                                    //console.log("请求openid,服务器返回的数据！！--> " + obj);
                                    //console.log(obj.data.openid);

                                    cc.dataMgr.openid = obj.data.openid;
                                    cc.sys.localStorage.setItem("openid", obj.data.openid); //之所以要存，是在分享的时候放入query中
                                    //微信官方文档那里写的调用函数是getLaunchInfoSync，但是根本搜不到这个API，应该是下面这个。
                                    let launchOption = wx.getLaunchOptionsSync();
                                    //console.log(launchOption);
                                    if (launchOption.query.otherID == null || launchOption.query.otherID == undefined) {
                                        launchOption.query.otherID = 0;
                                    }
                                    console.log("看下 自己的openid 和 推荐方的openid");
                                    console.log(cc.dataMgr.openid);
                                    console.log(launchOption.query.otherID);
                                    wx.request({
                                        url: 'https://bpw.blyule.com/game_2/public/index.php/index/index/add?userid=' + self.openid + "&" + "cuid=" + launchOption.query.otherID,
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
                url: this.imageUrl.urlXml,
                success: (obj, statusCode, header) => {
                    console.log("--- getShowShare success ---");
                    console.log(obj);
                    if (obj.data == 0)
                        cc.dataMgr.isShowShare = false;
                    else
                        cc.dataMgr.isShowShare = true;
                    //console.log("--- 关闭分享：--- " + cc.dataMgr.isShowShare);
                },
            });
        } else
            cc.dataMgr.isShowShare = true;
    }

    //刷新邀请奖励
    refreshInvite() {
        if (cc.dataMgr.haveProp.countInvite > 0) {
            cc.dataMgr.userData.addHpMax = parseInt(5 + cc.dataMgr.haveProp.countInvite * 5);
        }
        //邀请榜奖励 
        let inviteJs = cc.find("Canvas").getComponent("PanelInvite");
        if(inviteJs){
            inviteJs.initInvite();
        }
    }

    //type : 分享的类型 不同的分享有不同的效果
    shareSuccess(type) {
        if (this.getTimeSecond_i() > this.haveProp.todayShareBegin + 24 * 3600) {
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
            this.userData.shareDouble = 2;
        } else if (type == "startAd") {
            //广告分享成功
            this.haveProp.adCDBegin = 0;
            //刷新界面
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