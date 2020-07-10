import * as React from "react";
import styled from "styled-components";

import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

export interface TabProps {
    key: string;
    name?: string;
    onClick?: () => void;
    onClose?: () => void;
}

export interface TabsProps {
    active?: string;
    tabs: TabProps[];
}

const RootDiv = styled.div`
    display: flex;
    flex-direction: row;
    overflow-x: auto;

    border-top: 1px black solid;
`;

const TabElement = styled.div<{ active?: boolean; minWidth?: number }>`
    display: flex;
    flex-direction: row;
    align-items: center;

    padding: 4px;
    border-right: 1px black solid;

    background-color: ${p => (p.active === true ? "rgba(0, 0, 0, 0.25)" : "inherit")};

    &:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
`;

const NameDiv = styled.div`
    overflow: hidden;
    white-space: nowrap;
    width: 150px;
    text-overflow: ellipsis;
`;

export default function Tabs(props: TabsProps): JSX.Element {
    return (
        <RootDiv>
            {props.tabs.map(tab => (
                <TabElement key={tab.key} onClick={tab.onClick} active={props.active === tab.key}>
                    <NameDiv title={tab.name}>{tab.name}</NameDiv>
                    {tab.onClose && <Button icon={IconNames.CROSS} onClick={tab.onClose} />}
                </TabElement>
            ))}
        </RootDiv>
    );
}
