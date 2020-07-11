import { observer } from "mobx-react";

import * as React from "react";
import { ProgressBar, Colors } from "@blueprintjs/core";
import { Loader } from "../models/loader";
import styled from "styled-components";

export interface LoaderProgressProps {
    loader: Loader;
}

const RootDiv = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
`;
const TextDiv = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 8px;
    font-weight: bold;
    color: ${Colors.BLUE1};
`;

export default observer((props: LoaderProgressProps) => {
    const { loader } = props;

    const progress = loader.progress;

    if (progress == null) {
        return null;
    }

    return (
        <RootDiv>
            <ProgressBar value={progress} />
            <TextDiv>
                {loader.latest} ({loader.loaded} / {loader.loading + loader.loaded})
            </TextDiv>
        </RootDiv>
    );
});
