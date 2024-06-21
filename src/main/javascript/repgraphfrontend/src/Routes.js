import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import HomePage from "./HomePage.js";
import Main from "./Main";
import ErrorPage from "./ErrorPage.js";

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <HomePage />
      </Route>
      <Route exact path="/main">
        <Main/>
      </Route>
      <Route exact path="/404">
        <ErrorPage />
      </Route>
      <Redirect to="/404" />
    </Switch>
  );
}
