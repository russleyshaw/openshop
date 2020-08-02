import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef, useState } from "react";

type Subscriber<T> = (value: T) => void;
type Unsubscriber = () => void;

interface SubscriberEntry<T> {
    key: string;
    sub: Subscriber<T>;
}

export class Notifier<T> {
    value: T;

    private subscriberEntries: Array<SubscriberEntry<T>> = [];

    constructor(value: T) {
        this.value = value;
    }

    subscribe(cb: Subscriber<T>): Unsubscriber {
        const key = uuidv4();
        this.subscriberEntries.push({ key, sub: cb });
        return () => this.deleteSubscriber(key);
    }

    notify(): void {
        for (const entry of this.subscriberEntries) {
            try {
                entry.sub(this.value);
            } catch (err) {
                console.warn(`Subscriber ${entry.key} threw an error.`);
                console.warn(err);
            }
        }
    }

    private deleteSubscriber(key: string) {
        const idx = this.subscriberEntries.findIndex(entry => entry.key === key);
        if (idx < 0) return;

        this.subscriberEntries.splice(idx, 1);
    }
}

export function useNotify<T>(notifier: Notifier<T>, callback: Subscriber<T>): void {
    const savedCallback = useRef(callback);
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const unsubscriber = notifier.subscribe(v => savedCallback.current(v));
        return () => {
            unsubscriber();
        };
    }, [notifier]);
}

export function useNotifyState<T>(initialValue: () => T, callback: Subscriber<T>): Notifier<T> {
    const [notifier] = useState(() => new Notifier(initialValue()));

    const savedCallback = useRef(callback);
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const unsubscriber = notifier.subscribe(v => savedCallback.current(v));
        return () => {
            unsubscriber();
        };
    }, [notifier]);

    return notifier;
}
