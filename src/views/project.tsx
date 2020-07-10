import * as React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";

import { ToolboxView } from "./toolbox";
import { ProjectStageView } from "./project_stage";
import { AppModel } from "../models/app";
import { ProjectModel } from "../models/project";
import { SidebarView } from "./sidebar";

const RootDiv = styled.div`
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    border-top: 1px solid black;
`;

export interface ProjectViewProps {
    app: AppModel;
    project: ProjectModel;
}

export const ProjectView = observer((props: ProjectViewProps) => {
    const { app, project } = props;

    return (
        <RootDiv>
            <ToolboxView project={project} />
            <ProjectStageView app={app} project={project} />
            <SidebarView project={project} />
        </RootDiv>
    );
});
