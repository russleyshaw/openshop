import * as React from "react";
import styled from "styled-components";
import { observer, useLocalStore } from "mobx-react";
import { Dialog, Classes, Button, Intent, NumericInput, Label, Slider } from "@blueprintjs/core";

import { RGBA, RGB, rgbTo8bit, rgbToHsl, HSL, hslToRgb, HSLA, colorCopy } from "../common/colors";
import { PaletteModel } from "../models/palette";
import { SizeMe } from "react-sizeme";
import { useResize, useInterval } from "../common/react";

import alphaPattern from "../../static/alpha-pattern.png";
import { observable, action } from "mobx";

const Canvas = styled.canvas`
    height: 256px;
    background-image: url(${alphaPattern});
    margin-bottom: 16px;
`;

export interface ColorPickerModalProps {
    title?: string;
    color: RGBA;
    onColorSelect(color: RGBA): void;

    palette?: PaletteModel;

    target: JSX.Element;
}

const DialogBody = styled.div`
    display: flex;
    flex-direction: column;
`;

const InputsDiv = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
`;

class Model {
    canvasRef: HTMLCanvasElement | null = null;
    backdrop: ImageData = new ImageData(1, 1);

    @observable
    isOpen: boolean = false;

    @observable
    hslColor: HSL = [0, 0, 0];

    @observable
    rgbColor: RGB = [0, 0, 0];

    @observable
    alpha: number = 0;

    constructor(initialColor: RGBA) {
        rgbToHsl(this.hslColor, initialColor);
    }

    onCanvasRefUpdate = (ref: HTMLCanvasElement | null) => {
        this.canvasRef = ref;
    };

    @action
    setOpen(open: boolean): void {
        this.isOpen = open;
    }

    @action
    setRgb(color: RGB): void {
        colorCopy(color, this.rgbColor);
        rgbToHsl(this.rgbColor, this.hslColor);
        this.drawCanvas();
    }

    @action
    setHsl(color: HSL): void {
        colorCopy(color, this.hslColor);
        hslToRgb(this.hslColor, this.rgbColor);
        this.drawCanvas();
    }

    drawCanvas(): void {
        const ref = this.canvasRef;
        if (ref == null) return;
        const ctx = ref.getContext("2d");
        if (ctx == null) return;

        // const label = "ColorPickerModal::drawCanvas";
        // console.time(label);

        const bbox = ref.getBoundingClientRect();

        let x = 0;
        let y = 0;
        let rgbIdx = 0;
        const hslColor: HSL = [0, 0, 0];
        const rgbColor: RGB = [0, 0, 0];

        if (
            ref.width !== bbox.width ||
            ref.height !== bbox.height ||
            this.backdrop.width !== bbox.width ||
            this.backdrop.height !== bbox.height
        ) {
            // Rebuild backing HSL image data;
            ref.width = bbox.width;
            ref.height = bbox.height;

            this.backdrop = new ImageData(ref.width, ref.height);

            for (y = 0; y < ref.height; y++) {
                for (x = 0; x < ref.width; x++) {
                    rgbIdx = Math.floor((y * ref.width + x) * 4);

                    hslColor[0] = (x / ref.width) * 360;
                    hslColor[1] = 1.0;
                    hslColor[2] = y / ref.height;

                    hslToRgb(hslColor, rgbColor);
                    rgbTo8bit(rgbColor, rgbColor);

                    this.backdrop.data[rgbIdx + 0] = rgbColor[0];
                    this.backdrop.data[rgbIdx + 1] = rgbColor[1];
                    this.backdrop.data[rgbIdx + 2] = rgbColor[2];
                    this.backdrop.data[rgbIdx + 3] = 255;
                }
            }
        }

        ctx.clearRect(0, 0, ref.width, ref.height);

        ctx.putImageData(this.backdrop, 0, 0);

        // Render Color
        colorCopy(this.hslColor, hslColor);

        x = Math.floor((hslColor[0] / 360) * ref.width);
        y = Math.floor(hslColor[2] * ref.height);

        ctx.beginPath();
        ctx.strokeStyle = hslColor[2] > 0.5 ? "black" : "white";
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.stroke();

        // console.timeEnd(label);
    }
}

const MINOR_STEP_SIZE = 0.01;
const STEP_SIZE = 0.1;

export default observer((props: ColorPickerModalProps) => {
    const model = useLocalStore(() => new Model(props.color));

    useInterval(() => model.drawCanvas(), model.isOpen && 1000);

    return (
        <React.Fragment>
            <div onClick={() => model.setOpen(true)}>{props.target}</div>
            <Dialog
                lazy
                canEscapeKeyClose
                canOutsideClickClose
                isCloseButtonShown
                isOpen={model.isOpen}
                title={props.title ?? "Pick A Color"}
                onClose={() => model.setOpen(false)}
                onOpening={() => model.drawCanvas()}
            >
                <DialogBody className={Classes.DIALOG_BODY}>
                    <Canvas ref={model.onCanvasRefUpdate} />
                    <InputsDiv>
                        <Label>
                            Red
                            <NumericInput
                                min={0}
                                max={1}
                                stepSize={STEP_SIZE}
                                minorStepSize={MINOR_STEP_SIZE}
                                value={model.rgbColor[0]}
                                onValueChange={v => {
                                    model.setRgb([v, model.rgbColor[1], model.rgbColor[2]]);
                                }}
                            />
                        </Label>
                        <Label>
                            Hue
                            <NumericInput
                                min={0}
                                max={360}
                                stepSize={1}
                                minorStepSize={0.1}
                                value={model.hslColor[0]}
                                onValueChange={v => {
                                    model.setHsl([v, model.hslColor[1], model.hslColor[2]]);
                                }}
                            />
                        </Label>

                        <Label>
                            Green
                            <NumericInput
                                min={0}
                                max={1}
                                stepSize={STEP_SIZE}
                                minorStepSize={MINOR_STEP_SIZE}
                                value={model.rgbColor[1]}
                                onValueChange={v => {
                                    model.setRgb([model.rgbColor[0], v, model.rgbColor[2]]);
                                }}
                            />
                        </Label>
                        <Label>
                            Saturation
                            <NumericInput
                                min={0}
                                max={1}
                                stepSize={STEP_SIZE}
                                minorStepSize={MINOR_STEP_SIZE}
                                value={model.hslColor[1]}
                                onValueChange={v => {
                                    model.setHsl([model.hslColor[0], v, model.hslColor[2]]);
                                }}
                            />
                        </Label>
                        <Label>
                            Blue
                            <NumericInput
                                min={0}
                                max={1}
                                stepSize={STEP_SIZE}
                                minorStepSize={MINOR_STEP_SIZE}
                                value={model.rgbColor[2]}
                                onValueChange={v => {
                                    model.setRgb([model.rgbColor[0], model.rgbColor[1], v]);
                                }}
                            />
                        </Label>
                        <Label>
                            Value
                            <NumericInput
                                min={0}
                                max={1}
                                stepSize={STEP_SIZE}
                                minorStepSize={MINOR_STEP_SIZE}
                                value={model.hslColor[2]}
                                onValueChange={v => {
                                    model.setHsl([model.hslColor[0], model.hslColor[1], v]);
                                }}
                            />
                        </Label>
                        <Label>
                            Alpha
                            <NumericInput
                                min={0}
                                max={1}
                                stepSize={STEP_SIZE}
                                minorStepSize={MINOR_STEP_SIZE}
                                value={model.alpha}
                            />
                        </Label>
                    </InputsDiv>
                    <div className={Classes.DIALOG_FOOTER}>
                        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                            <Button text="Close" />
                            <Button intent={Intent.PRIMARY} text="Accept" />
                        </div>
                    </div>
                </DialogBody>
            </Dialog>
        </React.Fragment>
    );
});

function pickColor(ref: HTMLCanvasElement | null, event: React.MouseEvent): RGB | undefined {
    if (ref == null) return undefined;

    const bbox = ref.getBoundingClientRect();

    const x = Math.floor(event.clientX - bbox.left);
    const y = Math.floor(event.clientY - bbox.top);

    const hslColor: HSL = [0, 0, 0];
    const rgbColor: RGB = [0, 0, 0];

    hslColor[0] = (x / ref.width) * 360;
    hslColor[1] = 1.0;
    hslColor[2] = y / ref.height;

    hslToRgb(hslColor, rgbColor);

    return rgbColor;
}
