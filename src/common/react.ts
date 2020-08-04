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
