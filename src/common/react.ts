import * as React from "react";
import { noop } from "lodash";
import { AnyFunction } from "./util";

export function useInterval(callback: () => void, delayMs: number): void {
    const savedCallback = React.useRef<() => void>(noop);

    // Remember the latest callback.
    React.useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    React.useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delayMs !== null) {
            const id = setInterval(tick, delayMs);
            return () => clearInterval(id);
        }
    }, [delayMs]);
}

export function useFunction<F extends AnyFunction>(func: F): F {
    const savedFn = React.useRef<F>(func);
    const wrapper = React.useRef<F>(((...args: unknown[]): unknown =>
        savedFn.current(...args)) as any);

    React.useEffect(() => {
        savedFn.current = func;
    }, [func]);

    return wrapper.current;
}

export function joinClassnames(...classes: Array<{ [key: string]: boolean } | string>): string {
    const usedClasses: string[] = [];

    for (const classEntry of classes) {
        if (typeof classEntry === "string") {
            usedClasses.push(classEntry);
        } else {
            usedClasses.push(
                ...Object.entries(classes)
                    .filter(([name, used]) => used)
                    .map(([name]) => name)
            );
        }
    }

    return usedClasses.join(" ");
}
