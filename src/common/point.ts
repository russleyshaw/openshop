import { Vec2 } from "./vec";

export type Point = Vec2;

export function calcLine(start: Vec2, end: Vec2): Array<Vec2> {
    const results: Vec2[] = [];

    const deltaX = end[0] - start[0];
    const deltaY = end[1] - start[1];

    let x = 0;
    let y = 0;
    let slope = 0;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        slope = deltaY / deltaX;
        y = start[1];
        for (x = start[0]; x != end[0]; x += Math.sign(deltaX)) {
            y = slope * (x - start[0]) + start[1];
            results.push([x, Math.round(y)]);
        }
    } else {
        slope = deltaX / deltaY;
        x = start[0];
        for (y = start[1]; y != end[1]; y += Math.sign(deltaY)) {
            x = slope * (y - start[1]) + start[0];
            results.push([Math.round(x), y]);
        }
    }

    return results;
}
