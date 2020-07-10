import { observer } from "mobx-react";
import { rgbToCss, rgbToHex, rgbToHsv, hsvToRgb, isColorEqual } from "../colors";
import styled from "styled-components";
import { RadioGroup, Radio, Slider, Label } from "@blueprintjs/core";

import * as React from "react";
import { AlphaBackdropDiv } from "./alpha_backdrop";
import { throttle } from "lodash";
import { Vec4, Vec3, UnreachableError } from "../util";

export interface RGBAPickerProps {
    color: Vec4;
    onColorChange(color: Vec4): void;
}

const RootDiv = styled.div`
    display: flex;
    flex-direction: column;
    width: 300px;
    padding: 16px;
`;

enum PickerMode {
    HueSat,
    SatVal,
}

interface State {
    mode: PickerMode;
    alpha: number;
    hue: number;
    value: number;
}

export class RGBAPicker extends React.Component<RGBAPickerProps, State> {
    pickerCanvasRef?: HTMLCanvasElement;

    constructor(props: RGBAPickerProps) {
        super(props);

        const hsvColor: Vec3 = [0, 0, 0];
        rgbToHsv(props.color, hsvColor);

        this.state = {
            mode: PickerMode.HueSat,
            alpha: props.color[3],
            hue: hsvColor[0],
            value: hsvColor[2],
        };
    }

    throttledPaintPickerCanvas = throttle(
        () => {
            switch (this.state.mode) {
                case PickerMode.HueSat:
                    requestAnimationFrame(() => this.paintHueSatPickerCanvas());
                    break;
                case PickerMode.SatVal:
                    requestAnimationFrame(() => this.paintSatValPickerCanvas());
                    break;
                default:
                    throw new UnreachableError("bad", this.state.mode);
            }
        },
        1000 / 5,
        { trailing: true, leading: false }
    );

    ///////////////////////////////////////////////////////////////////////////
    /// Handlers
    ///////////////////////////////////////////////////////////////////////////
    setMode(mode: PickerMode): void {
        this.setState({ mode });

        switch (mode) {
            case PickerMode.HueSat:
                this.paintHueSatPickerCanvas();
                break;

            case PickerMode.SatVal:
                this.paintSatValPickerCanvas();
                break;
        }
    }

    setHue(hue: number): void {
        this.setState({ hue });
        this.throttledPaintPickerCanvas();
    }

    setValue(value: number): void {
        this.setState({ value });
        this.throttledPaintPickerCanvas();
    }

    setAlpha(alpha: number): void {
        this.setState({ alpha });
        this.throttledPaintPickerCanvas();
    }

    ///////////////////////////////////////////////////////////////////////////
    /// REACT LIFECYCLE
    ///////////////////////////////////////////////////////////////////////////

    componentDidUpdate(prevProps: RGBAPickerProps, prevState: State): void {
        // Update alpha if color was updated
        if (!isColorEqual(prevProps.color, this.props.color)) {
            console.log("Color updated!");

            const hsvColor: Vec3 = [0, 0, 0];
            rgbToHsv(this.props.color, hsvColor);

            this.setState({
                alpha: this.props.color[3],
                hue: hsvColor[0],
                value: hsvColor[2],
            });
        }
    }

