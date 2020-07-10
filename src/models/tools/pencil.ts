import { BaseToolModel, Tool } from "./common";
import { observable } from "mobx";

export class PencilModel implements BaseToolModel {
    readonly tool = Tool.Pencil;

    @observable
    size = 1;
}
