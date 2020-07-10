import { observable } from "mobx";
import { BaseToolModel, Tool } from "./common";

export class FillModel implements BaseToolModel {
    readonly tool = Tool.Fill;

    @observable
    tolerance = 5;
}
