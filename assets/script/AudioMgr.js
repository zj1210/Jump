const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class AudioMgr extends cc.Component {

    _audioSource_o = {
        bg: null,
        btn_click: null,
        prop_block: null,
        prop_empy: null,
        prop_score: null,
        role_jump1: null,
        role_jump2: null
    };

    _jumpID = null;

    init() {
        console.log("--- onLoad AudioMgr ---")
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
        });

        let self = this;
        cc.loader.loadRes("sound/bg", cc.AudioClip, function (err, clip) {
            if (!err) {
                self._audioSource_o.bg = clip;
                self.playBg();
            }
        });
        cc.loader.loadRes("sound/btn_click", cc.AudioClip, function (err, clip) {
            if (!err)
                self._audioSource_o.btn_click = clip;
        });
        cc.loader.loadRes("sound/prop_block", cc.AudioClip, function (err, clip) {
            if (!err)
                self._audioSource_o.prop_block = clip;
        });
        cc.loader.loadRes("sound/prop_empy", cc.AudioClip, function (err, clip) {
            if (!err)
                self._audioSource_o.prop_empy = clip;
        });
        cc.loader.loadRes("sound/prop_score", cc.AudioClip, function (err, clip) {
            if (!err)
                self._audioSource_o.prop_score = clip;
        });
        cc.loader.loadRes("sound/role_jump1", cc.AudioClip, function (err, clip) {
            if (!err)
                self._audioSource_o.role_jump1 = clip;
        });
        cc.loader.loadRes("sound/role_jump1", cc.AudioClip, function (err, clip) {
            if (!err)
                self._audioSource_o.role_jump1 = clip;
        });

        cc.audioEngine.setMaxAudioInstance(20);
        //this.init();
    }

    //type_s 为这个音乐的名称
    playEffect(type_s) {
        let source = this._audioSource_o[type_s];
        if (source) {
            if (type_s == "role_jump1") {
                cc.audioEngine.setEffectsVolume(0.8);
                if (this._jumpID)
                    cc.audioEngine.stopEffect(this._jumpID);
                this._jumpID = cc.audioEngine.playEffect(source, false);
            } else {
                cc.audioEngine.setEffectsVolume(1.2);
                cc.audioEngine.playEffect(source, false);
            }
        }
    }

    stopEffect() {

    }

    playBg() {
        let source = this._audioSource_o["bg"];
        console.log("-- playBg: " + source);
        if (source) {
            cc.audioEngine.playMusic(source, true);
            cc.audioEngine.setMusicVolume(0.64);
        }
    }

    stopBg() {
        cc.audioEngine.stopMusic();
    }

    pauseAll() {
        cc.audioEngine.pauseAll();
    }

    resumeAll() {
        cc.audioEngine.resumeAll();
    }
}