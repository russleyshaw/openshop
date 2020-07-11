import * as React from "react";
import styled from "styled-components";

import { Button, Tab, Tabs } from "@blueprintjs/core";

import { AppModel } from "../models/app";

import { observer } from "mobx-react";
import { loader } from "../models/loader";
import LoaderProgressView from "./LoaderProgressView";

const RootDiv = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const TabTitleDiv = styled.div`
    display: grid;
    grid-template-columns: 100px auto auto;
`;

const TabTitleNameDiv = styled.div`
    text-overflow: ellipsis;
    word-wrap: unset;
    overflow: hidden;
    white-space: nowrap;
`;

export interface AppViewProps {
    model: AppModel;
}

const TopBar = React.lazy(() => loader.load("Loading top bar...", () => import("./topbar")));
const ProjectView = React.lazy(() =>
    loader.load("Loading project view...", () => import("./project"))
);

export default observer((props: AppViewProps) => {
    const { model } = props;

    const project = model.projects.find(p => p.uuid === model.selectedProjectUuid);

    return (
        <RootDiv>
            <LoaderProgressView loader={loader} />

            <React.Suspense fallback={null}>
                <TopBar app={model} />
            </React.Suspense>

            <Tabs onChange={uuid => (model.selectedProjectUuid = uuid as string)}>
                {model.projects.map(proj => (
                    <Tab
                        key={proj.uuid}
                        id={proj.uuid}
                        title={
                            <TabTitleDiv>
                                <TabTitleNameDiv title={proj.uuid}>{proj.uuid}</TabTitleNameDiv>
                                <div>
                                    ({proj.width}x{proj.height})
                                </div>
                                <Button icon="cross" minimal small />
                            </TabTitleDiv>
                        }
                    />
                ))}
            </Tabs>
            <React.Suspense fallback={null}>
                {project && <ProjectView app={model} project={project} />}
            </React.Suspense>
        </RootDiv>
    );
});
