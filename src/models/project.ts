import { v4 as uuidv4 } from "uuid";
import { observable, computed, action } from "mobx";
import { LayerModel } from "./layer";
import { RGBA } from "../common/colors";
import { getNextName } from "../common/util";

export enum Tool {
    Select,
    Pan,
    Pencil,
    Brush,
    Eraser,
    Fill,
    Eyedropper,
}

export const MIN_PENCIL_SIZE = 1;
export const MAX_PENCIL_SIZE = 16;

export interface PaletteEntry {
    uuid: string;
    color: RGBA;
}

export interface ProjectModelArgs {
    width: number;
    height: number;
    name?: string;
}

export class ProjectModel {
    readonly uuid: string;

    readonly width: number;
    readonly height: number;

    @observable
    name: string;

    ///////////////////////////////////////////////////////////////////////////
    /// Layers
    ///////////////////////////////////////////////////////////////////////////

    @observable
    layers: LayerModel[] = [];

    @observable
    selectedLayerUuid?: string;

    ///////////////////////////////////////////////////////////////////////////
    /// Colors
    ///////////////////////////////////////////////////////////////////////////

    @observable
    primaryColor: RGBA = [0, 0, 0, 255];

    @observable
    secondaryColor: RGBA = [255, 255, 255, 255];

    @observable
    palettes: PaletteEntry[] = [];

    @observable
    selectedPaletteUuid?: string;

    ///////////////////////////////////////////////////////////////////////////
    /// Tool States
    ///////////////////////////////////////////////////////////////////////////

    @observable
    selectedTool: Tool = Tool.Pencil;

    @observable
    fillTolerance: number = 0;

    @observable
    pencilSize: number = 1;

    @observable
    eraserSize: number = 1;

    ///////////////////////////////////////////////////////////////////////////
    /// Brush Tool State
    ///////////////////////////////////////////////////////////////////////////

    @observable
    brushSize: number = 4;

    @observable
    brushFeather: number = 1.0;

    dirtyPixels: boolean[];

    constructor(args: ProjectModelArgs) {
        this.width = args.width;
        this.height = args.height;
        this.uuid = uuidv4();
        this.name = args.name ?? this.uuid;

        this.dirtyPixels = new Array<boolean>(this.width * this.height).fill(true);
    }

    @computed
    get selectedLayer(): LayerModel | undefined {
        if (this.selectedLayerUuid == null) return undefined;

        const foundLayer = this.layers.find(l => l.uuid === this.selectedLayerUuid);
        return foundLayer;
    }

    @action
    setSelectedLayer(uuid: string): void {
        if (!this.layers.some(l => l.uuid === uuid)) {
            throw new Error(`Provided UUID does not match any layeer UUIDs. Provided: ${uuid}`);
        }

        this.selectedLayerUuid = uuid;
    }

    @action
    setSelectedTool(tool: Tool): void {
        this.selectedTool = tool;
    }

    @action
    addNewEmptyLayer(name?: string): LayerModel {
        const myName =
            name ??
            getNextName(
                "Untitled #",
                this.layers.map(l => l.name)
            );
        const newLayer = new LayerModel({ width: this.width, height: this.height, name: myName });
        this.layers.push(newLayer);

        this.markAllDirty();

        return newLayer;
    }

    @action
    deleteLayer(uuid: string): void {
        const idx = this.layers.findIndex(l => l.uuid === uuid);
        if (idx < 0) return;
        this.layers.splice(idx, 1);

        this.markAllDirty();
    }

    ///////////////////////////////////////////////////////////////////////////
    /// Palette Functions
    ///////////////////////////////////////////////////////////////////////////

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
    setSelectedPalette(uuid: string): void {
        if (!this.palettes.some(l => l.uuid === uuid)) {
            throw new Error(`Provided UUID does not match any palette UUIDs. Provided: ${uuid}`);
        }

        console.log("Set Selected Palette", uuid);
        this.selectedPaletteUuid = uuid;
    }

    @computed
    get selectedPalette(): PaletteEntry | undefined {
        return this.palettes.find(p => p.uuid === this.selectedPaletteUuid);
    }

    markAllDirty(): void {
        for (let i = 0; i < this.dirtyPixels.length; i++) {
            this.dirtyPixels[i] = true;
        }
    }
}
