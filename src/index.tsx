// Make sure react-hot-loader is required before react and react-dom:
import "react-hot-loader";

import "core-js/stable";
import "regenerator-runtime/runtime";

import "./index.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import Root from "./views/RootView";

ReactDOM.render(<Root />, document.getElementById("root"));