    updateStateFromColor(newColor: Vec4): void {
        const hsvColor: Vec3 = [0, 0, 0];
        rgbToHsv(newColor, hsvColor);

        this.setState({
            alpha: newColor[3],
            hue: hsvColor[0],
            value: hsvColor[2],
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    /// EVENT HANDLERS
    ///////////////////////////////////////////////////////////////////////////
    onChangeMode = (e: React.FormEvent<HTMLInputElement>): void => {
        this.setMode(parseInt(e.currentTarget.value, 10) as PickerMode);
    };

    onPickColor = (event: React.MouseEvent<HTMLCanvasElement>): void => {
        const ref = this.pickerCanvasRef;
        if (ref == null) return;
        const ctx = ref.getContext("2d");
        if (ctx == null) return;

        const bbox = ref.getBoundingClientRect();

        const canvasX = event.clientX - bbox.left;
        const canvasY = event.clientY - bbox.top;

        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1);

        const newColor: Vec4 = [pixel.data[0], pixel.data[1], pixel.data[2], this.state.alpha];
        this.updateStateFromColor(newColor);
        this.props.onColorChange(newColor);
    };

    onPickerCanvasRef = (ref: HTMLCanvasElement | null): void => {
        this.pickerCanvasRef = ref ?? undefined;

        this.paintHueSatPickerCanvas();
    };

    ///////////////////////////////////////////////////////////////////////////
    /// PAINT PICKER CANVAS
    ///////////////////////////////////////////////////////////////////////////
    paintHueSatPickerCanvas(): void {
        const ref = this.pickerCanvasRef;
        if (ref == null) return;
        const ctx = ref.getContext("2d");
        if (ctx == null) return;

        console.time("paintHueSatPickerCanvas");

        const img = new ImageData(ref.width, ref.height);

        let x = 0;
        let y = 0;
        let pixelIdx = 0;
        let rgbaIdx = 0;
        const rgbColor: Vec3 = [0, 0, 0];
        const hsvColor: Vec3 = [0, 0, 0];
        for (y = 0; y < ref.height; y++) {
            for (x = 0; x < ref.width; x++) {
                pixelIdx = y * ref.width + x;
                rgbaIdx = pixelIdx * 4;

                hsvColor[0] = (x / ref.width) * 360;
                hsvColor[1] = y / ref.height;
                hsvColor[2] = this.state.value;

                hsvToRgb(hsvColor, rgbColor);

                img.data[rgbaIdx + 0] = rgbColor[0];
                img.data[rgbaIdx + 1] = rgbColor[1];
                img.data[rgbaIdx + 2] = rgbColor[2];
                img.data[rgbaIdx + 3] = this.state.alpha;
            }
        }

        ctx.clearRect(0, 0, ref.width, ref.height);
        ctx.putImageData(img, 0, 0);

        console.timeEnd("paintHueSatPickerCanvas");
    }

    paintSatValPickerCanvas(): void {
        const ref = this.pickerCanvasRef;
        if (ref == null) return;
        const ctx = ref.getContext("2d");
        if (ctx == null) return;

        console.time("paintSatValPickerCanvas");

        const img = new ImageData(ref.width, ref.height);

        let x = 0;
        let y = 0;
        let pixelIdx = 0;
        let rgbaIdx = 0;
        const hsvColor: Vec3 = [0, 0, 0];
        const rgbColor: Vec3 = [0, 0, 0];
        hsvColor[0] = this.state.hue;
        for (y = 0; y < ref.height; y++) {
            for (x = 0; x < ref.width; x++) {
                pixelIdx = y * ref.width + x;
                rgbaIdx = pixelIdx * 4;

                hsvColor[1] = y / ref.height;
                hsvColor[2] = x / ref.width;

                hsvToRgb(hsvColor, rgbColor);

                img.data[rgbaIdx + 0] = rgbColor[0];
                img.data[rgbaIdx + 1] = rgbColor[1];
                img.data[rgbaIdx + 2] = rgbColor[2];
                img.data[rgbaIdx + 3] = this.state.alpha;
            }
        }

        ctx.clearRect(0, 0, ref.width, ref.height);
        ctx.putImageData(img, 0, 0);

        console.timeEnd("paintSatValPickerCanvas");
    }

    render(): JSX.Element {
        return (
            <RootDiv>
                <RadioGroup selectedValue={this.state.mode} inline onChange={this.onChangeMode}>
                    <Radio label="Hue/Sat" value={PickerMode.HueSat} />
                    <Radio label="Sat/Val" value={PickerMode.SatVal} />
                </RadioGroup>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <AlphaBackdropDiv style={{ width: 255, height: 255 }}>
                        <canvas
                            onClick={this.onPickColor}
                            style={{ cursor: "crosshair" }}
                            ref={this.onPickerCanvasRef}
                            width={255}
                            height={255}
                        ></canvas>
                    </AlphaBackdropDiv>
                </div>
                {this.renderHueSatControls()}
                {this.renderSatValControls()}
            </RootDiv>
        );
    }

    renderHueSatControls(): JSX.Element | null {
        if (this.state.mode !== PickerMode.HueSat) return null;
        return (
            <React.Fragment>
                <Label>
                    Value
                    <Slider
                        min={0}
                        max={1}
                        labelRenderer={false}
                        stepSize={0.01}
                        value={this.state.value}
                        onChange={v => this.setValue(v)}
                    />
                </Label>
                {this.renderAlphaControl()}
            </React.Fragment>
        );
    }

    renderSatValControls(): JSX.Element | null {
        if (this.state.mode !== PickerMode.SatVal) return null;
        return (
            <React.Fragment>
                <Label>
                    Hue
                    <Slider
                        min={0}
                        max={360}
                        labelRenderer={false}
                        stepSize={1}
                        value={this.state.hue}
                        onChange={v => this.setHue(v)}
                    />
                </Label>
                {this.renderAlphaControl()}
            </React.Fragment>
        );
    }

    renderAlphaControl(): JSX.Element {
        return (
            <Label>
                Alpha
                <Slider
                    value={this.state.alpha}
                    min={0}
                    max={255}
                    stepSize={1}
                    onChange={v => this.setAlpha(v)}
                    labelRenderer={false}
                />
            </Label>
        );
    }
}
