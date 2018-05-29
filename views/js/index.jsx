import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route } from 'react-router-dom'
import store from "./store/index";
import App from "./components/App";

var Layout = require('../layout');

class Index extends React.Component {
  render() {
    return (
      <Layout title={this.props.title}>
          <Provider store={store}>
            <Router>
              <App />
            </Router>
          </Provider>
          <div id="app"></div>
      </Layout>
    );
  }
}

module.exports = Index;
