const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class AudioMgr extends cc.Component {

    _audioSource_o = null;

    _jumpID = null;

    onLoad() {
        console.log("--- onLoad ---")
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
        });

        cc.audioEngine.setMaxAudioInstance(40);
        this.init();
    }

    init() {
        this._audioSource_o = {};
        let node_sound = cc.find("Canvas/node_sound");
        if (node_sound) {
            for (let i = 0; i < node_sound.children.length; ++i) {
                let nodeN = node_sound.children[i];
                this._audioSource_o[nodeN.name] = nodeN.getComponent(cc.AudioSource);
            }
        }
    }

    //type_s 为这个音乐的名称
    playEffect(type_s) {
        let source = this._audioSource_o[type_s];
        if (source) {
            if (type_s == "role_jump1") {
                cc.audioEngine.setEffectsVolume(0.8);
                if (this._jumpID)
                    cc.audioEngine.stopEffect(this._jumpID);
                this._jumpID = cc.audioEngine.playEffect(source.clip, false);
            } else {
                cc.audioEngine.setEffectsVolume(1.2);
                cc.audioEngine.playEffect(source.clip, false);
            }
        }
    }

    stopEffect(type_s) {
        let source = this._audioSource_o[type_s];
        if (source) {
            source.stop();
        }
    }

    playBg() {
        let source = this._audioSource_o["bg"];
        if (source) {
            cc.audioEngine.playMusic(source.clip, true);
            cc.audioEngine.setMusicVolume(0.64);
        }
    }

    stopBg() {
        let source = this._audioSource_o.bg;
        if (source) {
            cc.audioEngine.stopMusic();
        }
    }

    pauseAll() {
        cc.audioEngine.pauseAll();
    }

    resumeAll() {
        cc.audioEngine.resumeAll();
    }
}