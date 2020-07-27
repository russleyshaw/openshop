export class Interval {
    private _cb: () => void;
    private _ms: number;

    private _intervalId?: number;

    constructor(cb: () => void, ms: number) {
        this._cb = cb;
        this._ms = ms;
    }

    get running(): boolean {
        return this._intervalId != null;
    }

    start(): void {
        if (!this.running) {
            this._intervalId = setInterval(this._cb, this._ms);
        }
    }

    stop(): void {
        clearInterval(this._intervalId);
        this._intervalId = undefined;
    }
}
