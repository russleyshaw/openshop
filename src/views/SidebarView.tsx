import * as React from "react";
import styled from "styled-components";

import { observer } from "mobx-react";
import { ProjectModel, Tool, MAX_PENCIL_SIZE, MIN_PENCIL_SIZE } from "../models/project";

import { Button, Colors, Slider, Label } from "@blueprintjs/core";

import LayerEntryView from "./LayerEntryView";
import { IconNames } from "@blueprintjs/icons";
import ColorSquare from "../components/ColorSquare";

const RootDiv = styled.div`
    display: flex;
    flex-direction: column;
    width: 400px;
    border: 1px solid ${Colors.DARK_GRAY1};
`;

const LayersDiv = styled.div`
    display: flex;
    flex-direction: column;
`;

const HeaderDiv = styled.div`
    padding: 4px;
    background-color: ${Colors.DARK_GRAY1};
`;

const LayersHeaderDiv = styled(HeaderDiv)`
    display: grid;
    align-items: center;
    grid-template:
        [row1-start] "title add delete" auto [row1-end]
        / 1fr auto auto;

    gap: 2px 2px;
`;

const PalettesHeaderDiv = styled(HeaderDiv)`
    display: grid;
    align-items: center;
    grid-template:
        [row1-start] "title add delete" auto [row1-end]
        / 1fr auto auto;

    gap: 2px 2px;
`;

const PalettesDiv = styled.div`
    display: flex;
    flex-direction: row;
    margin: 8px;
    gap: 4px;
`;

const SliderDiv = styled.div`
    margin: 0px 16px;
`;

export interface SidebarViewProps {
    project: ProjectModel;
}

export default observer((props: SidebarViewProps) => {
    const { project } = props;
    const layer = project.selectedLayer;
    const tool = project.selectedTool;

    return (
        <RootDiv>
            {tool === Tool.Pencil && (
                <React.Fragment>
                    <HeaderDiv>Pencil Properties</HeaderDiv>
                    <SliderDiv>
                        <Label>
                            Size {project.pencilSize}px
                            <Slider
                                value={project.pencilSize}
                                min={MIN_PENCIL_SIZE}
                                stepSize={1}
                                labelStepSize={MAX_PENCIL_SIZE - MIN_PENCIL_SIZE}
                                max={MAX_PENCIL_SIZE}
                                onChange={v => (project.pencilSize = v)}
                            />
                        </Label>
                    </SliderDiv>
                </React.Fragment>
            )}
            {tool === Tool.Fill && (
                <React.Fragment>
                    <HeaderDiv>Fill Properties</HeaderDiv>
                    <SliderDiv>
                        <Label>
                            Tolerance {project.fillTolerance}
                            <Slider
                                value={project.fillTolerance}
                                min={0}
                                stepSize={1}
                                labelStepSize={255}
                                max={255}
                                onChange={v => (project.fillTolerance = v)}
                            />
                        </Label>
                    </SliderDiv>
                </React.Fragment>
            )}
            {tool === Tool.Eraser && (
                <React.Fragment>
                    <HeaderDiv>Eraser Properties</HeaderDiv>
                    <SliderDiv>
                        <Label>
                            Size {project.eraserSize}px
                            <Slider
                                value={project.eraserSize}
                                min={1}
                                stepSize={1}
                                labelStepSize={99}
                                max={100}
                                onChange={v => (project.eraserSize = v)}
                            />
                        </Label>
                    </SliderDiv>
                </React.Fragment>
            )}
            {tool === Tool.Brush && (
                <React.Fragment>
                    <HeaderDiv>Brush Properties</HeaderDiv>
                    <SliderDiv>
                        <Label>
                            Size {project.brushSize}px
                            <Slider
                                value={project.brushSize}
                                min={1}
                                stepSize={1}
                                labelStepSize={99}
                                max={100}
                                onChange={v => (project.brushSize = v)}
                            />
                        </Label>

                        <Label>
                            Feather {(100 * project.brushFeather).toFixed(2)}%
                            <Slider
                                value={project.brushFeather}
                                min={0}
                                stepSize={0.001}
                                labelStepSize={1}
                                max={1}
                                onChange={v => (project.brushFeather = v)}
                            />
                        </Label>
                    </SliderDiv>
                </React.Fragment>
            )}

            {project.palettes.length > 0 && (
                <React.Fragment>
                    <PalettesHeaderDiv>
                        <div style={{ gridArea: "title" }}>Palettes</div>
                        <Button
                            style={{ gridArea: "add" }}
                            small
                            icon={IconNames.PLUS}
                            title="Add new pallete"
                        />
                        <Button
                            disabled={project.selectedPaletteUuid == null}
                            style={{ gridArea: "delete" }}
                            small
                            icon={IconNames.TRASH}
                            title="Delete selected palette"
                        />
                    </PalettesHeaderDiv>
                    <PalettesDiv>
                        {project.palettes.map((p, idx) => (
                            <ColorSquare
                                selected={p.uuid === project.selectedPaletteUuid}
                                onClick={() => project.setSelectedPalette(p.uuid)}
                                key={p.uuid}
                                color={p.color}
                            />
                        ))}
                    </PalettesDiv>
                </React.Fragment>
            )}

            <LayersHeaderDiv>
                <div style={{ gridArea: "title" }}>Layers</div>
                <Button
                    icon={IconNames.PLUS}
                    onClick={() => project.addNewEmptyLayer()}
                    style={{ gridArea: "add" }}
                    title="Add new layer."
                    small
                />
                <Button
                    icon={IconNames.TRASH}
                    onClick={() => (layer ? project.deleteLayer(layer.uuid) : undefined)}
                    style={{ gridArea: "delete" }}
                    title="Delete selected layer."
                    small
                />
            </LayersHeaderDiv>
            <LayersDiv>
                {project.layers.map(layer => (
                    <LayerEntryView key={layer.uuid} project={project} layer={layer} />
                ))}
            </LayersDiv>
        </RootDiv>
    );
});
