import * as React from "react";
import styled from "styled-components";
import { throttle } from "lodash";
import { observer } from "mobx-react";
import { Colors, Button, Icon } from "@blueprintjs/core";

import { ProjectModel } from "../models/project";
import { LayerModel } from "../models/layer";
import { AlphaBackdropDiv } from "../components/alpha_backdrop";
import { useNotify } from "../common/notifier";
import { IconNames } from "@blueprintjs/icons";
import { F32ImageData } from "../models/f32_image_data";

export interface LayerViewProps {
    project: ProjectModel;
    layer: LayerModel;
}

const RootDiv = styled.div<{ selected: boolean }>`
    display: grid;
    grid-template:
        [row1-start] "preview title active" 1fr [row1-end]
        [row1-start] "preview buttons buttons" 1fr [row1-end]
        / auto 1fr;

    margin: 2px 0px;
    padding: 4px;

    user-select: none;
    background-color: ${props => (props.selected ? Colors.DARK_GRAY1 : Colors.DARK_GRAY2)};
    ${props => props.selected && `border: 1px ${Colors.BLUE5} solid;`}
    &:hover {
        background-color: rgba(0, 0, 0, 0.25);
    }
`;

const LayerName = styled.div`
    text-overflow: ellipsis;
    overflow: hidden;
`;

const draw = throttle((canvas: HTMLCanvasElement | null, image: F32ImageData) => {
    const ref = canvas;
    if (ref == null) return;
    const ctx = ref.getContext("2d");
    if (ctx == null) return;

    ctx.clearRect(0, 0, ref.width, ref.height);
    ctx.putImageData(image.toImageData(), 0, 0);
}, 1000);

export default observer((props: LayerViewProps) => {
    const { project, layer } = props;
    console.log("Render layer");

    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const active = layer.uuid === project.selectedLayerUuid;

    useNotify(layer.image, img => draw(canvasRef.current, img));

    return (
        <RootDiv onClick={() => project.setSelectedLayer(layer.uuid)} selected={active}>
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
            {active ? (
                <Icon htmlTitle="This layer is the currently selected layer." icon="tick-circle" />
            ) : (
                ""
            )}
            <div
                style={{
                    gridArea: "buttons",
                    justifySelf: "end",
                    alignSelf: "end",
                }}
            >
                <Button
                    onClick={() => (layer.hidden = !layer.hidden)}
                    icon={layer.hidden ? IconNames.EYE_OFF : IconNames.EYE_OPEN}
                    title={layer.hidden ? "Show layer." : "Hide layer."}
                />
            </div>
        </RootDiv>
    );
});
