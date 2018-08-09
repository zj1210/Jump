import DissolveFrag from 'DissolveFrag';
const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class EDissolve extends cc.Component {

    @property(cc.SpriteFrame)
    noiseTexture = null;

    @property(cc.GLProgram)
    program = null;

    _startTime = Date.now();
    _time = 0.4;


    onLoad() {
        this.enabled = false;
    }

    useDissolve() {
        //console.log("--- userDissolve --");
        // 绑定噪音纹理
        let texture1 = null; //this.noiseTexture.getTexture();
        let gameJs = cc.find("Canvas").getComponent("Game");
        if (gameJs) {
            texture1 = gameJs.noiseTexture.getTexture();
        } else
            return;
        let gltext1 = texture1._glID;
        if (cc.sys.isNative) {} else {
            cc.gl.bindTexture2DN(1, texture1);
        }

        this.program = new cc.GLProgram();
        if (cc.sys.isNative) {
            this.program.initWithString(DissolveFrag.vert, DissolveFrag.frag);
        } else {
            this.program.initWithVertexShaderByteArray(DissolveFrag.vert, DissolveFrag.frag);
            this.program.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
            this.program.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
            this.program.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);
        }
        this.program.link();
        this.program.updateUniforms();
        this.program.use();

        if (cc.sys.isNative) {
            var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this.program);
            glProgram_state.setUniformFloat("time", this._time);
            glProgram_state.setUniformTexture("texture1", gltext1);
        } else {
            let ba = this.program.getUniformLocationForName("time");
            let text1 = this.program.getUniformLocationForName("texture1");
            this.program.setUniformLocationWith1f(ba, this._time);
            this.program.setUniformLocationWith1i(text1, 1);
        }
        this.setProgram(this.node.getComponent(cc.Sprite)._sgNode, this.program);
        this.enabled = true;
    }

    setProgram(node, program) {
        if (cc.sys.isNative) {
            var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(program);
            node.setGLProgramState(glProgram_state);
        } else {
            node.setShaderProgram(program);
        }
    }

    update(dt) {
        // 溶解速度
        this._time += 0.006;
        if (this.program) {
            this.program.use();
            if (cc.sys.isNative) {
                var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this.program);
                glProgram_state.setUniformFloat("time", this._time);
            } else {
                let ct = this.program.getUniformLocationForName("time");
                this.program.setUniformLocationWith1f(ct, this._time);
            }
        }
    }
}