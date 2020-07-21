import { Point } from "./common/point";
import { Vec4 } from "./common/vec";

export async function delayMs(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function asNotNil<T>(value: T | null | undefined, msg?: string): T {
    if (value == null) {
        throw new Error(msg ?? "Expected value to not be null or undefined.");
    }

    return value;
}

export function getFirst<T>(items: T[]): T | undefined {
    return items[0];
}

export function fillArray<T>(count: number, value: T): T[] {
    return new Array<T>(count).fill(value);
}

export function fillArrayFn<T>(count: number, fn: (idx: number) => T): T[] {
    return new Array(count).fill(0).map((_, idx) => fn(idx));
}

export function safeParseInt(value: string): number | null {
    const re = /[0-9]/g;

    const parsed = parseInt(value, 10);

    if (Number.isNaN(parsed)) {
        return null;
    }

    return parsed;
}

///////////////////////////////////////////////////////////////////////////////
/// IMAGE DATA Utils
///////////////////////////////////////////////////////////////////////////////

export function blendImageDataLayersNormal(
    layers: ImageData[],
    dirtyPixels: boolean[],
    out: ImageData
): void {
    let outA = 0;
    let rIdx = 0;
    let gIdx = 0;
    let bIdx = 0;
    let aIdx = 0;
    let layer = layers[0];

    for (let i = 0; i < layer.data.length; i += 4) {
        if (!dirtyPixels[i / 4]) continue;

        out.data[i + 0] = 0;
        out.data[i + 1] = 0;
        out.data[i + 2] = 0;
        out.data[i + 3] = 0;

        for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
            layer = layers[layerIdx];
            rIdx = i + 0;
            gIdx = i + 1;
            bIdx = i + 2;
            aIdx = i + 3;

            outA = layer.data[aIdx] + out.data[aIdx] * (1.0 - layer.data[aIdx]);

            if (outA !== 0) {
                out.data[rIdx] =
                    (layer.data[rIdx] * layer.data[aIdx] +
                        out.data[rIdx] * out.data[aIdx] * (1.0 - layer.data[aIdx])) /
                    outA;
                out.data[gIdx] =
                    (layer.data[gIdx] * layer.data[aIdx] +
                        out.data[gIdx] * out.data[aIdx] * (1.0 - layer.data[aIdx])) /
                    outA;
                out.data[bIdx] =
                    (layer.data[bIdx] * layer.data[aIdx] +
                        out.data[bIdx] * out.data[aIdx] * (1.0 - layer.data[aIdx])) /
                    outA;
            } else {
                out.data[rIdx] = 0;
                out.data[gIdx] = 0;
                out.data[bIdx] = 0;
            }
            out.data[aIdx] = outA;
        }
        dirtyPixels[i / 4] = false;
    }
}

export class UnreachableError extends Error {
    constructor(message: string, value: never) {
        super(message);
    }
}

export function isPowerOf2(value: number): boolean {
    return (value & (value - 1)) == 0;
}

export function fillImageData(
    img: ImageData,
    source: Point,
    color: Vec4,
    tolerance: number,
    dirtyPixels: boolean[]
): void {
    const openPixels: Point[] = [source];
    let openPixel = source;

    const closedPixels = new Array(img.width * img.height).fill(false);

    let pixelIdx = source[1] * img.width + source[0];
    let rgbaIdx = pixelIdx * 4;

    const colorToReplace: Vec4 = [
        img.data[rgbaIdx + 0],
        img.data[rgbaIdx + 1],
        img.data[rgbaIdx + 2],
        img.data[rgbaIdx + 3],
    ];

    let isSimilarToReplacement = false;

    while (openPixels.length > 0) {
        openPixel = openPixels.shift()!;

        if (
            openPixel[0] < 0 ||
            openPixel[0] >= img.width ||
            openPixel[1] < 0 ||
            openPixel[1] >= img.height
        ) {
            continue;
        }

        // Update helper indexes
        pixelIdx = openPixel[1] * img.width + openPixel[0];
        rgbaIdx = pixelIdx * 4;

        if (closedPixels[pixelIdx]) {
            continue;
        }
        closedPixels[pixelIdx] = true;

        isSimilarToReplacement =
            isTolerable(img.data[rgbaIdx + 0], colorToReplace[0], tolerance) &&
            isTolerable(img.data[rgbaIdx + 1], colorToReplace[1], tolerance) &&
            isTolerable(img.data[rgbaIdx + 2], colorToReplace[2], tolerance) &&
            isTolerable(img.data[rgbaIdx + 3], colorToReplace[3], tolerance);

        if (!isSimilarToReplacement) {
            continue;
        }

        img.data[rgbaIdx + 0] = color[0];
        img.data[rgbaIdx + 1] = color[1];
        img.data[rgbaIdx + 2] = color[2];
        img.data[rgbaIdx + 3] = color[3];
        dirtyPixels[pixelIdx] = true;

        openPixels.push(
            [openPixel[0] - 1, openPixel[1]],
            [openPixel[0] + 1, openPixel[1]],
            [openPixel[0], openPixel[1] - 1],
            [openPixel[0], openPixel[1] + 1]
        );
    }
}

export function isTolerable(value: number, target: number, tolerance: number) {
    return value + tolerance >= target && value - tolerance <= target;
}

export function wrapmod(n: number, m: number): number {
    return ((n % m) + m) % m;
}
