import * as React from "react";
import styled from "styled-components";

export interface ModalProps extends React.PropsWithChildren<{}> {
    open?: boolean;
    header?: string;

    closeOnClickOutside?: boolean;

    onClose?(): void;
}

const PortalDiv = styled.div`
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    z-index: 1000;
`;

const RootDiv = styled.div`
    background-color: white;
    display: flex;
    flex-direction: column;
    padding: 8px;
`;

const HeaderDiv = styled.div`
    margin-bottom: 8px;
`;

const BodyDiv = styled.div`
    display: flex;
    flex-direction: column;
`;

export function Modal(props: ModalProps): JSX.Element | null {
    if (props.open !== true) {
        return null;
    }

    return (
        <PortalDiv onClick={onClickOutside}>
            <RootDiv onClick={e => e.stopPropagation()}>
                {props.header != null && <HeaderDiv>{props.header}</HeaderDiv>}

                <BodyDiv>{props.children}</BodyDiv>
            </RootDiv>
        </PortalDiv>
    );

    function onClickOutside() {
        if (props.closeOnClickOutside) {
            props.onClose?.();
        }
    }
}
