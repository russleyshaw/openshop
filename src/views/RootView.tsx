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

project.addPalette([0, 0, 0, 255]);
project.addPalette([50, 25, 3, 255]);
project.addPalette([4, 200, 100, 255]);
project.addPalette([44, 44, 12, 255]);

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
