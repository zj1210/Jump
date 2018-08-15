const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class DataMgr extends cc.Component {
    boxX = 64; //砖块平铺时 据上一个砖块位置的X 和 Y
    boxY = 64;

    userData = {
        pauseGame: false, //暂停游戏
        onGaming: false, //游戏正在进行中(砖块 下落 和 场景移动))

        //移动相机相关变量(相机的目标位置即是角色的目标位置 aimRoleX aimRoleY)
        baseSpeedY: 160, //相机移动的基础度
        cameraSpeedX: 50, //相机的移动的基础速度
        cameraSpeedY: 160, //相机的移动的Y速度

        dropPosY: 200, //当方块位置 小于摄像机位置这么多时消失

        //用户相关需要储存的数据
        bestScore: 0, //最高纪录
        reliveNum: 0, //复活币数目
        propGreenNum: 0, //获得游戏币道具个数
        propSpeedNum: 6, //加速道具的个数
        propCutNum: 6, //减速道具的个数
        useFootIdx: 1, //当前使用的脚印下标 默认:prop_foot1
        useRoleIdx: 1, //当前使用的角色下标  默认:role_right1

        addHpMax: 5, //可添加的生命值 最大值
        //addHpNow:5,//可添加的生命值 (翻倍也是翻这个数) 用 reliveNum 代替了。。

        //游戏 game 中需要的数据
        lastBoxX: this.boxX, //最近生成的个 方块的X Y
        lastBoxY: -this.boxY, //确保第一个在 (0,0);
        countBox: 0, //盒子计数

        baseHp: 5, //基础生命值
        reliveHp: 0, //这一局游戏的命数
        shareDouble: 0, //分享获得的翻倍次数

        changeNum: 40, //跳多少次变一下场景
        gameBgIdx: 0, //游戏中背景和箱子的图片下标
        boxName: "zz01", //当前所出箱子的图片名称

        speedNum: 0, //当前加速的的数量
        nextSpeedPos: (parseInt(Math.random() * 40) + 15), //下一次一次出现 Speed 的位置

        aimRoleX: 0, //角色的目标位置
        aimRoleY: 0,
        jumpTime: 0.12, //角色跳动的时间(相机的移动要在这个时间内完成)
        roleDieType: 0, //1 跳空结束、2碰撞钉子结束、3 box下坠结束
        countJump: 0, //统计跳跃次数

        reliveTimes: 0, //已经连续复活的次数 在initGame 中初始化
    }

    //场景资源的图片 名称
    gameBgName = ["cj01", "cj02", "cj03", "cj04", "cj05"];

    bgFrame = {};

    //砖块的图片 名称(顺序和出场顺序是一致的)
    boxName = ["zz01", "zz02", "zz03", "zz04", "zz05"];

    playerData = [{
            name: "plaeyr1",
            price: 100
        },
        {
            name: "plaeyr2",
            price: 200
        },
        {
            name: "plaeyr3",
            price: 300
        },
        {
            name: "plaeyr4",
            price: 400
        },
        {
            name: "plaeyr5",
            price: 500
        }
    ];

    initData() {
        console.log("--- initData ---");
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

        console.log(this.userData);

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
    }

    //重大改变之前 如扣钱口金币等 要保存数据 
    saveData() {
        cc.sys.localStorage.setItem("propGreenNum", this.userData.propGreenNum);
        cc.sys.localStorage.setItem("addHpMax", this.userData.addHpMax);
        cc.sys.localStorage.setItem("reliveNum", this.userData.reliveNum);
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
            if (!openid) { //保证用户是第一次进游戏
                // console.log("发送wx.login请求!");
                wx.login({
                    success: (res) => {
                        let codeInfo = res.code;
                        console.log("-- wx.login --" + codeInfo);
                        console.log(res);
                        if (true)
                            return;
                        if (res.code) {
                            //发起网络请求
                            wx.request({
                                url: 'https://bpw.blyule.com/public/index.php/index/index/getopenid?code=' + res.code,
                                data: {
                                    code: res.code,
                                },
                                success: (obj, statusCode, header) => {
                                    // console.log("请求openid,服务器返回的数据！！--> " + obj);
                                    // console.log(obj.data.openid);

                                    self.openid = obj.data.openid;
                                    cc.sys.localStorage.setItem("openid", obj.data.openid); //之所以要存，是在分享的时候放入query中
                                    //微信官方文档那里写的调用函数是getLaunchInfoSync，但是根本搜不到这个API，应该是下面这个。
                                    var launchOption = wx.getLaunchOptionsSync();
                                    //  console.log(launchOption);
                                    //  self.otherOpenIDLabel.string = JSON.stringify(launchOption.query) + "query.otherID-->" + launchOption.query.otherID;

                                    if (launchOption.query.otherID == null || launchOption.query.otherID == undefined) {
                                        launchOption.query.otherID = 0;
                                    }
                                    // console.log("看下 自己的openid 和 推荐方的openid");
                                    // console.log(self.openid);
                                    // console.log(launchOption.query.otherID);
                                    wx.request({
                                        url: 'https://bpw.blyule.com/public/index.php/index/index/add?userid=' + self.openid + "&" + "cuid=" + launchOption.query.otherID,
                                        data: {
                                            userid: self.openid,
                                            cuid: launchOption.query.otherID,
                                        },
                                        success: (data, statusCode, header) => {
                                            //  console.log("添加用户成功！ 服务器返回的数据！！--> ");
                                            //  console.log(data);

                                            //  console.log("看下自己的openid数据！！--> ");
                                            //  console.log(self.openid);
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

    //这是分享成功给玩家的奖励 回满reliveNum 和 下局双倍
    shareSuccess(){
        this.userData.reliveNum = this.userData.addHpMax;
        this.userData.shareDouble = 2;
    }
}