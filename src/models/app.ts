import { observable, action } from "mobx";
import { ToolsModel } from "./tools";
import { ProjectModel } from "./project";
import { LayerModel } from "./layer";

export class AppModel {
    @observable
    activeProjectUuid?: string;

    @observable
    projects: ProjectModel[] = [];

    constructor() {
        const width = 800;
        const height = 600;
        const newLayer1 = new LayerModel({ width, height });
        const newLayer2 = new LayerModel({ width, height });
        const newProj = new ProjectModel({ width, height });
        newProj.layers.push(newLayer1, newLayer2);
        newProj.setActiveLayer(newLayer1.uuid);
        this.projects.push(newProj);
        this.activeProjectUuid = newProj.uuid;
    }
}
