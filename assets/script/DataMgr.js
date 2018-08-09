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
        gameReady: true, //游戏准备完成(在主界面 和 结束界面时为true)
        onGaming: false, //游戏正在进行中(砖块 下落 和 场景移动))

        //移动相机相关变量(相机的目标位置即是角色的目标位置 aimRoleX aimRoleY)
        cameraSpeedX: 50, //相机的移动的基础速度
        cameraSpeedY: 160, //相机的移动的基础速度

        dropPosY: 200, //当方块位置 小于摄像机位置这么多时消失

        lastBoxX: this.boxX, //最近生成的个 方块的X Y
        lastBoxY: -this.boxY, //确保第一个在 (0,0);
        countBox: 0, //盒子计数

        aimRoleX: 0, //角色的目标位置
        aimRoleY: 0,
        jumpTime: 0.1, //角色跳动的时间(相机的移动要在这个时间内完成)
        roleDieType: 0, //1 跳空结束、2碰撞钉子结束、3 box下坠结束
        countJump: 0, //统计跳跃次数

        propGreenNum: 0, //获得道具个数
    }

    initData() {

    }
}