import * as React from "react";

/**
 * Use an interval as a react hook.
 * @param callback
 * @param delayMs Interval delay time. Use null to disable the interval.
 */
export function useInterval(callback: () => void, delayMs: number | false | null): void {
    const savedCallback = React.useRef(callback);

    // Remember the latest callback.
    React.useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    React.useEffect(() => {
        const tick = () => {
            savedCallback.current();
        };

        if (delayMs != null && delayMs !== false) {
            const id = setInterval(tick, delayMs);
            return () => clearInterval(id);
        }
    }, [delayMs]);
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

export function useResize(ref: HTMLElement | null, callback: () => void): void {
    const savedCallback = React.useRef(callback);
    React.useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    React.useEffect(() => {
        const currentCanvas = ref;
        if (currentCanvas != null) {
            const listener = () => savedCallback.current();
            currentCanvas.addEventListener("resize", listener);
            return () => currentCanvas.removeEventListener("resize", listener);
        }
    }, [ref]);
}

export function useRefFn<T>(initialValue: () => T): React.MutableRefObject<T> {
    const [ref] = React.useState(() => ({
        current: initialValue(),
    }));

    return ref;
}
