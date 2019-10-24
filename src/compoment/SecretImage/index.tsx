import { Component } from 'react';
import { inject, observer } from 'mobx-react';
import './super-encode';
import CodedStore from './../../stores/Coded';
interface IProps {
  coded?: CodedStore;
}
@inject('coded')
@observer
class SecretImage extends Component<IProps> {
  componentDidMount() {
    if (window.superEncoder && window.superEncoder.isLoaded) {
      const { coded } = this.props;
      coded.setLoaded(true);
    }
  }
  render() {
    return null;
  }
}

export default SecretImage;
