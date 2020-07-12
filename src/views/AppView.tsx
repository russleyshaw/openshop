import * as React from "react";
import { observer } from "mobx-react";
import styled from "styled-components";
import { Button, Tab, Tabs } from "@blueprintjs/core";

import { AppModel } from "../models/app";
import ProjectView from "./ProjectView";
import TopBarView from "./TopBarView";

const RootDiv = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
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

export default observer((props: AppViewProps) => {
    const { model } = props;

    const project = model.projects.find(p => p.uuid === model.selectedProjectUuid);

    return (
        <RootDiv>
            <TopBarView app={model} />

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
            {project && <ProjectView app={model} project={project} />}
        </RootDiv>
    );
});
