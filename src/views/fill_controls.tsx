import * as React from "react";
import styled from "styled-components";
import { FillModel } from "../models/tools";
import { observer } from "mobx-react";
import { RGBASlider } from "../components/rgba_picker";

const RootDiv = styled.div`
    display: flex;
    flex-direction: column;
`;

export interface FillControlsProps {
    model: FillModel;
}

const Title = styled.span``;

export const FillControlsView = observer((props: FillControlsProps) => {
    const { model } = props;

    return (
        <RootDiv>
            <Title>Fill</Title>

            <RGBASlider color={model.color} onChange={c => (model.color = c)} />
        </RootDiv>
    );
});
