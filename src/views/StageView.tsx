import * as React from "react";
import styled from "styled-components";
import { AppModel } from "../models/app";
import { ProjectModel } from "../models/project";
import { loadShader, loadTexture, WebGLContext } from "../common/webgl";
import { mat4 } from "gl-matrix";
import { asNotNil } from "../util";

import fsSource from "../shaders/fs.glsl";
import vsSource from "../shaders/vs.glsl";

const RootDiv = styled.div`
    flex: 1 1 auto;
    position: relative;
    overflow: hidden;
`;

const StageCanvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
`;

export interface StageViewProps {
    app: AppModel;
    project: ProjectModel;
}

interface GlContext {
    shaderProgram: WebGLProgram;

    bPosition: WebGLBuffer;
    bTextureCoord: WebGLBuffer;

    tTexture: WebGLTexture;

    aVertexPosition: number;
    aTextureCoord: number;

    uProjectionMatrix: WebGLUniformLocation;
    uModelViewMatrix: WebGLUniformLocation;
    uSampler: WebGLUniformLocation;
}

export default class StageView extends React.Component<StageViewProps> {
    rootRef: HTMLDivElement | null = null;
    stageRef: HTMLCanvasElement | null = null;
    glContext?: GlContext;

    drawInterval?: number;
    resizeListener?: unknown;

    projectionMatrix = mat4.create();
    modelViewMatrix = mat4.create();

    stageImage: ImageData;

    constructor(props: StageViewProps) {
        super(props);

        this.stageImage = new ImageData(this.props.project.width, this.props.project.height);
    }

    ///////////////////////////////////////////////////////////////////////////
    // React Lifecycle
    ///////////////////////////////////////////////////////////////////////////

    componentDidMount(): void {
        this.drawInterval = setInterval(() => this.draw(), 250);
    }

    componentWillUnmount(): void {
        clearInterval(this.drawInterval);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Event Handlers
    ///////////////////////////////////////////////////////////////////////////

    onStageRef = (ref: HTMLCanvasElement | null): void => {
        this.stageRef = ref;
    };

    onRootRef = (ref: HTMLDivElement | null): void => {
        this.rootRef = ref;
    };

    onStageClick: React.MouseEventHandler = event => {
        const project = this.props.project;

        const layer = project.selectedLayer;
        if (layer == null) return;
        const ref = this.stageRef;
        if (ref == null) return;

        const bbox = ref.getBoundingClientRect();

        const canvasX = event.clientX - bbox.left;
        const canvasY = event.clientY - bbox.top;

        layer.drawPoint(
            [Math.floor(canvasX), Math.floor(canvasY)],
            project.primaryColor,
            10,
            project.dirtyPixels
        );
    };

    getImage(): ImageData {
        const project = this.props.project;
        const layer = project.selectedLayer;
        if (layer == null) {
            return this.stageImage;
        }

        let pixelIdx = 0;
        for (let y = 0; y < project.height; y++) {
            for (let x = 0; x < project.width; x++) {
                pixelIdx = (y * project.width + x) * 4;
                this.stageImage.data[pixelIdx + 0] = Math.floor(
                    layer.image.value.data[pixelIdx + 0] * 255
                );
                this.stageImage.data[pixelIdx + 1] = Math.floor(
                    layer.image.value.data[pixelIdx + 1] * 255
                );
                this.stageImage.data[pixelIdx + 2] = Math.floor(
                    layer.image.value.data[pixelIdx + 2] * 255
                );
                this.stageImage.data[pixelIdx + 3] = Math.floor(
                    layer.image.value.data[pixelIdx + 3] * 255
                );
            }
        }
        return this.stageImage;
    }

    draw(): void {
        const stageRef = this.stageRef;
        if (stageRef == null) return;
        const rootRef = this.rootRef;
        if (rootRef == null) return;

        const gl = this._getGlContext(stageRef);
        if (gl == null) return;

        if (this.glContext == null) {
            this._init(stageRef, gl);
        }

        if (this.glContext != null) {
            this._draw(rootRef, stageRef, gl, this.glContext);
        }
    }

    render(): JSX.Element {
        return (
            <RootDiv ref={this.onRootRef}>
                <StageCanvas onClick={this.onStageClick} ref={this.onStageRef} />
            </RootDiv>
        );
    }

    private _getGlContext(ref: HTMLCanvasElement) {
        return ref.getContext("webgl2");
    }

    private _init(ref: HTMLCanvasElement, gl: WebGLContext): void {
        const label = "StageView.init";
        console.time(label);

        const vShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = asNotNil(gl.createProgram());
        gl.attachShader(shaderProgram, vShader);
        gl.attachShader(shaderProgram, fShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            const programMsg = gl.getProgramInfoLog(shaderProgram) ?? "";
            gl.deleteProgram(shaderProgram);
            throw new Error(`Unable to initialize the shader program: ${programMsg}`);
        }

        const positionBuffer = asNotNil(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // prettier-ignore
        const positions = [
            0, this.props.project.height,
            this.props.project.width, this.props.project.height,
            0, 0,
            this.props.project.width,0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const texture = loadTexture(gl, this.getImage());

        const textureCoordBuffer = asNotNil(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        // prettier-ignore
        const textureCoordinates = [
            // Front
            0.0,  1.0,
            1.0,  1.0,
            0.0,  0.0,
            1.0,  0.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

        mat4.ortho(this.projectionMatrix, 0, ref.clientWidth, ref.clientHeight, 0, -1, 1);

        this.glContext = {
            shaderProgram,
            bPosition: positionBuffer,
            bTextureCoord: textureCoordBuffer,

            tTexture: texture,

            aVertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            aTextureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),

            uProjectionMatrix: asNotNil(gl.getUniformLocation(shaderProgram, "uProjectionMatrix")),
            uModelViewMatrix: asNotNil(gl.getUniformLocation(shaderProgram, "uModelViewMatrix")),
            uSampler: asNotNil(gl.getUniformLocation(shaderProgram, "uSampler")),
        };

        console.timeEnd(label);
    }

    private _draw(
        rootRef: HTMLDivElement,
        stageRef: HTMLCanvasElement,
        gl: WebGLContext,
        ctx: GlContext
    ): void {
        const label = `StageView.draw (${stageRef.width}, ${stageRef.height})`;
        console.time(label);

        if (stageRef.width !== rootRef.clientWidth || stageRef.height !== rootRef.clientHeight) {
            stageRef.width = rootRef.clientWidth;
            stageRef.height = rootRef.clientHeight;
            gl.viewport(0, 0, stageRef.width, stageRef.height);
            mat4.ortho(this.projectionMatrix, 0, stageRef.width, stageRef.height, 0, -1, 1);
        }

        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.

        gl.bindBuffer(gl.ARRAY_BUFFER, ctx.bPosition);
        gl.vertexAttribPointer(
            ctx.aVertexPosition,
            2, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(ctx.aVertexPosition);

        // Tell WebGL how to pull out the texture coordinates from
        // the texture coordinate buffer into the textureCoord attribute.

        gl.bindBuffer(gl.ARRAY_BUFFER, ctx.bTextureCoord);
        gl.vertexAttribPointer(
            ctx.aTextureCoord,
            2, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(ctx.aTextureCoord);

        // Tell WebGL to use our program when drawing

        gl.useProgram(ctx.shaderProgram);

        // Set the shader uniforms

        gl.uniformMatrix4fv(ctx.uProjectionMatrix, false, this.projectionMatrix);
        gl.uniformMatrix4fv(ctx.uModelViewMatrix, false, this.modelViewMatrix);

        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, ctx.tTexture);
        const img = this.getImage();
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            img.width,
            img.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            img.data
        );

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(ctx.uSampler, 0);

        gl.drawArrays(
            gl.TRIANGLE_STRIP,
            0, // offset
            4 // vertexCount
        );

        console.timeEnd(label);
    }
}
