export interface Point {
    x: number;
    y: number;
}

export function calcLine(start: Point, end: Point): Array<Point> {
    const results: Array<Point> = [];

    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const slope = deltaY / deltaX;
        const y = start.y;
        for (let x = start.x; x != end.x; x += Math.sign(deltaX)) {
            const y = slope * (x - start.x) + start.y;
            results.push({ x, y: Math.round(y) });
        }
    } else {
        const slope = deltaX / deltaY;
        const x = start.x;
        for (let y = start.y; y != end.y; y += Math.sign(deltaY)) {
            const x = slope * (y - start.y) + start.x;
            results.push({ x: Math.round(x), y });
        }
    }

    return results;
}
