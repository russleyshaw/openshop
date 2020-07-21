import * as React from "react";
import styled from "styled-components";

export type FlexDivProps = {
    row?: true;
    col?: undefined;
} & {
    row?: undefined;
    col?: true;
};

export default styled.div<FlexDivProps>`
    display: flex;
    ${p => p.row != null && "flex-direction: row;"}
    ${p => p.col != null && "flex-direction: column;"}
`;
