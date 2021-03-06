import { useLocalStore } from "mobx-react";
import { hot } from "react-hot-loader/root";
import * as React from "react";
import { createGlobalStyle } from "styled-components";
import { AppModel } from "../models/app";
import AppView from "./AppView";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const GlobalStyle = createGlobalStyle`
    html, body, #root {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;
    }
`;

const model = new AppModel();
const project = model.addNewEmptyProject();

const layer = project.addNewEmptyLayer();

function Root(): JSX.Element {
    return (
        <React.Fragment>
            <DndProvider backend={HTML5Backend}>
                <GlobalStyle />
                <AppView model={model} />
            </DndProvider>
        </React.Fragment>
    );
}

export default hot(Root);
