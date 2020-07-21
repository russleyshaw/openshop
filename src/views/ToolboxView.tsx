import * as React from "react";
import styled from "styled-components";

import { Button, Colors, Popover } from "@blueprintjs/core";

import {
    faMousePointer,
    faFill,
    faPaintBrush,
    faEyeDropper,
    faEdit,
    faPencilAlt,
    faEraser,
} from "@fortawesome/free-solid-svg-icons";

import { observer } from "mobx-react";

import { FaIcon } from "../components/fa_icon";
import { AlphaBackdropDiv } from "../components/alpha_backdrop";
import { rgbToCss, RGBA } from "../common/colors";
import { ProjectModel, Tool } from "../models/project";
import ColorPickerModal from "../components/ColorPickerModal";
import { IconNames } from "@blueprintjs/icons";
import { useDrop } from "react-dnd";
import { ITEM_TYPES, PaletteColorItem } from "../common/dnd";
import { PaletteModel } from "../models/palette";
import ColorSquare from "../components/ColorSquare";

const RootDiv = styled.div`
    display: flex;
    flex-direction: column;
    border-right: 1px solid black;
`;

const ToolSelectDiv = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 4px;
    margin: 4px;
`;

export interface ToolboxProps {
    project: ProjectModel;
}

const SelectionHeader = styled.div`
    background-color: ${Colors.DARK_GRAY1};
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 4px 0px;

    margin-top: 8px;
    :first-child {
        margin-top: 0px;
    }
`;

const ColorSelectDiv = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 4px;
    gap: 4px;
`;

interface ColoredBoxProps {
    title?: string;
    color: RGBA;
    palette: PaletteModel;
}

const ColoredBox = observer((props: ColoredBoxProps) => {
    const target = <ColorSquare color={props.color} />;

    return (
        <ColorPickerModal
            palette={props.palette}
            target={target}
            color={props.color}
            onColorSelect={c => Object.assign(props.color, c)}
        ></ColorPickerModal>
    );
});

export default observer(
    (props: ToolboxProps): JSX.Element => {
        const { project } = props;
        const tool = project.selectedTool;

        return (
            <RootDiv>
                <SelectionHeader>Selection</SelectionHeader>
                <ToolSelectDiv>
                    <Button
                        title="Select"
                        active={tool === Tool.Select}
                        onClick={() => project.setSelectedTool(Tool.Select)}
                    >
                        <FaIcon icon={faMousePointer} />
                    </Button>
                    <Button
                        title="Pan"
                        icon={IconNames.HAND}
                        active={tool === Tool.Pan}
                        onClick={() => project.setSelectedTool(Tool.Pan)}
                    />
                </ToolSelectDiv>
                <SelectionHeader>Draw/Paint</SelectionHeader>
                <ToolSelectDiv>
                    <Button
                        title="Pencil"
                        icon={<FaIcon icon={faPencilAlt} />}
                        active={tool === Tool.Pencil}
                        onClick={() => project.setSelectedTool(Tool.Pencil)}
                    />
                    <Button
                        title="Brush"
                        icon={<FaIcon icon={faPaintBrush} />}
                        active={tool === Tool.Brush}
                        onClick={() => project.setSelectedTool(Tool.Brush)}
                    />
                    <Button
                        title="Eraser"
                        icon={<FaIcon icon={faEraser} />}
                        active={tool === Tool.Eraser}
                        onClick={() => project.setSelectedTool(Tool.Eraser)}
                    />
                </ToolSelectDiv>
                <SelectionHeader>Other</SelectionHeader>
                <ToolSelectDiv>
                    <Button
                        title="Fill"
                        icon={<FaIcon icon={faFill} />}
                        active={tool === Tool.Fill}
                        onClick={() => project.setSelectedTool(Tool.Fill)}
                    />
                    <Button
                        title="Pick a color."
                        icon={<FaIcon icon={faEyeDropper} />}
                        active={tool === Tool.Eyedropper}
                        onClick={() => project.setSelectedTool(Tool.Eyedropper)}
                    />
                </ToolSelectDiv>

                <SelectionHeader>Colors</SelectionHeader>
                <ColorSelectDiv>
                    <ColoredBox
                        palette={project.palette}
                        color={project.primaryColor}
                        title="Primary"
                    />
                    <ColoredBox
                        palette={project.palette}
                        color={project.secondaryColor}
                        title="Secondary"
                    />
                </ColorSelectDiv>
                <div></div>
            </RootDiv>
        );
    }
);
