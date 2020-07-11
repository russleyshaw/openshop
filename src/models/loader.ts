import { observable, computed } from "mobx";

export class Loader {
    @observable
    latest: string = "";

    @observable
    loading: number = 0;

    @observable
    loaded: number = 0;

    @computed
    get progress(): number | null {
        const total = this.loading + this.loaded;
        if (total === 0) return null;

        return this.loaded / total;
    }

    async load<T>(name: string, valueGetter: () => Promise<T>): Promise<T> {
        this.loading++;
        this.latest = name;

        try {
            const val = await valueGetter();
            this.loading--;
            this.loaded++;
            return val;
        } catch (err) {
            this.loading--;
            this.loaded++;
            throw err;
        }
    }
}

export const loader = new Loader();
