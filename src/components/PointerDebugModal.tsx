import * as React from "react";
import { observer } from "mobx-react";
import { Dialog, Classes, ProgressBar, Label, Tag, Button } from "@blueprintjs/core";
import styled from "styled-components";
import { mapRange } from "../common/util";
import alphaPatternUrl from "../../static/alpha-pattern.png";
import { useNotifyState } from "../common/notifier";
import { AlphaBackdropDiv } from "./alpha_backdrop";
import { MouseEventLayers } from "../common/react";

export interface PointerDebugModalProps {
    open?: boolean;
    onClose?(): void;
}

const DialogBody = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0px 16px;
`;

const PEN_ZONE_SIZE = 512;

const PenZoneCanvas = styled.canvas`
    user-select: none;
    touch-action: none;

    height: ${PEN_ZONE_SIZE}px;
    width: ${PEN_ZONE_SIZE}px;
`;

const TagsDiv = styled.div`
    display: flex;
    flex-direction: row;
`;

interface State {
    pointerType?: string;

    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;

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
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [state, setState] = React.useState<State>({
        tiltX: 0,
        tiltY: 0,
        pressure: 0,
        shiftKey: false,
        ctrlKey: false,
        twist: 0,
        pressed: false,
        eraser: false,
        sideButton: false,
        altKey: false,
    });

    return (
        <Dialog
            canOutsideClickClose
            isCloseButtonShown
            isOpen={props.open}
            onClose={() => props.onClose?.()}
            title="Pointer Debug"
            style={{ width: "auto" }}
        >
            <DialogBody>
                <AlphaBackdropDiv>
                    <PenZoneCanvas
                        ref={canvasRef}
                        width={PEN_ZONE_SIZE}
                        height={PEN_ZONE_SIZE}
                        onPointerMove={onPointerEvent}
                        onPointerDown={onPointerEvent}
                        onPointerUp={onPointerEvent}
                        onContextMenu={e => e.preventDefault()}
                    />
                </AlphaBackdropDiv>
                <TagsDiv style={{ marginBottom: 16 }}>
                    <Button text="Clear" onClick={() => clearCanvas()} />
                </TagsDiv>

                <TagsDiv>
                    <Tag intent={state.pointerType === "mouse" ? "primary" : "none"}>Mouse</Tag>
                    <Tag intent={state.pointerType === "pen" ? "primary" : "none"}>Pen</Tag>
                </TagsDiv>

                <TagsDiv>
                    <Tag intent={state.ctrlKey ? "primary" : "none"}>Ctrl</Tag>
                    <Tag intent={state.shiftKey ? "primary" : "none"}>Shift</Tag>
                    <Tag intent={state.altKey ? "primary" : "none"}>Alt</Tag>
                </TagsDiv>

                <TagsDiv>
                    <Tag intent={state.pressed ? "primary" : "none"}>Primary</Tag>
                    <Tag intent={state.eraser ? "primary" : "none"}>Eraser</Tag>
                    <Tag intent={state.sideButton ? "primary" : "none"}>Side</Tag>
                </TagsDiv>

                <Label>
                    Pressure ({(state.pressure * 100).toFixed(2)}%)
                    <ProgressBar animate={false} stripes={false} value={state.pressure} />
                </Label>
                <Label>
                    Twist ({state.twist})
                    <ProgressBar animate={false} stripes={false} value={state.twist} />
                </Label>
                <Label>
                    Tilt ({state.tiltX}°, {state.tiltY}°)
                    <ProgressBar
                        stripes={false}
                        animate={false}
                        value={mapRange(state.tiltX, TILT_MIN, TILT_MAX, 0, 1)}
                    />
                    <ProgressBar
                        stripes={false}
                        animate={false}
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
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
        });

        const canvasEl = canvasRef.current;
        if (canvasEl == null) return;

        if (event.pressure === 0) return;

        const ctx = canvasEl.getContext("2d");
        if (ctx == null) return;

        const bbox = canvasEl.getBoundingClientRect();

        const x = event.clientX - bbox.left;
        const y = event.clientY - bbox.top;

        if (event.buttons === 1) {
            const rad = event.pressure * (event.shiftKey ? 5 : 10);
            ctx.fillStyle = `hsla(${(Math.random() * 360).toFixed(2)}, 100%, 50%, 1.0)`;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.ellipse(
                x,
                y,
                rad * Math.cos((event.tiltX / 180) * Math.PI),
                rad * Math.cos((event.tiltY / 180) * Math.PI),
                0,
                0,
                2 * Math.PI
            );
            ctx.fill();
        } else if (event.buttons === 32) {
            const rad = event.pressure * (event.shiftKey ? 10 : 20);
            const prevCompOp = ctx.globalCompositeOperation;
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.ellipse(
                x,
                y,
                rad * Math.cos((event.tiltX / 180) * Math.PI),
                rad * Math.cos((event.tiltY / 180) * Math.PI),
                0,
                0,
                2 * Math.PI
            );
            ctx.fill();
            ctx.globalCompositeOperation = prevCompOp;
        }
    }

    function clearCanvas() {
        const canvasEl = canvasRef.current;
        if (canvasEl == null) return;
        const ctx = canvasEl.getContext("2d");
        if (ctx == null) return;

        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
});
