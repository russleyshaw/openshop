import * as React from "react";
import styled from "styled-components";
import { SizeMe } from "react-sizeme";

import { asNotNil, delayMs, isPowerOf2, blendImageDataLayersNormal } from "../util";
import { Tool } from "../models/tools";
import { AppModel } from "../models/app";
import { observer } from "mobx-react";
import { ProjectModel } from "../models/project";

import alphaPattern from "../../static/alpha-pattern.png";

import { throttle } from "lodash";
import { Point } from "../common/point";

const RootDiv = styled.div`
    position: relative;
    overflow: hidden;
    flex: 1 1 auto;
`;

const StageCanvas = styled.canvas`
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    background-image: url(${alphaPattern});
`;

export interface ProjectStageViewProps {
    app: AppModel;
    project: ProjectModel;
}

interface SceneWebGlData {
    shaderProgram: WebGLProgram;

    positionBuffer: WebGLBuffer;
    vertexPosition: number;
    projectionMatrix: WebGLUniformLocation;
    modelViewMatrix: WebGLUniformLocation;

    aTextureCoordAttrib: number;
    uSamplerUniformLoc: WebGLUniformLocation;

    textureCoordBuffer: WebGLBuffer;
    baseTexture: WebGLTexture;
}

@observer
export class ProjectStageView extends React.Component<ProjectStageViewProps> {
    ref: HTMLCanvasElement | null = null;

    imageData: ImageData;
    dirtyPixels: boolean[];
    sceneData?: SceneWebGlData;

    isMouseDown = false;
    cursor?: Point;

    viewOffsetX = 0;
    viewOffsetY = 0;
    viewScale = 1;

    constructor(props: ProjectStageViewProps) {
        super(props);

        const width = props.project.width;
        const height = props.project.height;
        this.imageData = new ImageData(width, height);
        this.dirtyPixels = new Array<boolean>(width * height).fill(false);
    }

    ///////////////////////////////////////////////////////////////////////////
    /// LIFECYCLE
    ///////////////////////////////////////////////////////////////////////////

