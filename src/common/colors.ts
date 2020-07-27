import { Vec3, Vec4 } from "./vec";
import { wrapmod } from "../util";
import { clamp } from "lodash";

export type RGB = Vec3;
export type RGBA = Vec4;

export type HSL = Vec3;
export type HSLA = Vec4;

export function rgbToCss(color: RGB | RGBA): string {
    const r = Math.floor(color[0] * 255);
    const g = Math.floor(color[1] * 255);
    const b = Math.floor(color[2] * 255);
    const a = (color[3] ?? 1.0).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function isColorEqual(a: Vec3 | Vec4, b: Vec3 | Vec4): boolean {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

export function colorCopy(src: Vec3 | Vec4, out: Vec3 | Vec4): void {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];

    if (src.length === 4 && out.length === 4) {
        out[3] = src[3];
    }
}

export function toNoAlpha(color: Vec3 | Vec4): Vec3 {
    const [a, b, c] = color;
    return [a, b, c];
}

export function rgbToHsl(color: RGB | RGBA, out: HSL | HSLA): void {
    const cMax = Math.max(color[0], color[1], color[2]);
    const cMin = Math.min(color[0], color[1], color[2]);

    const delta = cMax - cMin;

    let hue: number;
    if (delta === 0) {
        hue = 0;
    } else if (cMax === color[0]) {
        hue = 60 * ((color[1] - color[2] / delta) % 6);
    } else if (cMax === color[1]) {
        hue = 60 * ((color[2] - color[0]) / delta + 2);
    } else if (cMax === color[2]) {
        hue = 60 * ((color[0] - color[1]) / delta + 4);
    } else {
        throw new Error("Unreachable");
    }

    out[0] = wrapmod(hue, 360);
    out[2] = (cMax + cMin) / 2;
    out[1] = delta === 0 ? 0 : delta / (1 - Math.abs(2 * out[2] - 1));

    if (out.length === 4 && color.length === 4) {
        out[3] = color[3];
    }
}

export function hslToRgb(hsl: HSL, out: RGB): void;
export function hslToRgb(hsl: HSLA, out: RGBA): void;
export function hslToRgb(hsl: HSL | HSLA, out: RGB | RGBA): void {
    // C = (1 - |2L - 1|) × S
    const c = (1 - Math.abs(2 * hsl[2] - 1)) * hsl[1];

    // X = C × (1 - |(H / 60°) mod 2 - 1|)
    const x = c * (1 - Math.abs(((hsl[0] / 60) % 2) - 1));

    // m = L - C/2
    const m = hsl[2] - c / 2;

    while (hsl[0] > 360) {
        hsl[0] -= 360;
    }
    while (hsl[0] < 0) {
        hsl[0] += 360;
    }

    let primes: Vec3;
    if (0 <= hsl[0] && hsl[0] < 60) {
        primes = [c, x, 0];
    } else if (60 <= hsl[0] && hsl[0] < 120) {
        primes = [x, c, 0];
    } else if (120 <= hsl[0] && hsl[0] < 180) {
        primes = [0, c, x];
    } else if (180 <= hsl[0] && hsl[0] < 240) {
        primes = [0, x, c];
    } else if (240 <= hsl[0] && hsl[0] < 300) {
        primes = [x, 0, c];
    } else if (300 <= hsl[0] && hsl[0] < 360) {
        primes = [c, 0, x];
    } else {
        throw new Error(`Bad hue: ${hsl[0]}`);
    }

    // (R,G,B) = ((R'+m)×255, (G'+m)×255,(B'+m)×255)
    out[0] = primes[0] + m;
    out[1] = primes[1] + m;
    out[2] = primes[2] + m;
    if (hsl.length === 4) {
        out[3] = hsl[3];
    }
}

export function rgbTo8bit(color: RGB, out: RGB): void;
export function rgbTo8bit(color: RGBA, out: RGBA): void;
export function rgbTo8bit(color: RGB | RGBA, out: RGB | RGBA): void {
    out[0] = Math.floor(color[0] * 255);
    out[1] = Math.floor(color[1] * 255);
    out[2] = Math.floor(color[2] * 255);
}
