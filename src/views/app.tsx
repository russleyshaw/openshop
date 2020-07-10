import * as React from "react";
import styled from "styled-components";

import { Button, Navbar, Alignment, Tab, Tabs } from "@blueprintjs/core";

import { AppModel } from "../models/app";
import { NewProjectView } from "./new_project";

import { ProjectView } from "./project";
import { observer } from "mobx-react";
import { ProjectModel } from "../models/project";
import { IconNames } from "@blueprintjs/icons";

const RootDiv = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const FooterDiv = styled.div``;

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

export const AppView = observer((props: AppViewProps) => {
    const { model } = props;

    const project = model.projects.find(p => p.uuid === model.activeProjectUuid);

    return (
        <RootDiv>
            <Navbar>
                <Navbar.Group align={Alignment.LEFT}>
                    <Navbar.Heading>Paint</Navbar.Heading>
                </Navbar.Group>
            </Navbar>
            <Tabs onChange={uuid => (model.activeProjectUuid = uuid as string)}>
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
                                <Button minimal small icon={IconNames.CROSS} />
                            </TabTitleDiv>
                        }
                    />
                ))}
            </Tabs>
            {project && <ProjectView app={model} project={project} />}
        </RootDiv>
    );
});
