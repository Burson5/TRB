import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { ConstValues } from '~/until/ConstValues';
import SecretImage from '../SecretImage';
import WebSocketStore from '~/stores/ws';
import UserStore from '~/stores/userStore';
import { observable, action, when } from 'mobx';
import Crypto from 'crypto-js';

window.Crypto = Crypto;

interface IProps {
  wsStore?: WebSocketStore;
  userStore?: UserStore;
}

@inject('wsStore', 'userStore')
@observer
class RootApp extends React.Component<IProps> {
  @observable status: number = ConstValues.connectStatus.INIT;
  componentDidMount() {
    when(
      () => {
        return !!this.props.wsStore.isAllReady;
      },
      () => {
        this.init();
      }
    );
  }

  // 初始化功能
  @action
  init = async () => {
    console.log('RootApp init');
    try {
      const { userStore } = this.props;
      await userStore.getMachineData();
      await userStore.getUser();
      this.afterInit();
    } catch (e) {
      console.log(e);
    }
    // let res = await Http.post('/platforms');
    // console.log({ res });
  };

  // 初始化完毕，后续组件可以正常使用所有ws请求，http请求，登录信息等功能或数据
  @action
  afterInit = () => {
    this.status = ConstValues.connectStatus.SUCCESS;
  };
  render() {
    let dom;
    if (this.status === ConstValues.connectStatus.SUCCESS) {
      dom = this.props.children;
    } else {
      dom = <SecretImage />;
    }
    return dom;
  }
}
export default RootApp;