    componentDidMount(): void {
        void delayMs(1000).then(() => {
            this.updateImageData();
            this.drawScene();
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    /// MOUSE INPUT
    ///////////////////////////////////////////////////////////////////////////

    onClick: React.MouseEventHandler<HTMLCanvasElement> = e => {
        const project = this.props.project;

        const tool = project.tools.current;
        const newCursor = this.updateCursor(e.clientX, e.clientY);

        switch (tool.tool) {
            case Tool.Fill:
                {
                    const layer = project.activeLayer;
                    if (layer == null) return;

                    layer.fill(newCursor, project.primaryColor, tool.tolerance, this.dirtyPixels);

                    this.throttledUpdateImageData();
                }
                break;
            case Tool.Eraser:
                {
                    const layer = project.activeLayer;
                    if (layer == null) return;

                    layer.erasePoint(newCursor, tool.size, this.dirtyPixels);

                    this.throttledUpdateImageData();
                }
                break;
        }
    };

    onMouseDown: React.MouseEventHandler<HTMLCanvasElement> = () => {
        this.isMouseDown = true;
    };

    onMouseUp: React.MouseEventHandler<HTMLCanvasElement> = () => {
        this.isMouseDown = false;
    };

    onMouseOut: React.MouseEventHandler<HTMLCanvasElement> = () => {
        this.isMouseDown = false;
        this.cursor = undefined;
    };

    updateCursor(clientX: number, clientY: number): Point {
        const ref = asNotNil(this.ref);
        const bbox = ref.getBoundingClientRect();

        const canvasX = Math.round(clientX - bbox.left);
        const canvasY = Math.round(clientY - bbox.top);

        const newCursor = {
            x: Math.round(canvasX - this.viewOffsetX),
            y: Math.round(canvasY - this.viewOffsetY),
        };
        this.cursor = newCursor;

        return newCursor;
    }

    onMouseMove: React.MouseEventHandler<HTMLCanvasElement> = e => {
        const ref = this.ref;
        if (ref == null) return;
        const project = this.props.project;
        const bbox = ref.getBoundingClientRect();

        const canvasX = Math.round(e.clientX - bbox.left);
        const canvasY = Math.round(e.clientY - bbox.top);

        const newCursor = { x: canvasX - this.viewOffsetX, y: canvasY - this.viewOffsetY };
        const prevCursor = this.cursor ?? newCursor;
        this.cursor = newCursor;

        const tool = project.tools.current;

        switch (tool.tool) {
            case Tool.Pencil:
                {
                    if (this.isMouseDown) {
                        const layer = project.activeLayer;
                        if (layer != null) {
                            layer.drawLine(
                                prevCursor,
                                newCursor,
                                project.primaryColor,
                                1,
                                this.dirtyPixels
                            );
                            this.throttledUpdateImageData();
                        }
                    }
                }
                break;
            case Tool.Pan:
                {
                    if (this.isMouseDown) {
                        this.viewOffsetX += e.movementX;
                        this.viewOffsetY += e.movementY;
                        this.drawScene();
                    }
                }
                break;
            case Tool.Eraser:
                {
                    if (this.isMouseDown) {
                        const layer = project.activeLayer;
                        if (layer != null) {
                            layer.eraseLine(prevCursor, newCursor, tool.size, this.dirtyPixels);
                            this.throttledUpdateImageData();
                        }
                    }
                }
                break;
        }
    };

    onWheel: React.WheelEventHandler<HTMLCanvasElement> = e => {
        const wheelMult = 1 + (e.deltaX || e.deltaY || e.deltaZ) / 100;

        this.viewScale *= wheelMult;

        this.drawScene();
    };

    ///////////////////////////////////////////////////////////////////////////
    /// REFS
    ///////////////////////////////////////////////////////////////////////////

    onRef = (ref: HTMLCanvasElement | null) => {
        this.ref = ref;
    };

    ///////////////////////////////////////////////////////////////////////////
    /// WEBGL
    ///////////////////////////////////////////////////////////////////////////

    throttledUpdateImageData = throttle(
        () => {
            this.updateImageData();
            this.drawScene();
        },
        1000 / 10,
        {
            leading: true,
            trailing: true,
        }
    );

    updateImageData(): void {
        const project = this.props.project;

        blendImageDataLayersNormal(
            project.layers
                .filter(l => !l.hidden)
                .reverse()
                .map(l => l.image.value),
            this.dirtyPixels,
            this.imageData
        );
    }

    drawScene(): void {
        const ref = asNotNil(this.ref);
        const ctx = asNotNil(ref.getContext("2d"));

        ctx.clearRect(0, 0, ref.width, ref.height);
        ctx.putImageData(this.imageData, 0, 0);
    }

    openImage() {
        const canvas = document.createElement("canvas");
        canvas.width = this.imageData.width;
        canvas.height = this.imageData.height;
        const ctx = asNotNil(canvas.getContext("2d"));

        const imageData = ctx.getImageData(0, 0, this.imageData.width, this.imageData.height);
        for (let i = 0; i < this.imageData.data.length; i++) {
            imageData.data[i] = this.imageData.data[i];
        }

        ctx.putImageData(imageData, 0, 0);
        window.open(canvas.toDataURL());
    }

    ///////////////////////////////////////////////////////////////////////////
    /// REACT RENDERING
    ///////////////////////////////////////////////////////////////////////////

    render() {
        return (
            <RootDiv>
                <SizeMe monitorWidth monitorHeight>
                    {({ size }) => (
                        <StageCanvas
                            onClick={this.onClick}
                            width={size.width ?? 800}
                            height={size.height ?? 600}
                            onMouseDown={this.onMouseDown}
                            onMouseUp={this.onMouseUp}
                            onMouseMove={this.onMouseMove}
                            onMouseOut={this.onMouseOut}
                            onWheel={this.onWheel}
                            ref={this.onRef}
                        />
                    )}
                </SizeMe>
            </RootDiv>
        );
    }
}

function loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = asNotNil(gl.createShader(type), "Unable to create shader.");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    }

    return shader;
}
