import * as React from "react";
import styled from "styled-components";
import { Tool, ToolsModel } from "../models/tools";

import { Button, Icon, Colors, Popover } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import {
    faMousePointer,
    faFill,
    faPaintBrush,
    faEyeDropper,
} from "@fortawesome/free-solid-svg-icons";

import { observer } from "mobx-react";

import { ExternalIcon } from "../components/fa_icon";
import { AlphaBackdropDiv } from "../components/alpha_backdrop";
import { rgbToCss } from "../colors";
import { ProjectModel } from "../models/project";
import { RGBAPicker } from "../components/rgba_picker";
import { Vec4 } from "../util";

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
    color: Vec4;
}

const ColoredBox = observer((props: ColoredBoxProps) => {
    return (
        <Popover interactionKind="click">
            <AlphaBackdropDiv>
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

export const ToolboxView = observer(
    (props: ToolboxProps): JSX.Element => {
        const { project } = props;
        const tool = project.tools.current;

        return (
            <RootDiv>
                <SelectionHeader>Selection</SelectionHeader>
                <ToolSelectDiv>
                    <Button
                        title="Select"
                        active={tool.tool === Tool.Select}
                        onClick={() => project.tools.setCurrent(Tool.Select)}
                    >
                        <ExternalIcon icon={faMousePointer} />
                    </Button>
                    <Button
                        title="Pan"
                        icon={IconNames.HAND}
                        active={tool.tool === Tool.Pan}
                        onClick={() => project.tools.setCurrent(Tool.Pan)}
                    />
                </ToolSelectDiv>
                <SelectionHeader>Draw/Paint</SelectionHeader>
                <ToolSelectDiv>
                    <Button
                        title="Pencil"
                        icon={IconNames.EDIT}
                        active={tool.tool === Tool.Pencil}
                        onClick={() => project.tools.setCurrent(Tool.Pencil)}
                    />
                    <Button
                        title="Brush"
                        active={tool.tool === Tool.Brush}
                        onClick={() => project.tools.setCurrent(Tool.Brush)}
                    >
                        <ExternalIcon icon={faPaintBrush} />
                    </Button>
                    <Button
                        title="Eraser"
                        icon={IconNames.ERASER}
                        active={tool.tool === Tool.Eraser}
                        onClick={() => project.tools.setCurrent(Tool.Eraser)}
                    />
                </ToolSelectDiv>
                <SelectionHeader>Other</SelectionHeader>
                <ToolSelectDiv>
                    <Button
                        title="Fill"
                        active={tool.tool === Tool.Fill}
                        onClick={() => project.tools.setCurrent(Tool.Fill)}
                    >
                        <ExternalIcon icon={faFill} />
                    </Button>
                    <Button
                        title="Pick a color."
                        active={tool.tool === Tool.Eyedropper}
                        onClick={() => project.tools.setCurrent(Tool.Eyedropper)}
                    >
                        <ExternalIcon icon={faEyeDropper} />
                    </Button>
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
