import * as React from "react";
import {
    Navbar,
    NavbarGroup,
    NavbarHeading,
    NavbarDivider,
    Alignment,
    ButtonGroup,
    Popover,
    Button,
    Menu,
    MenuItem,
    MenuDivider,
} from "@blueprintjs/core";
import { observer } from "mobx-react";
import { AppModel } from "../models/app";

export interface TopBarProps {
    app: AppModel;
}

export default observer((props: TopBarProps) => {
    const { app } = props;
    const project = app.selectedProject;

    return (
        <Navbar>
            <NavbarGroup align={Alignment.LEFT}>
                <NavbarHeading>OpenShop</NavbarHeading>
                <NavbarDivider />
                <ButtonGroup>
                    <Popover>
                        <Button minimal large text="File" />
                        <Menu>
                            <MenuItem text="New" />
                            <MenuDivider />
                            <MenuItem disabled={project == null} text="Export" />
                            <MenuDivider />
                            <MenuItem text="Close" />
                            <MenuItem text="Close Others" />
                            <MenuItem text="Close To The Right" />
                            <MenuItem text="Close All" />
                        </Menu>
                    </Popover>
                    <Popover>
                        <Button minimal large text="View" />
                        <Menu>
                            <MenuItem text="Reset To Fit" />
                            <MenuItem text="Reset To 100%" />
                        </Menu>
                    </Popover>
                </ButtonGroup>
            </NavbarGroup>
        </Navbar>
    );
});
