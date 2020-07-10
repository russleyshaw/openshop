import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface ExternalIconProps {
    icon: IconProp;
}

export function ExternalIcon(props: ExternalIconProps): JSX.Element {
    return <FontAwesomeIcon color="#a7b6c2" icon={props.icon} />;
}
