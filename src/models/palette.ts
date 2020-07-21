import { v4 as uuidv4 } from "uuid";
import { observable, action } from "mobx";
import { RGBA } from "../common/colors";

export interface PaletteEntry {
    uuid: string;
    color: RGBA;
}

export class PaletteModel {
    readonly uuid: string;

    @observable
    palettes: PaletteEntry[] = [];

    constructor() {
        this.uuid = uuidv4();
    }

    @action
    addPalette(color: RGBA): PaletteEntry {
        const newPalette: PaletteEntry = {
            uuid: uuidv4(),
            color: [...color],
        };
        this.palettes.push(newPalette);
        return newPalette;
    }

    @action
    deletePalette(uuid: string): void {
        const idx = this.palettes.findIndex(p => p.uuid === uuid);
        this.palettes.splice(idx, 1);
    }
}
