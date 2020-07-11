import { Vec4, Vec3, wrapmod } from "./util";

export function rgbToCss(color: Vec3 | Vec4): string {
    const r = Math.round(color[0]);
    const g = Math.round(color[1]);
    const b = Math.round(color[2]);
    const a = ((color[3] ?? 255) / 255).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function rgbToHex(color: Vec3 | Vec4): string {
    const r = Math.round(color[0]).toString(16);
    const g = Math.round(color[1]).toString(16);
    const b = Math.round(color[2]).toString(16);
    const a = Math.round(color[3] ?? 255).toString(16);

    return `#${r}${g}${b}${a}`;
}

export function isColorEqual(a: Vec3 | Vec4, b: Vec3 | Vec4): boolean {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

export function rgbToHsv(rgb: Vec3 | Vec4, out: Vec3): void {
    const rPrime = rgb[0] / 255;
    const gPrime = rgb[1] / 255;
    const bPrime = rgb[2] / 255;

    const cMax = Math.max(rPrime, gPrime, bPrime);
    const cMin = Math.min(rPrime, gPrime, bPrime);

    const delta = cMax - cMin;

    let hue: number;
    if (delta === 0) {
        hue = 0;
    } else if (cMax === rPrime) {
        hue = 60 * ((gPrime - bPrime / delta) % 6);
    } else if (cMax === gPrime) {
        hue = 60 * ((bPrime - rPrime) / delta + 2);
    } else if (cMax === bPrime) {
        hue = 60 * ((rPrime - gPrime) / delta + 4);
    } else {
        throw new Error("Unreachable");
    }

    const saturation = cMax === 0 ? 0 : delta / cMax;
    const value = cMax;

    out[0] = hue;
    out[1] = saturation;
    out[2] = value;
}

export function hsvToRgb(hsv: Vec3 | Vec4, out: Vec3): void {
    const [h, s, v] = hsv;
    const c = v * s;
    const hPrime = wrapmod(h / 60, 360);
    const x = c * (1 - Math.abs((hPrime % 2) - 1));
    const m = v - c;

    let primes: [number, number, number];
    if (0 <= hPrime && hPrime < 1) {
        primes = [c, x, 0];
    } else if (1 <= hPrime && hPrime < 2) {
        primes = [x, c, 0];
    } else if (2 <= hPrime && hPrime < 3) {
        primes = [0, c, x];
    } else if (3 <= hPrime && hPrime < 4) {
        primes = [0, x, c];
    } else if (4 <= hPrime && hPrime < 5) {
        primes = [x, 0, c];
    } else if (5 <= hPrime && hPrime < 360) {
        primes = [c, 0, x];
    } else {
        throw new Error(`Bad hue: ${h}`);
    }

    out[0] = (primes[0] + m) * 255;
    out[1] = (primes[1] + m) * 255;
    out[2] = (primes[2] + m) * 255;
}
