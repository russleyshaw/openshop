import * as React from "react";
import styled from "styled-components";
import { observer, useLocalStore } from "mobx-react";
import { Dialog, Classes, Button, Intent, NumericInput, Label, Slider } from "@blueprintjs/core";

import {
    RGBA,
    RGB,
    rgbTo8bit,
    rgbToHsl,
    HSL,
    hslToRgb,
    HSLA,
    colorCopy,
    isColorEqual,
} from "../common/colors";
import { PaletteModel } from "../models/palette";
import { useInterval } from "../common/react";

import alphaPattern from "../../static/alpha-pattern.png";
import { observable, action, autorun, IReactionDisposer, reaction } from "mobx";
import { Interval } from "../common/interval";
import { delayMs } from "../util";

const MINOR_STEP_SIZE = 0.01;
const STEP_SIZE = 0.1;

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

@observer
export default class ColorPickerModal extends React.Component<ColorPickerModalProps> {
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

    disposers = [
        reaction(
            () => this.props.color,
            color => {
                this.setRgb([color[0], color[1], color[2]]);
                this.alpha = color[3];
            }
        ),
    ];

    drawInterval = new Interval(() => this.drawCanvas(), 500);

    constructor(props: ColorPickerModalProps) {
        super(props);

        this.rgbColor = [props.color[0], props.color[1], props.color[2]];
        rgbToHsl(props.color, this.hslColor);
        this.alpha = props.color[3];
    }

    updateColor(color: RGBA): void {
        console.log("Updating color", color);
        this.rgbColor = [color[0], color[1], color[2]];
        rgbToHsl(color, this.hslColor);
        this.alpha = color[3];
    }

    ///////////////////////////////////////////////////////////////////////////
    // React Lifecycle
    ///////////////////////////////////////////////////////////////////////////

    componentWillUnmount(): void {
        this.drawInterval.stop();
        for (const disposer of this.disposers) {
            disposer();
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Handlers
    ///////////////////////////////////////////////////////////////////////////

    onCanvasRef = (ref: HTMLCanvasElement | null) => {
        this.canvasRef = ref;
    };

    onCanvasClick: React.MouseEventHandler<HTMLCanvasElement> = event => {
        const ref = this.canvasRef;
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

        this.setRgb(rgbColor);
    };

    onAcceptClick: React.MouseEventHandler = element => {
        this.props.onColorSelect([...this.rgbColor, this.alpha]);
        this.setOpen(false);
    };

    onTargetClick: React.MouseEventHandler = event => {
        this.setOpen(true);
    };

    onDialogClose = () => {
        this.setOpen(false);
    };

    onDialogOpening = () => {
        this.drawCanvas();
    };

    onRedChange = (v: number): void => {
        this.setRgb([v, this.rgbColor[1], this.rgbColor[2]]);
    };

    onGreenChange = (v: number): void => {
        this.setRgb([this.rgbColor[0], v, this.rgbColor[2]]);
    };

    onBlueChange = (v: number): void => {
        this.setRgb([this.rgbColor[0], this.rgbColor[1], v]);
    };

    onHueChange = (v: number): void => {
        this.setHsl([v, this.hslColor[1], this.hslColor[2]]);
    };

    onSaturationChange = (v: number): void => {
        this.setHsl([this.hslColor[0], v, this.hslColor[2]]);
    };

    onValueChange = (v: number): void => {
        this.setHsl([this.hslColor[0], this.hslColor[1], v]);
    };

    @action
    setOpen(open: boolean): void {
        this.isOpen = open;

        if (this.isOpen) {
            void delayMs(100).then(() => this.drawCanvas());
            this.drawInterval.start();
        } else {
            this.drawInterval.stop();
        }
    }

    @action
    setRgb(color: RGB): void {
        colorCopy(color, this.rgbColor);
        rgbToHsl(color, this.hslColor);
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

        const label = "ColorPickerModal::drawCanvas";
        console.time(label);

        let x = 0;
        let y = 0;
        let rgbIdx = 0;
        const hslColor: HSL = [0, 0, 0];
        const rgbColor: RGB = [0, 0, 0];

        if (
            ref.width !== ref.clientWidth ||
            ref.height !== ref.clientHeight ||
            this.backdrop.width !== ref.clientWidth ||
            this.backdrop.height !== ref.clientHeight
        ) {
            // Rebuild backing HSL image data;
            ref.width = ref.clientWidth;
            ref.height = ref.clientHeight;

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

        console.timeEnd(label);
    }

    render(): JSX.Element {
        return (
            <React.Fragment>
                <div onClick={this.onTargetClick}>{this.props.target}</div>
                <Dialog
                    lazy
                    canEscapeKeyClose
                    canOutsideClickClose
                    isCloseButtonShown
                    isOpen={this.isOpen}
                    title={this.props.title ?? "Pick A Color"}
                    onClose={this.onDialogClose}
                    onOpening={this.onDialogOpening}
                >
                    <DialogBody className={Classes.DIALOG_BODY}>
                        <Canvas onClick={this.onCanvasClick} ref={this.onCanvasRef} />
                        <InputsDiv>
                            <Label>
                                Red
                                <NumericInput
                                    min={0}
                                    max={1}
                                    stepSize={STEP_SIZE}
                                    minorStepSize={MINOR_STEP_SIZE}
                                    value={this.rgbColor[0]}
                                    onValueChange={this.onRedChange}
                                />
                            </Label>
                            <Label>
                                Hue
                                <NumericInput
                                    min={0}
                                    max={360}
                                    stepSize={1}
                                    minorStepSize={0.1}
                                    value={this.hslColor[0]}
                                    onValueChange={this.onHueChange}
                                />
                            </Label>

                            <Label>
                                Green
                                <NumericInput
                                    min={0}
                                    max={1}
                                    stepSize={STEP_SIZE}
                                    minorStepSize={MINOR_STEP_SIZE}
                                    value={this.rgbColor[1]}
                                    onValueChange={this.onGreenChange}
                                />
                            </Label>
                            <Label>
                                Saturation
                                <NumericInput
                                    min={0}
                                    max={1}
                                    stepSize={STEP_SIZE}
                                    minorStepSize={MINOR_STEP_SIZE}
                                    value={this.hslColor[1]}
                                    onValueChange={this.onSaturationChange}
                                />
                            </Label>
                            <Label>
                                Blue
                                <NumericInput
                                    min={0}
                                    max={1}
                                    stepSize={STEP_SIZE}
                                    minorStepSize={MINOR_STEP_SIZE}
                                    value={this.rgbColor[2]}
                                    onValueChange={this.onBlueChange}
                                />
                            </Label>
                            <Label>
                                Value
                                <NumericInput
                                    min={0}
                                    max={1}
                                    stepSize={STEP_SIZE}
                                    minorStepSize={MINOR_STEP_SIZE}
                                    value={this.hslColor[2]}
                                    onValueChange={this.onValueChange}
                                />
                            </Label>
                            <Label>
                                Alpha
                                <NumericInput
                                    min={0}
                                    max={1}
                                    stepSize={STEP_SIZE}
                                    minorStepSize={MINOR_STEP_SIZE}
                                    value={this.alpha}
                                />
                            </Label>
                        </InputsDiv>
                        <div className={Classes.DIALOG_FOOTER}>
                            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                                <Button text="Close" />
                                <Button
                                    onClick={this.onAcceptClick}
                                    intent={Intent.PRIMARY}
                                    text="Accept"
                                />
                            </div>
                        </div>
                    </DialogBody>
                </Dialog>
            </React.Fragment>
        );
    }
}
