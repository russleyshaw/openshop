import { asNotNil, isPowerOf2 } from "../util";
import { F32ImageData } from "../models/f32_image_data";

export type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

export enum GlShaderType {
    FRAGMENT,
    VERTEX,
}

export function shaderTypeToEnum(gl: WebGLContext, type: GlShaderType): GLenum {
    switch (type) {
        case GlShaderType.VERTEX:
            return gl.VERTEX_SHADER;
        case GlShaderType.FRAGMENT:
            return gl.FRAGMENT_SHADER;
    }
}

export class GlShader {
    glShader: WebGLShader;
    glType: GLenum;

    type: GlShaderType;

    private _gl: WebGLContext;

    constructor(gl: WebGLContext, type: GlShaderType, source: string) {
        this._gl = gl;
        this.type = type;
        this.glType = shaderTypeToEnum(gl, type);
        const shader = asNotNil(gl.createShader(this.glType), "Failed to create shader.");

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const shaderMsg = gl.getShaderInfoLog(shader) ?? "";
            gl.deleteShader(shader);
            throw new Error(`An error occurred compiling the shaders: ${shaderMsg}`);
        }

        this.glShader = shader;
    }

    static async load(
        gl: WebGLContext,
        type: GlShaderType,
        p: Promise<{ default: string }>
    ): Promise<GlShader> {
        return p.then(mod => new GlShader(gl, type, mod.default));
    }
}

export class GlTexture {
    glTexture: WebGLTexture;

    private _gl: WebGLContext;

    constructor(gl: WebGLContext, img: ImageData) {
        this._gl = gl;
        this.glTexture = asNotNil(gl.createTexture());

        this.setImageData(img);
    }

    bind(): void {
        const gl = this._gl;
        gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    }

    setImageData(img: ImageData): void {
        this.bind();

        const gl = this._gl;

        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            img.width,
            img.height,
            border,
            srcFormat,
            srcType,
            img.data
        );

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    }
}

export class GlProgram {
    glProgram: WebGLProgram;

    vertShader: GlShader;
    fragShader: GlShader;

    private _gl: WebGLContext;

    constructor(gl: WebGLContext, vertShader: GlShader, fragShader: GlShader) {
        this._gl = gl;
        this.vertShader = vertShader;
        this.fragShader = fragShader;

        const program = asNotNil(gl.createProgram());
        gl.attachShader(program, vertShader.glShader);
        gl.attachShader(program, fragShader.glShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program) ?? "";
            gl.deleteProgram(program);
            throw new Error(`Could not compile WebGL program. \n\n${info}`);
        }

        this.glProgram = program;
    }

    use(): void {
        const gl = this._gl;
        gl.useProgram(this.glProgram);
    }

    getUniformLocation(name: string): WebGLUniformLocation {
        const gl = this._gl;
        return asNotNil(
            gl.getUniformLocation(this.glProgram, name),
            `Unable to create uniform location: ${name}`
        );
    }

    getAttribLocation(name: string): number {
        const gl = this._gl;
        return gl.getAttribLocation(this.glProgram, name);
    }
}
