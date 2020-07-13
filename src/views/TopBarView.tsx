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
import { IconNames } from "@blueprintjs/icons";
import { FaIcon } from "../components/fa_icon";
import { faFile, faFileExport } from "@fortawesome/free-solid-svg-icons";

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
                        <Button minimal large text="File" rightIcon={IconNames.CARET_DOWN} />
                        <Menu>
                            <MenuItem
                                text="New"
                                title="Creates a new empty project."
                                icon={<FaIcon icon={faFile} />}
                                onClick={() => app.addNewEmptyProject()}
                            />
                            <MenuDivider />
                            <MenuItem
                                icon={<FaIcon icon={faFileExport} />}
                                disabled={project == null}
                                text="Export"
                            />
                            <MenuDivider />
                            <MenuItem text="Close" />
                            <MenuItem text="Close Others" />
                            <MenuItem text="Close To The Right" />
                            <MenuItem text="Close All" />
                        </Menu>
                    </Popover>
                    <Popover>
                        <Button minimal large text="View" rightIcon={IconNames.CARET_DOWN} />
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
