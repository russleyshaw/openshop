import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface FaIcon {
    icon: IconProp;
}

export function FaIcon(props: FaIcon): JSX.Element {
    return (
        <FontAwesomeIcon
            style={{
                width: 16,
                height: 16,
                marginTop: 2,
                display: "block",
            }}
            color="#a7b6c2"
            icon={props.icon}
        />
    );
}
