import * as twgl from "twgl.js";

const simple_vs = `
attribute vec2 a_position;

uniform vec2 u_screenSize;

void main() {
    vec2 pos = (((a_position + vec2(1,1)) * vec2(2, 2) / (u_screenSize + vec2(1, 1))) - vec2(1, 1));

    gl_Position = vec4(pos, 1.0, 1.0);
}
`
const simple_fs = `
precision mediump float;

uniform vec4 u_color;

void main() {
    gl_FragColor = u_color;
}
`

export class Renderer {

    private gl: WebGLRenderingContext;
    private screenSize: Vec2;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement, screenSize: Vec2) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl");
        
        this.screenSize = screenSize;
    }

    private checkBeforeRender(): boolean {
        if(this.gl.isContextLost()) {
            this.gl = this.canvas.getContext("webgl");
            return true;
        }
        return false;
    }

    initialize(toInit: Renderable) {
        toInit.initialize(this.gl);
    }

    remove(toRemove: Renderable) {
        toRemove.cleanUp(this.gl);
    }

    preRender() {
        if(this.checkBeforeRender()) {
            return;
        }

        twgl.resizeCanvasToDisplaySize((this.gl as any).canvas);

        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        const aspect = this.gl.canvas.width / this.gl.canvas.height;
        twgl.m4.ortho(-aspect, aspect, 1, -1, -1, 1, twgl.m4.identity())
    }

    draw(toRender: Renderable) {
        if(this.checkBeforeRender()) {
            return;
        }
        toRender.render(this.gl, this.screenSize);
    }
    
}

export class FontEntry {

    text: string;
    position: Vec2;
    size: Vec2;

    constructor(text: string, position: Vec2, scale: number) {
        this.text = text;
        this.position = position;
        this.size = new Vec2(10 * scale, 25 * scale);
    }

}

export class Font implements Renderable {

    private text_vs = `
        attribute vec2 a_position;
        attribute vec2 a_texcoord;

        uniform vec2 u_screenSize;

        varying vec2 v_texcoord;

        void main() {
            vec2 pos = (((a_position + vec2(1,1)) * vec2(2, 2) / (u_screenSize + vec2(1, 1))) - vec2(1, 1));

            gl_Position = vec4(pos, 1.0, 1.0);

            //pass texcoord to fragment shader
            v_texcoord = a_texcoord;
        }
        `

    private text_fs = `
        precision mediump float;
            
        varying vec2 v_texcoord;
        
        uniform sampler2D u_texture;
        
        void main() {
            gl_FragColor = texture2D(u_texture, v_texcoord);
        }
        `

    private textTextures: Map<String, Object>;

    private entires: Array<FontEntry> = []
    private putDataToGPU: boolean;
    
    private program: twgl.ProgramInfo;
    private bufferInfo: twgl.BufferInfo;

    constructor(entires: Array<FontEntry>) {
        this.entires = entires;
    }

    clearEntires() {
        this.entires = []
    }

    put(entry: FontEntry) {
        this.entires.push(entry);
    }

    update() {
        this.putDataToGPU = true;
    }
    
    private makeTextCanvas(text: string, scale: number) {
        let width = 13 * scale;
        let height = 26 * scale;
        let textCtx = document.createElement("canvas").getContext("2d");
        textCtx.canvas.width = width + 2;
        textCtx.canvas.height = height;
        textCtx.font = (20*scale) + "px monospace";
        textCtx.textAlign = "center";
        textCtx.textBaseline = "middle";
        // textCtx.fillStyle = "white";
        // textCtx.fillRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
        textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
        textCtx.fillStyle = "white";
        textCtx.fillText(text, width / 2 + 1, height / 2);
        return textCtx.canvas;
    }

    initialize(gl: WebGLRenderingContext): void {
        this.textTextures = new Map([
            "a",    // 0
            "b",    // 1
            "c",    // 2
            "d",    // 3
            "e",    // 4
            "f",    // 5
            "g",    // 6
            "h",    // 7
            "i",    // 8
            "j",    // 9
            "k",    // 10
            "l",    // 11
            "m",    // 12,
            "n",    // 13,
            "o",    // 14,
            "p",    // 14,
            "q",    // 14,
            "r",    // 14,
            "s",    // 14,
            "t",    // 14,
            "u",    // 14,
            "v",    // 14,
            "w",    // 14,
            "x",    // 14,
            "y",    // 14,
            "z",    // 14,
            "-",
            " ",
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "."
        ].map((name) => {
            var textCanvas = this.makeTextCanvas(name, 10);
            var textWidth  = textCanvas.width;
            var textHeight = textCanvas.height;
            var textTex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, textTex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
            // make sure we can render it even if it's not a power of 2
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            return [
                name,
                {
                    texture: textTex,
                    width: textWidth,
                    height: textHeight,
                }
            ];
        }));

        this.program = twgl.createProgramInfo(gl, [this.text_vs, this.text_fs]);
        
        this.generateBufferInfo(gl)
    }

