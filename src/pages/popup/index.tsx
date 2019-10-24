import React from 'react';
import { render } from 'react-dom';
import style from './style.scss';
import Report from '../../routes/Report';

class App extends React.Component {
  render() {
    return (
      <div className={style.body}>
        <Report />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
