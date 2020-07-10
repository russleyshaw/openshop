export enum Tool {
    Select,
    Pan,
    Pencil,
    Brush,
    Eraser,
    Fill,
    Eyedropper,
}

export interface BaseToolModel {
    readonly tool: Tool;
}
