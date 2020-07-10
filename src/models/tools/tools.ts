import { observable, action, computed } from "mobx";

import { SelectToolModel } from "./select";
import { BrushModel } from "./brush";
import { PencilModel } from "./pencil";
import { PanToolModel } from "./pan";
import { EraserModel } from "./eraser";
import { FillModel } from "./fill";
import { Tool } from "./common";

import { UnreachableError } from "../../util";
import { EyedropperModel } from "./eyedropper";

export type ToolState =
    | SelectToolModel
    | PanToolModel
    | PencilModel
    | BrushModel
    | EraserModel
    | FillModel
    | EyedropperModel;

export class ToolsModel {
    @observable
    select = new SelectToolModel();

    @observable
    pan = new PanToolModel();

    @observable
    pencil = new PencilModel();

    @observable
    brush = new BrushModel();

    @observable
    eraser = new EraserModel();

    @observable
    fill = new FillModel();

    @observable
    eyedropper = new EyedropperModel();

    @observable
    private currentTool: Tool = Tool.Select;

    constructor() {}

    @action
    setCurrent(tool: Tool) {
        this.currentTool = tool;
    }

    @computed
    get current(): ToolState {
        switch (this.currentTool) {
            case Tool.Select:
                return this.select;
            case Tool.Pan:
                return this.pan;
            case Tool.Pencil:
                return this.pencil;
            case Tool.Brush:
                return this.brush;
            case Tool.Eraser:
                return this.eraser;
            case Tool.Fill:
                return this.fill;
            case Tool.Eyedropper:
                return this.eyedropper;
            default:
                throw new UnreachableError(
                    `Unhandled or unknown tool ${this.currentTool}`,
                    this.currentTool
                );
        }
    }
}
