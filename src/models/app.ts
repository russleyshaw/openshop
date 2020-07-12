import { observable, action, computed } from "mobx";
import { ProjectModel } from "./project";
import { LayerModel } from "./layer";

export class AppModel {
    @observable
    selectedProjectUuid?: string;

    @observable
    projects: ProjectModel[] = [];

    constructor() {
        const width = 800;
        const height = 600;
        const newLayer1 = new LayerModel({ width, height });
        const newLayer2 = new LayerModel({ width, height });
        const newProj = new ProjectModel({ width, height });
        newProj.layers.push(newLayer1, newLayer2);
        newProj.setSelectedLayer(newLayer1.uuid);
        this.projects.push(newProj);
        this.selectedProjectUuid = newProj.uuid;
    }

    @computed
    get selectedProject(): ProjectModel | undefined {
        if (this.selectedProjectUuid == null) return undefined;

        return this.projects.find(p => p.uuid === this.selectedProjectUuid);
    }

    @action
    setSelectedProject(uuid: string): void {
        if (!this.projects.some(p => p.uuid === uuid)) {
            throw new Error(`Unable to find project uuid ${uuid}.`);
        }

        this.selectedProjectUuid = uuid;
    }
}
