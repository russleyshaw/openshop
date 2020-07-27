import * as React from "react";
import { observer } from "mobx-react";
import { useDrag } from "react-dnd";

import { RGBA, rgbToCss, RGB } from "../common/colors";
import styled from "styled-components";
import { AlphaBackdropDiv } from "./alpha_backdrop";
import { PaletteColorItem, ITEM_TYPES } from "../common/dnd";
import { Colors } from "@blueprintjs/core";

export interface ColorSquareProps {
    color: RGB | RGBA;
    selected?: boolean;
    onClick?: React.MouseEventHandler;
}

const SIZE = 32;

const RootDiv = styled.div<{ selected: boolean }>`
    border: 1px solid ${props => (props.selected ? Colors.BLUE5 : Colors.BLACK)};
    width: ${SIZE}px;
    height: ${SIZE}px;
    display: flex;
    flex-direction: row;
`;

const BackdropDiv = styled(AlphaBackdropDiv)`
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
`;

const SquareDiv = styled.div`
    flex: 1 1 auto;
`;

export default observer((props: ColorSquareProps) => {
    const cssColor = rgbToCss(props.color);
    console.log("CSS", cssColor);

    return (
        <RootDiv title={cssColor} selected={props.selected ?? false} onClick={props.onClick}>
            <BackdropDiv>
                <SquareDiv style={{ backgroundColor: cssColor }}></SquareDiv>
            </BackdropDiv>
        </RootDiv>
    );
});
