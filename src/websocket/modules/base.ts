import SuperWebsocket from '../SuperWebsocket';
import { when, observable, toJS } from 'mobx';

class BaseModule {
  moduleName: String;
  superWebsocket: SuperWebsocket;
  @observable resultDatas: Map<String, ResultData> = new Map();
  // 设置websocket
  setWebsocket = (superWebsocket: SuperWebsocket) => {
    this.superWebsocket = superWebsocket;
  };
  // 收到消息
  onMessage = (data: ResultData) => {
    if (this.resultDatas.get(data.requestId)) {
      this.setData(data);
    }
  };
  // 发送消息
  send = data => {
    const requestId = this.superWebsocket.send(data, this.moduleName);
    let promise = new Promise<ResultData>((resolve, reject) => {
      when(
        () => {
          let resultData = toJS(this.resultDatas.get(requestId));
          return !!resultData;
        },
        () => {
          let resultData = toJS(this.resultDatas.get(requestId));
          this.resultDatas.delete(requestId);
          if (resultData.ret == 0) {
            resolve(resultData);
          } else {
            reject(resultData);
          }
        }
      );
    });
    return promise;
  };

  request = (url, params) => {
    let urlArr = url.split('/');
    let moduleName = urlArr[0];
    let actionName = urlArr[0];

    const requestId = this.superWebsocket.send(
      { action: actionName, args: params },
      moduleName
    );
    let promise = new Promise<ResultData>((resolve, reject) => {
      when(
        () => {
          let resultData = toJS(this.resultDatas.get(requestId));
          return !!resultData;
        },
        () => {
          let resultData = toJS(this.resultDatas.get(requestId));
          this.resultDatas.delete(requestId);
          if (resultData.ret == 0) {
            resolve(resultData);
          } else {
            reject(resultData);
          }
        }
      );
    });
    return promise;
  };

  // 设置数据
  setData = (data: ResultData) => {
    this.resultDatas.set(data.requestId, data);
  };
}
export default BaseModule;
