import { observable } from "mobx";
import { BaseToolModel, Tool } from "./common";

export class EraserModel implements BaseToolModel {
    readonly tool = Tool.Eraser;

    @observable
    size = 4;
}
