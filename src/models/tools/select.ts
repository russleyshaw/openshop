import { Tool, BaseToolModel } from "./common";

export class SelectToolModel implements BaseToolModel {
    readonly tool = Tool.Select;
}
