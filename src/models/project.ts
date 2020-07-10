import { v4 as uuidv4 } from "uuid";
import { observable, computed, action } from "mobx";
import { ToolsModel } from "./tools";
import { LayerModel } from "./layer";

import { Vec4 } from "../util";

export interface ProjectModelArgs {
    width: number;
    height: number;
}

export class ProjectModel {
    readonly uuid: string;

    readonly width: number;
    readonly height: number;

    @observable
    tools: ToolsModel = new ToolsModel();

    @observable
    layers: LayerModel[] = [];

    @observable
    primaryColor: Vec4 = [0, 0, 0, 255];

    @observable
    secondaryColor: Vec4 = [255, 255, 255, 255];

    @observable
    activeLayerUuid?: string;

    constructor(args: ProjectModelArgs) {
        this.width = args.width;
        this.height = args.height;
        this.uuid = uuidv4();
    }

    @computed
    get activeLayer(): LayerModel | undefined {
        if (this.activeLayerUuid == null) return undefined;

        const foundLayer = this.layers.find(l => l.uuid === this.activeLayerUuid);
        return foundLayer;
    }

    @action
    setActiveLayer(uuid: string): void {
        if (!this.layers.some(l => l.uuid === uuid)) {
            throw new Error(`Provided UUID does not match any layeer UUIDs. Provided: ${uuid}`);
        }

        this.activeLayerUuid = uuid;
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
