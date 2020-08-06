import * as React from "react";
import { observer } from "mobx-react";
import {
    Dialog,
    Classes,
    ProgressBar,
    Label,
    Tag,
    Button,
    AnchorButton,
    ButtonGroup,
    H3,
    H5,
} from "@blueprintjs/core";
import styled from "styled-components";
import { AlphaBackdropDiv } from "./alpha_backdrop";
import { IconNames } from "@blueprintjs/icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FaIcon } from "./fa_icon";
import { NODE_ENV, GIT_HASH, TIMESTAMP } from "../var";

export interface AboutModalProps {
    open?: boolean;
    onClose?(): void;
}

const DialogBody = styled.div`
    display: flex;
    flex-direction: column;
    margin: 16px 16px;
`;

function ArgEntry(props: { name: string; value: string }): JSX.Element {
    return (
        <div>
            <span style={{ fontWeight: "bold", marginRight: "1em" }}>{props.name}:</span>
            <span>{props.value}</span>
        </div>
    );
}

const ArgDiv = styled.div`
    margin: 1em 0;
`;

export default observer((props: AboutModalProps) => {
    return (
        <Dialog
            canOutsideClickClose
            isCloseButtonShown
            isOpen={props.open}
            onClose={() => props.onClose?.()}
            title="About"
        >
            <DialogBody>
                <H3>OpenShop</H3>

                <span className={Classes.TEXT_SMALL}>Copyright &copy; 2020 Russley Shaw</span>

                <ArgDiv>
                    <ArgEntry name="Mode" value={NODE_ENV} />
                    <ArgEntry name="Hash" value={GIT_HASH} />
                    <ArgEntry name="Built" value={TIMESTAMP} />
                </ArgDiv>

                <ButtonGroup fill>
                    <AnchorButton
                        icon={<FaIcon icon={faGithub} />}
                        fill
                        target="_blank"
                        text="GitHub"
                        href="https://github.com/russleyshaw/openshop"
                    />
                    <AnchorButton
                        className={Classes.FIXED}
                        icon={IconNames.ISSUE_NEW}
                        text="New Issue"
                        target="_blank"
                        href="https://github.com/russleyshaw/openshop/issues/new"
                    />
                </ButtonGroup>
            </DialogBody>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button text="Close" onClick={() => props.onClose?.()} />
                </div>
            </div>
        </Dialog>
    );
});
