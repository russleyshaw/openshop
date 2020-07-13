import { observable, action, computed } from "mobx";
import { ProjectModel } from "./project";
import { LayerModel } from "./layer";
import { getNextName } from "../common/util";

export class AppModel {
    @observable
    selectedProjectUuid?: string;

    @observable
    projects: ProjectModel[] = [];

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

    @action
    addNewEmptyProject(name?: string): ProjectModel {
        const width = 800;
        const height = 600;

        const myName =
            name ??
            getNextName(
                "Untitled #",
                this.projects.map(p => p.name)
            );

        const newProj = new ProjectModel({ width, height, name: myName });
        const myLayer = newProj.addNewEmptyLayer();
        newProj.setSelectedLayer(myLayer.uuid);
        this.projects.push(newProj);

        this.setSelectedProject(newProj.uuid);

        return newProj;
    }
}
