export class WSListeners implements MessageAble {
  observers: Array<{
    key: String;
    cb: Function;
  }> = [];
  onMessage = data => {
    if (data.requestId) {
      return;
    } else {
      let filters = this.observers.filter(item => {
        return item.key === `${data.module}/${data.action}`;
      });
      filters.forEach(item => {
        item.cb(data);
      });
    }
  };
  addListener = (moduleName: String, action: String, cb: Function) => {
    let key = `${moduleName}/${action}`;
    this.observers.push({
      key,
      cb,
    });
  };
  removeListener = (moduleName: String, action: String, cb?: Function) => {
    let key = `${moduleName}/${action}`;
    let filters = this.observers.filter(item => {
      return !(item.key == key && item.cb == cb);
    });
    this.observers = filters;
  };
  getObservers = () => this.observers;
}
export const wsListener = new WSListeners();
