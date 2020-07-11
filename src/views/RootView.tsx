import { useLocalStore } from "mobx-react";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import { createGlobalStyle } from "styled-components";
import { AppModel } from "../models/app";
import AppView from "./AppView";

const GlobalStyle = createGlobalStyle`
    html, body, #root {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;
    }
`;

function Root(): JSX.Element {
    const model = useLocalStore(() => new AppModel());

    return (
        <React.Fragment>
            <GlobalStyle />
            <AppView model={model} />
        </React.Fragment>
    );
}

export default hot(Root);
