import { v4 as uuidv4 } from "uuid";
import { observable, computed, action } from "mobx";
import { LayerModel } from "./layer";

import { Vec4 } from "../util";

export enum Tool {
    Select,
    Pan,
    Pencil,
    Brush,
    Eraser,
    Fill,
    Eyedropper,
}

export interface ProjectModelArgs {
    width: number;
    height: number;
}

export class ProjectModel {
    readonly uuid: string;

    readonly width: number;
    readonly height: number;

    @observable
    layers: LayerModel[] = [];

    @observable
    primaryColor: Vec4 = [0, 0, 0, 255];

    @observable
    secondaryColor: Vec4 = [255, 255, 255, 255];

    @observable
    selectedLayerUuid?: string;

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

    constructor(args: ProjectModelArgs) {
        this.width = args.width;
        this.height = args.height;
        this.uuid = uuidv4();
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
    addLayer(): void {
        const newLayer = new LayerModel({ width: this.width, height: this.height });
        this.layers.push(newLayer);
    }

    @action
    deleteLayer(uuid: string): void {
        const idx = this.layers.findIndex(l => l.uuid === uuid);
        if (idx < 0) return;
        this.layers.splice(idx, 1);
    }
}
