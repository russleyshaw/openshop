import * as React from "react";
import styled from "styled-components";
import { AppModel } from "../models/app";
import { ProjectModel, Tool } from "../models/project";
import { GlShader, WebGLContext, GlTexture, GlProgram, GlShaderType } from "../common/webgl";
import { mat4 } from "gl-matrix";
import { asNotNil, delayMs } from "../util";

import { Point } from "../common/point";
import { throttle } from "lodash";

const RootDiv = styled.div`
    flex: 1 1 auto;
    position: relative;
    overflow: hidden;
`;

const StageCanvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;

    user-select: none;
    touch-action: none;
`;

export interface StageViewProps {
    app: AppModel;
    project: ProjectModel;
}

interface GlState {
    background: {
        program: GlProgram;

        bVertexPositions: WebGLBuffer;

        aVertexPosition: number;

        uProjectionMatrix: WebGLUniformLocation;
        uModelViewMatrix: WebGLUniformLocation;
    };
    scene: {
        program: GlProgram;

        bVertexPositions: WebGLBuffer;
        bTextureCoords: WebGLBuffer;

        tScene: GlTexture;

        aVertexPosition: number;
        aTextureCoord: number;

        uProjectionMatrix: WebGLUniformLocation;
        uModelViewMatrix: WebGLUniformLocation;
        uSampler: WebGLUniformLocation;
    };
}

interface PointerPath {
    x: number;
    y: number;
    pressure: number;
}

export default class StageView extends React.Component<StageViewProps> {
    rootRef: HTMLDivElement | null = null;
    stageRef: HTMLCanvasElement | null = null;
    glState?: GlState;

    isDrawing: boolean = false;

    stageImage: ImageData;
    projectionMatrix = mat4.create();
    modelViewMatrix = mat4.create();

    pointerX: number = 0;
    pointerY: number = 0;
    pointerPressure: number = 0;
    pointerTiltX: number = 0;
    pointerTiltY: number = 0;

    pointQueue: PointerPath[] = [];

    constructor(props: StageViewProps) {
        super(props);

        this.stageImage = new ImageData(this.props.project.width, this.props.project.height);
    }

    ///////////////////////////////////////////////////////////////////////////
    // React Lifecycle
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // Event Handlers
    ///////////////////////////////////////////////////////////////////////////

    onStageRef = (ref: HTMLCanvasElement | null): void => {
        this.stageRef = ref;
        void delayMs(500).then(() => this.startDrawing());
    };

    onRootRef = (ref: HTMLDivElement | null): void => {
        this.rootRef = ref;
    };

    onStagePointerDown: React.PointerEventHandler = event => {
        this.onStagePointerEvent(event);

        this.throttledApplyPointQueue();
    };

    onStagePointerUp: React.PointerEventHandler = event => {
        this.onStagePointerEvent(event);

        this.throttledApplyPointQueue();
    };

    throttledApplyPointQueue = throttle(
        () => {
            const project = this.props.project;
            const layer = project.selectedLayer;
            if (layer == null) return;

            const points = this.pointQueue;
            this.pointQueue = [];
            for (const point of points) {
                layer.drawPoint(
                    [point.x, point.y],
                    project.primaryColor,
                    project.pencilSize * point.pressure,
                    project.dirtyPixels
                );
            }

            this.updateStageImage();
        },
        1000 / 24,
        { leading: false, trailing: true }
    );

    onStagePointerMove: React.PointerEventHandler = event => {
        this.onStagePointerEvent(event);

        this.throttledApplyPointQueue();
    };

    onStagePointerEvent: React.PointerEventHandler = event => {
        const project = this.props.project;

        const layer = project.selectedLayer;
        if (layer == null) return;
        const ref = this.stageRef;
        if (ref == null) return;

        const bbox = ref.getBoundingClientRect();

        this.pointerX = event.clientX - bbox.left;
        this.pointerY = event.clientY - bbox.top;
        this.pointerPressure = event.pressure;
        this.pointerTiltX = event.tiltX;
        this.pointerTiltY = event.tiltY;

        if (this.pointerPressure === 0) return;

        this.pointQueue.push({
            pressure: event.pressure,
            x: this.pointerX,
            y: this.pointerY,
        });
    };

    updateStageImage(): void {
        const project = this.props.project;
        const layer = project.selectedLayer;
        if (layer == null) return;

        let pixelIdx = 0;
        let subPixelIdx = 0;
        for (let y = 0; y < project.height; y++) {
            for (let x = 0; x < project.width; x++) {
                pixelIdx = y * project.width + x;
                subPixelIdx = pixelIdx * 4;

                if (project.dirtyPixels[pixelIdx]) {
                    this.stageImage.data[subPixelIdx + 0] = Math.floor(
                        layer.image.value.data[subPixelIdx + 0] * 255
                    );
                    this.stageImage.data[subPixelIdx + 1] = Math.floor(
                        layer.image.value.data[subPixelIdx + 1] * 255
                    );
                    this.stageImage.data[subPixelIdx + 2] = Math.floor(
                        layer.image.value.data[subPixelIdx + 2] * 255
                    );
                    this.stageImage.data[subPixelIdx + 3] = Math.floor(
                        layer.image.value.data[subPixelIdx + 3] * 255
                    );
                    project.dirtyPixels[pixelIdx] = false;
                }
            }
        }

        const ctx = this.glState;
        if (ctx != null) {
            ctx.scene.tScene.setImageData(this.stageImage);
        }
    }

    throttledUpdateStageImage = throttle(() => this.updateStageImage(), 1000 / 24, {
        leading: false,
        trailing: true,
    });

    async startDrawing(): Promise<void> {
        const stageRef = this.stageRef;
        if (stageRef == null) return;

        const rootRef = this.rootRef;
        if (rootRef == null) return;

        const gl = this.getGlContext(stageRef);
        if (gl == null) return;

        const state = this.glState ?? (await this.initState(rootRef, stageRef, gl));

        this.isDrawing = true;

        const doDraw = () => {
            this.draw(rootRef, stageRef, gl, state);
            if (this.isDrawing) {
                requestAnimationFrame(doDraw);
            }
        };
        requestAnimationFrame(doDraw);
    }

    render(): JSX.Element {
        return (
            <RootDiv ref={this.onRootRef}>
                <StageCanvas
                    onPointerMove={this.onStagePointerMove}
                    onPointerDown={this.onStagePointerDown}
                    onPointerUp={this.onStagePointerUp}
                    ref={this.onStageRef}
                />
            </RootDiv>
        );
    }

    private getGlContext(ref: HTMLCanvasElement) {
        return ref.getContext("webgl2", { alpha: true });
    }

    private async initState(
        rootRef: HTMLDivElement,
        stageRef: HTMLCanvasElement,
        gl: WebGLContext
    ): Promise<GlState> {
        const bgVShader = await GlShader.load(
            gl,
            GlShaderType.VERTEX,
            import("../shaders/background_vs.glsl")
        );
        const bgFShader = await GlShader.load(
            gl,
            GlShaderType.FRAGMENT,
            import("../shaders/background_fs.glsl")
        );
        const bgProgram = new GlProgram(gl, bgVShader, bgFShader);

        const sceneVShader = await GlShader.load(
            gl,
            GlShaderType.VERTEX,
            import("../shaders/scene_vs.glsl")
        );
        const sceneFShader = await GlShader.load(
            gl,
            GlShaderType.FRAGMENT,
            import("../shaders/scene_fs.glsl")
        );
        const sceneProgram = new GlProgram(gl, sceneVShader, sceneFShader);

        const bgVertexBuffer = asNotNil(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, bgVertexBuffer);
        // prettier-ignore
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0,              this.props.project.height,
            this.props.project.width, this.props.project.height,
            0,              0,
            this.props.project.width, 0,
        ]), gl.STATIC_DRAW);

        const sceneVb = asNotNil(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, sceneVb);
        // prettier-ignore
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0,              this.props.project.height,
            this.props.project.width, this.props.project.height,
            0,              0,
            this.props.project.width, 0,
        ]), gl.STATIC_DRAW);

        const sceneTcb = asNotNil(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, sceneTcb);
        // prettier-ignore
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 1,
            1, 1,
            0, 0,
            1, 0,
        ]), gl.STATIC_DRAW);

        const tScene = new GlTexture(gl, this.stageImage);

        const state: GlState = {
            background: {
                program: bgProgram,
                bVertexPositions: bgVertexBuffer,
                aVertexPosition: bgProgram.getAttribLocation("aVertexPosition"),
                uModelViewMatrix: bgProgram.getUniformLocation("uModelViewMatrix"),
                uProjectionMatrix: bgProgram.getUniformLocation("uProjectionMatrix"),
            },
            scene: {
                program: sceneProgram,
                bVertexPositions: sceneVb,
                bTextureCoords: sceneTcb,

                tScene,

                aVertexPosition: sceneProgram.getAttribLocation("aVertexPosition"),
                aTextureCoord: sceneProgram.getAttribLocation("aTextureCoord"),

                uModelViewMatrix: sceneProgram.getUniformLocation("uModelViewMatrix"),
                uProjectionMatrix: sceneProgram.getUniformLocation("uProjectionMatrix"),
                uSampler: sceneProgram.getUniformLocation("uSampler"),
            },
        };

        mat4.translate(
            this.modelViewMatrix, // destination matrix
            this.modelViewMatrix, // matrix to translate
            [0.0, 0.0, 0.0]
        ); // amount to translate

        mat4.ortho(this.projectionMatrix, 0, stageRef.width, stageRef.height, 0, -1, 1);

        this.glState = state;
        return state;
    }

    private draw(
        rootRef: HTMLDivElement,
        stageRef: HTMLCanvasElement,
        gl: WebGLContext,
        state: GlState
    ): void {
        if (stageRef.width !== rootRef.clientWidth || stageRef.height !== rootRef.clientHeight) {
            stageRef.width = rootRef.clientWidth;
            stageRef.height = rootRef.clientHeight;
            mat4.ortho(this.projectionMatrix, 0, stageRef.width, stageRef.height, 0, -1, 1);
            gl.viewport(0, 0, stageRef.width, stageRef.height);
        }

        gl.clearColor(0.0, 0.0, 0.0, 0.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.enable(gl.BLEND);
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.drawBg(gl, state);
        this.drawScene(gl, state);
    }

    private drawBg(gl: WebGLContext, state: GlState) {
        const myCtx = state.background;

        gl.bindBuffer(gl.ARRAY_BUFFER, myCtx.bVertexPositions);
        gl.vertexAttribPointer(
            myCtx.aVertexPosition,
            2, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(myCtx.aVertexPosition);

        myCtx.program.use();

        gl.uniformMatrix4fv(myCtx.uProjectionMatrix, false, this.projectionMatrix);
        gl.uniformMatrix4fv(myCtx.uModelViewMatrix, false, this.modelViewMatrix);

        gl.drawArrays(
            gl.TRIANGLE_STRIP,
            0, // offset
            4 // vertexCount
        );
    }

    private drawScene(gl: WebGLContext, state: GlState) {
        const myCtx = state.scene;

        gl.bindBuffer(gl.ARRAY_BUFFER, myCtx.bVertexPositions);
        gl.vertexAttribPointer(
            myCtx.aVertexPosition,
            2, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(myCtx.aVertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, myCtx.bTextureCoords);
        gl.vertexAttribPointer(
            myCtx.aTextureCoord,
            2, // numComponents
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );
        gl.enableVertexAttribArray(myCtx.aTextureCoord);

        myCtx.program.use();

        gl.uniformMatrix4fv(myCtx.uProjectionMatrix, false, this.projectionMatrix);
        gl.uniformMatrix4fv(myCtx.uModelViewMatrix, false, this.modelViewMatrix);

        gl.activeTexture(gl.TEXTURE0);
        myCtx.tScene.bind();

        gl.uniform1i(myCtx.uSampler, 0);

        gl.drawArrays(
            gl.TRIANGLE_STRIP,
            0, // offset
            4 // vertexCount
        );
    }
}
