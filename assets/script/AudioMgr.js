const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class AudioMgr extends cc.Component {

    _audioSource_o = {
        bg_1: null,
        bg_2: null,
        bg_3: null,
        bg_4: null,
        bg_5: null,
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
            //console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            //console.log("cc.audioEngine.resumeAll");
            if (cc.dataMgr.userData.onGaming)
                cc.audioEngine.resumeAll();
        });

        let node_sound = cc.find("Canvas/node_sound");
        if (node_sound) {
            for (let i = 0; i < node_sound.children.length; ++i) {
                let nodeN = node_sound.children[i];
                let adClip = nodeN.getComponent(cc.AudioSource)
                if (adClip) {
                    this._audioSource_o[nodeN.name] = adClip.clip;
                }
            }
        }
        cc.dataMgr.userData.loadOver = true;

        let self = this;
        // cc.loader.loadRes("sound/bg_1", cc.AudioClip, function (err, clip) {
        //     if (!err) {
        //         self._audioSource_o.bg_1 = clip;
        //         //主界面中会 加载完成直接播放
        //         if (cc.dataMgr.userData.isReady)
        //             self.playBg();
        //         cc.dataMgr.userData.loadOver = true;
        //     }
        // });
        cc.loader.loadRes("sound/bg_2", cc.AudioClip, function (err, clip) {
            if (!err) {
                self._audioSource_o.bg_2 = clip;
            }
        });
        cc.loader.loadRes("sound/bg_3", cc.AudioClip, function (err, clip) {
            if (!err) {
                self._audioSource_o.bg_3 = clip;
            }
        }); cc.loader.loadRes("sound/bg_4", cc.AudioClip, function (err, clip) {
            if (!err) {
                self._audioSource_o.bg_4 = clip;
            }
        });
        cc.loader.loadRes("sound/bg_5", cc.AudioClip, function (err, clip) {
            if (!err) {
                self._audioSource_o.bg_5 = clip;
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
        console.log("-- playEffect -- " + type_s);
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
        let soundName = "bg_1";
        if (cc.dataMgr && cc.dataMgr.userData.useSoundName) {
            soundName = cc.dataMgr.userData.useSoundName;
        }
        let source = this._audioSource_o[soundName];
        if (!source)
            source = this._audioSource_o["bg_1"];
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