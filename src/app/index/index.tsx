// 模拟完整es2015+环境
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React, { Component } from 'react';
import { observer, Provider } from 'mobx-react';
import { HomePage } from '~/routes';
import { Switch, BrowserRouter, Route, Redirect } from 'react-router-dom';
import { render } from 'react-dom';
import RootStore from '~/stores';
import './style.scss';
@observer
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" component={HomePage} />
          <Redirect exact to="/" />
        </Switch>
      </BrowserRouter>
    );
  }
}
render(
  <Provider {...new RootStore()}>
    <App />
  </Provider>,
  document.getElementById('root')
);
