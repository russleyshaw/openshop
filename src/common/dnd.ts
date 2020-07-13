import { RGBA } from "./colors";
import { DragObjectWithType } from "react-dnd";

export const ITEM_TYPES = {
    paletteColor: "palette-color",
} as const;

export interface PaletteColorItem extends DragObjectWithType {
    type: typeof ITEM_TYPES["paletteColor"];
    color: RGBA;
}
