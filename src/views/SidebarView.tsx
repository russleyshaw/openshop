import * as React from "react";
import styled from "styled-components";

import { observer } from "mobx-react";
import { ProjectModel, Tool } from "../models/project";

import { Button, Colors, Slider, Label, EditableText, NumericInput } from "@blueprintjs/core";

import LayerEntryView from "./LayerEntryView";

const RootDiv = styled.div`
    display: flex;
    flex-direction: column;
    width: 400px;
`;

const LayersDiv = styled.div`
    display: flex;
    flex-direction: column;
`;

const HeaderDiv = styled.div`
    padding: 4px;
    background-color: ${Colors.DARK_GRAY1};
    margin-bottom: 8px;
`;

const LayersHeaderDiv = styled(HeaderDiv)`
    display: grid;
    align-items: center;
    grid-template:
        [row1-start] "title add delete" auto [row1-end]
        / 1fr auto auto;

    gap: 2px 2px;
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
                    <Label>
                        Size {project.pencilSize}px
                        <Slider
                            value={project.pencilSize}
                            min={1}
                            stepSize={1}
                            labelStepSize={99}
                            max={100}
                            onChange={v => (project.pencilSize = v)}
                        />
                    </Label>
                </React.Fragment>
            )}
            {tool === Tool.Fill && (
                <React.Fragment>
                    <HeaderDiv>Fill Properties</HeaderDiv>
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
                </React.Fragment>
            )}
            {tool === Tool.Eraser && (
                <React.Fragment>
                    <HeaderDiv>Eraser Properties</HeaderDiv>
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
                </React.Fragment>
            )}

            <LayersHeaderDiv>
                <div style={{ gridArea: "title" }}>Layers</div>
                <Button onClick={() => project.addLayer()} style={{ gridArea: "add" }} small />
                <Button
                    onClick={() => (layer ? project.deleteLayer(layer.uuid) : undefined)}
                    style={{ gridArea: "delete" }}
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
