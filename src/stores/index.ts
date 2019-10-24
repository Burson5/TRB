import CodedStore from './Coded';
import { WebSocketStore } from './ws';
import { ConstValues } from '~/until/ConstValues';
import UserStore from './userStore';
import { observable } from 'mobx';

interface RootStore {
  coded: CodedStore;
  wsStore: WebSocketStore;
  userStore: UserStore;
}
class Root implements RootStore {
  @observable static instance: RootStore;

  coded: CodedStore;
  @observable wsStore: WebSocketStore;
  userStore: UserStore;

  constructor() {
    if (!Root.instance) {
      let self = this;
      this.userStore = new UserStore();
      this.coded = new CodedStore();
      this.wsStore = new WebSocketStore(
        this.coded,
        `${ConstValues.WEBSOKETTAGNAME}${Math.floor(Math.random() * 100)}`
      );
      Root.instance = self;
    }
    return Root.instance;
  }
}
export default Root;
