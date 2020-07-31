import * as React from "react";
import { observer } from "mobx-react";
import { Dialog, Classes, ProgressBar, Label, Tag, Button } from "@blueprintjs/core";
import styled from "styled-components";
import { mapRange } from "../common/util";

export interface PointerDebugModalProps {
    open?: boolean;
    onClose?(): void;
}

const DialogBody = styled.div`
    border: 1px solid black;
    padding: 32px;
    user-select: none;
    touch-action: manipulation;

    display: flex;
    flex-direction: column;
`;

const TagsDiv = styled.div`
    display: flex;
    flex-direction: row;
`;

interface State {
    pointerType?: string;
    pressure: number;
    twist: number;
    tiltX: number;
    tiltY: number;

    pressed: boolean;
    sideButton: boolean;
    eraser: boolean;
}

const TILT_MIN = -90;
const TILT_MAX = 90;

export default observer((props: PointerDebugModalProps) => {
    const bodyRef = React.useRef<HTMLDivElement>(null);
    const [state, setState] = React.useState<State>({
        tiltX: 0,
        tiltY: 0,
        pressure: 0,
        twist: 0,
        pressed: false,
        eraser: false,
        sideButton: false,
    });

    return (
        <Dialog
            canOutsideClickClose
            isCloseButtonShown
            isOpen={props.open}
            onClose={() => props.onClose?.()}
            title="Pointer Debug"
        >
            <DialogBody
                ref={bodyRef}
                onPointerMove={onPointerEvent}
                onPointerDown={onPointerEvent}
                onPointerUp={onPointerEvent}
                onPointerEnter={onPointerEvent}
                onPointerOver={onPointerEvent}
                className={Classes.DIALOG_BODY}
                onContextMenu={e => e.preventDefault()}
            >
                <TagsDiv>
                    <Tag intent={state.pressed ? "primary" : "none"}>Primary</Tag>
                    <Tag intent={state.eraser ? "primary" : "none"}>Eraser</Tag>
                    <Tag intent={state.sideButton ? "primary" : "none"}>Side</Tag>
                </TagsDiv>
                <Label>
                    Pressure ({state.pressure})
                    <ProgressBar stripes={false} value={state.pressure} />
                </Label>
                <Label>
                    Twist ({state.twist})
                    <ProgressBar stripes={false} value={state.twist} />
                </Label>
                <Label>
                    Tilt ({state.tiltX}, {state.tiltY})
                    <ProgressBar
                        stripes={false}
                        value={mapRange(state.tiltX, TILT_MIN, TILT_MAX, 0, 1)}
                    />
                    <ProgressBar
                        stripes={false}
                        value={mapRange(state.tiltY, TILT_MIN, TILT_MAX, 0, 1)}
                    />
                </Label>
            </DialogBody>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button text="Close" onClick={() => props.onClose?.()} />
                </div>
            </div>
        </Dialog>
    );

    function onPointerEvent(event: React.PointerEvent) {
        if (event.pointerType !== "pen") {
            return;
        }

        event.preventDefault();
        setState({
            pressure: event.pressure,
            tiltX: event.tiltX,
            tiltY: event.tiltY,
            twist: event.twist,
            pointerType: event.pointerType,
            pressed: event.buttons === 1,
            sideButton: event.buttons === 2,
            eraser: event.buttons === 32,
        });
    }
});
