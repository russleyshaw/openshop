import { safeParseInt } from "../util";

export type AnyFunction = (...args: unknown[]) => unknown;

export function getNextName(template: string, names: string[]): string {
    const templateRe = new RegExp(template.replace("#", "([0-9]+)"));

    let nextId = 0;

    for (const name of names) {
        const result = templateRe.exec(name);
        if (result == null) continue;
        const numResult = safeParseInt(result[1]);
        if (numResult == null) continue;
        nextId = Math.max(nextId, numResult + 1);
    }

    return template.replace("#", nextId.toString());
}

export function isPowerOf2(value: number): boolean {
    return (value & (value - 1)) == 0;
}
