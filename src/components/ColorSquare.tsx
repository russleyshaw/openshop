import * as React from "react";
import { observer } from "mobx-react";
import { useDrag } from "react-dnd";

import { RGBA, rgbToCss } from "../common/colors";
import styled from "styled-components";
import { AlphaBackdropDiv } from "./alpha_backdrop";
import { PaletteColorItem, ITEM_TYPES } from "../common/dnd";
import { Colors } from "@blueprintjs/core";

export interface ColorSquareProps {
    color: RGBA;
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
    const [{ opacity }, dragRef] = useDrag<PaletteColorItem, unknown, { opacity: number }>({
        item: { type: ITEM_TYPES.paletteColor, color: props.color },
        collect(monitor) {
            return { opacity: monitor.isDragging() ? 0.5 : 1 };
        },
    });

    return (
        <RootDiv
            selected={props.selected ?? false}
            onClick={props.onClick}
            ref={dragRef}
            style={{ opacity }}
        >
            <BackdropDiv>
                <SquareDiv style={{ backgroundColor: rgbToCss(props.color) }}></SquareDiv>
            </BackdropDiv>
        </RootDiv>
    );
});
