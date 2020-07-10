import * as React from "react";
import { Modal } from "../components/modal";
import { safeParseInt } from "../util";

export interface NewProjectViewProps {
    open?: boolean;
    onCreate?(width: number, height: number): void;
    onClose?(): void;
}

export function NewProjectView(props: NewProjectViewProps): JSX.Element {
    const [width, setWidth] = React.useState("800");
    const [height, setHeight] = React.useState("600");

    const parsedWidth = safeParseInt(width);
    const parsedHeight = safeParseInt(height);

    const isGood = parsedWidth != null && parsedHeight != null;

    return (
        <Modal
            closeOnClickOutside
            onClose={props.onClose}
            header="Create a new project..."
            open={props.open}
        >
            <input
                placeholder="width"
                value={width}
                onChange={e => setWidth(e.currentTarget.value)}
            ></input>
            <input
                placeholder="height"
                value={height}
                onChange={e => setHeight(e.currentTarget.value)}
            ></input>
            <button disabled={!isGood} onClick={onCreate}>
                Create
            </button>
        </Modal>
    );

    function onCreate() {
        props.onCreate?.(parsedWidth ?? 0, parsedHeight ?? 0);
    }
}
