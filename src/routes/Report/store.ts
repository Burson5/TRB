import { observable, action } from 'mobx';

class Store {
  @observable tabsKey = '1';

  constructor() {
    this.setLastOpened();
  }

  @action
  setLastOpened = () => {
    localStorage.popupLastOpened = new Date().getTime();
    chrome.runtime.sendMessage({ cmd: 'poll' });
  };
}

export default Store;