    private generateBufferInfo(gl: WebGLRenderingContext) {
        let position = new Array()
        let texcoord = new Array()


        for (let entire of this.entires) {
            for (let i = 0; i < entire.text.length; i++) {
                position.push(entire.position.x + i * entire.size.x)
                position.push(entire.position.y)
    
                position.push(entire.position.x + entire.size.x + i * entire.size.x)
                position.push(entire.position.y)
    
                position.push(entire.position.x + i * entire.size.x)
                position.push(entire.position.y + entire.size.y)
    
                position.push(entire.position.x + i * entire.size.x)
                position.push(entire.position.y + entire.size.y)
    
                position.push(entire.position.x + entire.size.x + i * entire.size.x)
                position.push(entire.position.y)
    
                position.push(entire.position.x + entire.size.x + i * entire.size.x)
                position.push(entire.position.y + entire.size.y)
    
    
                texcoord.push(0)
                texcoord.push(0)
    
                texcoord.push(1)
                texcoord.push(0)
    
                texcoord.push(0)
                texcoord.push(1)
    
                texcoord.push(0)
                texcoord.push(1)
    
                texcoord.push(1)
                texcoord.push(0)
    
                texcoord.push(1)
                texcoord.push(1)
            }
        }

        const attributes = {
            a_position: {numComponents: 2, data:position},
            a_texcoord: {numComponents: 2, data:texcoord},
        }
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, attributes);

    }

    cleanUp(gl: WebGLRenderingContext): void {
        
    }

    render(gl: WebGLRenderingContext, screenSize: Vec2): void {
        if(this.putDataToGPU) {
            this.putDataToGPU = false;
            this.generateBufferInfo(gl)
        }
        gl.useProgram(this.program.program)
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        const uniforms = {
            u_screenSize: [screenSize.x, screenSize.y]
        }

        twgl.setBuffersAndAttributes(gl, this.program, this.bufferInfo);

        twgl.setUniforms(this.program, uniforms)

        let index = 0;
        for (let e of this.entires) {
            for (let character of e.text.split("")) {
                gl.activeTexture(gl.TEXTURE0)
                gl.bindTexture(gl.TEXTURE_2D, this.textTextures.get(character)["texture"])
                gl.uniform1i(this.program.uniformSetters["u_texture"]["location"], 0);
                gl.drawArrays(gl.TRIANGLES, index * 6, 6)
                index++;
            }
        }

        gl.disable(gl.BLEND)
    }
    
}

export class Line implements Renderable {

    public points: Array<Vec2>;
    private prevPoints: Array<Vec2>;
    public color: Color;

    private program: twgl.ProgramInfo;

    private bufferInfo: twgl.BufferInfo;

    constructor(points: Array<Vec2>, color: Color) {
        this.points = points;
        this.prevPoints = points;
        this.color = color;
    }

    initialize(gl: WebGLRenderingContext): void {
        this.program = twgl.createProgramInfo(gl, [simple_vs, simple_fs]);
        gl.useProgram(this.program.program);

        let data = new Array<number>

        for (let point of this.points) {
            data.push(point.x);
            data.push(point.y);
        }

        const attributes = {
            a_position: {numComponents: 2, data:data},
        }
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, attributes);
    }

    cleanUp(gl: WebGLRenderingContext): void {
        if(this.bufferInfo.attribs) {
            for (const key of Object.keys(this.bufferInfo.attribs)) {
                gl.deleteBuffer(this.bufferInfo.attribs[key].buffer)
            }
        }
        gl.deleteShader(this.program)
        gl.deleteProgram(this.program.program);
    }

    render(gl: WebGLRenderingContext, screenSize: Vec2): void {
        if(this.prevPoints != this.points) {
            if(this.prevPoints.length != this.points.length) {
                //update data in gpu
                //remove old buffer and create new
                if(this.bufferInfo.attribs && this.bufferInfo.attribs["a_position"]) {
                    gl.deleteBuffer(this.bufferInfo.attribs["a_position"].buffer);
                }
                let data = new Float32Array(this.points.length * 2);
                var i = 0;
                for (let point of this.points) {
                    data[i++] = point.x;
                    data[i++] = point.y;
                }
                let buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
                this.bufferInfo.attribs["a_position"].buffer = buffer;
                this.bufferInfo.numElements = data.length / 2;//DIRTY FIX, all need to be changed to pure opengl
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                
                // const attributes = {
                //     a_position: {numComponents: 2, data:data},
                // }
                // this.bufferInfo = twgl.createBufferInfoFromArrays(gl, attributes);
            } else {
                //copy data from cpu to gpu
                if(this.bufferInfo.attribs && this.bufferInfo.attribs["a_position"]) {
                    let data = new Float32Array(this.points.length * 2);
                    var i = 0;
                    for (let point of this.points) {
                        data[i++] = point.x;
                        data[i++] = point.y;
                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.attribs["a_position"].buffer)
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
                }
            }
            this.prevPoints = this.points;

            {
                let data = new Float32Array(this.points.length);
                var i = 0;
                for (let point of this.points) {
                    data[i++] = point.x;
                    data[i++] = point.y;
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferInfo.attribs["a_position"].buffer)
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
            }
        }

        gl.useProgram(this.program.program)
        const uniforms = {
            u_color: this.color.toArray(),
            u_screenSize: [screenSize.x, screenSize.y]
        }

        twgl.setBuffersAndAttributes(gl, this.program, this.bufferInfo);

        twgl.setUniforms(this.program, uniforms)

        twgl.drawBufferInfo(gl, this.bufferInfo, gl.LINE_STRIP);
    }

}

interface Renderable {
    initialize(gl: WebGLRenderingContext): void;
    cleanUp(gl: WebGLRenderingContext): void;

    render(gl: WebGLRenderingContext, screenSize: Vec2): void;
}

export class Vec2 {
    public x: number;
    public y: number

    constructor(x: number, y:number) {
        this.x = x;
        this.y = y;
    }
}

export class Color {
    r: number
    g: number
    b: number
    a: number

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toArray(): Array<number> {
        return [this.r,this.g,this.b,this.a];
    }
}