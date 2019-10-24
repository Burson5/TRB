import React, { Component, Fragment } from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import Root from '~/stores';
import RootApp from '~/compoment/RootApp';
import BackScript from './script';

class App extends Component {
  backScript: BackScript;
  constructor(props) {
    super(props);
    this.backScript = new BackScript();
  }

  render() {
    const dom = this.props.children || '';
    return dom;
  }
}

render(
  <App>
    <Provider {...new Root()}>
      <RootApp>background</RootApp>
    </Provider>
  </App>,
  document.getElementById('root')
);
