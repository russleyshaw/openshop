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
import { RGBAPicker } from "../components/rgba_picker";
import { IconNames } from "@blueprintjs/icons";
import { useDrop } from "react-dnd";
import { ITEM_TYPES, PaletteColorItem } from "../common/dnd";

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
}

const ColoredBox = observer((props: ColoredBoxProps) => {
    const [, dropRef] = useDrop<PaletteColorItem, {}, {}>({
        accept: ITEM_TYPES.paletteColor,
        drop: item => Object.assign(props.color, item.color),
    });

    return (
        <Popover interactionKind="click">
            <AlphaBackdropDiv ref={dropRef}>
                <div
                    title={props.title}
                    style={{
                        backgroundColor: rgbToCss(props.color),
                        border: "1px solid black",
                        height: 32,
                        width: 32,
                    }}
                ></div>
            </AlphaBackdropDiv>
            <RGBAPicker color={props.color} onColorChange={c => Object.assign(props.color, c)} />
        </Popover>
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
                    <ColoredBox color={project.primaryColor} title="Primary" />
                    <ColoredBox color={project.secondaryColor} title="Secondary" />
                </ColorSelectDiv>
                <div></div>
            </RootDiv>
        );
    }
);
