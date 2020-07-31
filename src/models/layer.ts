import { v4 as uuidv4 } from "uuid";
import { observable } from "mobx";
import { fillImageData } from "../util";
import { Point, calcLine } from "../common/point";
import { Notifier } from "../common/notifier";
import { RGBA } from "../common/colors";
import { F32ImageData } from "./f32_image_data";

export interface LayerModelArgs {
    width: number;
    height: number;
    name?: string;
}

export class LayerModel {
    readonly uuid: string;

    @observable
    name: string;

    @observable
    hidden = false;

    @observable
    opacity = 1;

    image: Notifier<F32ImageData>;

    constructor(args: LayerModelArgs) {
        this.uuid = uuidv4();
        this.name = args.name ?? this.uuid;
        this.image = new Notifier(new F32ImageData(args.width, args.height));
    }

    drawPoint(point: Point, color: RGBA, size: number, dirtyPixels: boolean[]): void {
        this.rawDrawPoint(point, color, size, dirtyPixels);
        this.image.notify();
    }

    drawLine(start: Point, end: Point, color: RGBA, size: number, dirtyPixels: boolean[]): void {
        for (const point of calcLine(start, end)) {
            this.rawDrawPoint(point, color, size, dirtyPixels);
        }
        this.image.notify();
    }

    fill(point: Point, color: RGBA, tolerance: number, dirtyPixels: boolean[]): void {
        fillImageData(this.image.value, point, color, tolerance, dirtyPixels);
        this.image.notify();
    }

    erasePoint(point: Point, size: number, dirtyPixels: boolean[]): void {
        this.rawErasePoint(point, size, dirtyPixels);
        this.image.notify();
    }

    eraseLine(start: Point, end: Point, size: number, dirtyPixels: boolean[]): void {
        for (const point of calcLine(start, end)) {
            this.rawErasePoint(point, size, dirtyPixels);
        }
        this.image.notify();
    }

    private rawDrawPoint(point: Point, color: RGBA, size: number, dirtyPixels: boolean[]): void {
        const image = this.image.value;

        let pixelIdx = 0;
        let subPixelIdx = 0;

        const halfSize = size / 2;

        for (let y = Math.round(point[1] - halfSize); y <= Math.round(point[1] + halfSize); y++) {
            for (
                let x = Math.round(point[0] - halfSize);
                x <= Math.round(point[0] + halfSize);
                x++
            ) {
                pixelIdx = y * image.width + x;
                subPixelIdx = pixelIdx * 4;

                image.data[subPixelIdx + 0] = color[0];
                image.data[subPixelIdx + 1] = color[1];
                image.data[subPixelIdx + 2] = color[2];
                image.data[subPixelIdx + 3] = color[3];

                dirtyPixels[pixelIdx] = true;
            }
        }
    }

    private rawErasePoint(point: Point, size: number, dirtyPixels: boolean[]): void {
        const image = this.image.value;

        const startX = Math.round(Math.max(point[0] - size / 2, 0));
        const endX = Math.round(Math.min(point[0] + size / 2, image.width));

        const startY = Math.round(Math.max(point[1] - size / 2, 0));
        const endY = Math.round(Math.min(point[1] + size / 2, image.height));

        let x = 0;
        let y = 0;
        let pixelIdx = 0;
        let rgbaIdx = 0;
        for (y = startY; y < endY; y++) {
            for (x = startX; x < endX; x++) {
                pixelIdx = y * image.width + x;
                rgbaIdx = pixelIdx * 4;

                image.data[rgbaIdx + 0] = 0;
                image.data[rgbaIdx + 1] = 0;
                image.data[rgbaIdx + 2] = 0;
                image.data[rgbaIdx + 3] = 0;

                dirtyPixels[pixelIdx] = true;
            }
        }
    }
}
