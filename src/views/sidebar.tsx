import * as React from "react";
import styled from "styled-components";

import { observer } from "mobx-react";
import { ProjectModel } from "../models/project";

import { LayerModel } from "../models/layer";
import { Button, Colors } from "@blueprintjs/core";
import { AlphaBackdropDiv } from "../components/alpha_backdrop";
import { useNotify } from "../common/notifier";
import { throttle } from "lodash";

const RootDiv = styled.div`
    display: flex;
    flex-direction: column;
    width: 400px;
    border-left: 1px solid black;
`;

const LayersDiv = styled.div`
    display: flex;
    flex-direction: column;
`;

const LayerDiv = styled.div<{ selected?: boolean }>`
    display: grid;
    grid-template:
        [row1-start] "preview title" 1fr [row1-end]
        [row1-start] "preview buttons" 1fr [row1-end]
        / auto 1fr;

    margin-top: 8px;
    :first-child {
        margin-top: 0px;
    }

    user-select: none;
    ${props => props.selected == true && `background-color: ${Colors.DARK_GRAY1};`}
    &:hover {
        background-color: rgba(0, 0, 0, 0.25);
    }
`;

const LayerName = styled.div`
    text-overflow: ellipsis;
    overflow: hidden;
`;

const HeaderDiv = styled.div`
    display: grid;
    background-color: ${Colors.DARK_GRAY1};
    grid-template:
        [row1-start] "title add delete" auto [row1-end]
        / 1fr auto auto;

    gap: 2px 2px;

    padding: 4px;
    margin-bottom: 8px;
`;

export interface SidebarViewProps {
    project: ProjectModel;
}

export const SidebarView = observer((props: SidebarViewProps) => {
    const { project } = props;
    const activeLayer = project.activeLayer;

    return (
        <RootDiv>
            <HeaderDiv>
                <div style={{ gridArea: "title" }}>Layers</div>
                <Button onClick={() => project.addLayer()} style={{ gridArea: "add" }} small />
                <Button
                    onClick={() =>
                        activeLayer ? project.deleteLayer(activeLayer.uuid) : undefined
                    }
                    style={{ gridArea: "delete" }}
                    small
                />
            </HeaderDiv>
            <LayersDiv>
                {project.layers.map((layer, idx) => {
                    const isActive = activeLayer === layer;

                    return (
                        <LayerView
                            key={layer.uuid}
                            project={project}
                            layer={layer}
                            active={isActive}
                        />
                    );
                })}
            </LayersDiv>
        </RootDiv>
    );
});

export interface LayerViewProps {
    project: ProjectModel;
    layer: LayerModel;
    active: boolean;
}

export const LayerView = observer((props: LayerViewProps) => {
    const { project, active, layer } = props;
    console.log("Render layer");

    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    useNotify(layer.image, img => draw(canvasRef.current, img));

    return (
        <LayerDiv onClick={() => project.setActiveLayer(layer.uuid)} selected={active}>
            <AlphaBackdropDiv
                style={{ marginRight: 8, width: 128, height: 128, gridArea: "preview" }}
            >
                <canvas
                    style={{
                        width: 128,
                        height: 128,
                    }}
                    ref={canvasRef}
                    width={project.width}
                    height={project.height}
                ></canvas>
            </AlphaBackdropDiv>
            <LayerName style={{ gridArea: "title" }}>{layer.name}</LayerName>
            <div
                style={{
                    gridArea: "buttons",
                    justifySelf: "end",
                    alignSelf: "end",
                }}
            >
                <Button
                    onClick={() => (layer.hidden = !layer.hidden)}
                    title={layer.hidden ? "Show layer." : "Hide layer."}
                />
            </div>
        </LayerDiv>
    );
});

const draw = throttle((canvas: HTMLCanvasElement | null, image: ImageData) => {
    const ref = canvas;
    if (ref == null) return;
    const ctx = ref.getContext("2d");
    if (ctx == null) return;

    ctx.clearRect(0, 0, ref.width, ref.height);
    ctx.putImageData(image, 0, 0);
}, 1000);
