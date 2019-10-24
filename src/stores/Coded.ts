import { observable, action } from 'mobx';
export class CodedStore {
  @observable secretor = null;
  @observable isLoaded = false;
  @action.bound setLoaded(isLoaded) {
    this.isLoaded = isLoaded;
    this.secretor = window.superEncoder;
    // 移除全局变量
    delete window.superEncoder;
    // 编码代码时加入的全局变量
    delete window.zg;
  }
  @action
  getSecretor = () => {
    return this.secretor;
  };
}
export default CodedStore;
