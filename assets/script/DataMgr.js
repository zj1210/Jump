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
        cameraSpeedX: 50, //相机的移动的基础速度
        cameraSpeedY: 160, //相机的移动的基础速度

        dropPosY: 200, //当方块位置 小于摄像机位置这么多时消失

        //用户相关需要储存的数据
        bestScore: 0,

        //游戏 game 中需要的数据
        lastBoxX: this.boxX, //最近生成的个 方块的X Y
        lastBoxY: -this.boxY, //确保第一个在 (0,0);
        countBox: 0, //盒子计数

        changeNum: 40, //跳多少次变一下场景
        gameBgIdx: 0, //游戏中背景和箱子的图片下标
        boxName: "box1", //当前所出箱子的图片名称

        aimRoleX: 0, //角色的目标位置
        aimRoleY: 0,
        jumpTime: 0.1, //角色跳动的时间(相机的移动要在这个时间内完成)
        roleDieType: 0, //1 跳空结束、2碰撞钉子结束、3 box下坠结束
        countJump: 0, //统计跳跃次数

        propGreenNum: 0, //获得道具个数
    }

    //场景资源的图片 名称
    gameBgName = ["beijing01", "beijing02"];

    //砖块的图片 名称(顺序和出场顺序是一致的)
    boxName = ["box1", "box2"];

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

        console.log(this.userData);
    }

    //重大改变之前 如扣钱口金币等 要保存数据 
    saveData() {
        cc.sys.localStorage.setItem("propGreenNum", this.userData.propGreenNum);
    }

    //比较储存历史最高纪录
    getBestScore_i(nowScore) {
        if (nowScore > parseInt(this.userData.bestScore)) {
            this.userData.bestScore = nowScore;
            cc.sys.localStorage.setItem("bestScore", nowScore);
        }
        return this.userData.bestScore;
    }
}