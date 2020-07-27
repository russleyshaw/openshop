import { asNotNil, isPowerOf2 } from "../util";
import { F32ImageData } from "../models/f32_image_data";

export type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

export function loadShader(gl: WebGLContext, type: GLenum, source: string): WebGLShader {
    const shader = asNotNil(gl.createShader(type));

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const shaderMsg = gl.getShaderInfoLog(shader) ?? "";
        gl.deleteShader(shader);
        throw new Error(`An error occurred compiling the shaders: ${shaderMsg}`);
    }

    return shader;
}

export function loadTexture(gl: WebGLContext, img: F32ImageData): WebGLTexture {
    const texture = asNotNil(gl.createTexture());
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.FLOAT;
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

    return texture;
}
