import { when, observable, toJS } from 'mobx';
import WebSocketStore from '~/stores/ws';

export class WSHttp implements MessageAble {
  @observable resultDatas: Map<String, MapData> = new Map();
  @observable webSocketStore: WebSocketStore;
  setWebsocket = (webSocketStore: WebSocketStore) => {
    this.webSocketStore = webSocketStore;
  };
  // 收到消息
  onMessage = (data: ResultData) => {
    this.setData(data);
  };

  // 请求
  request = (moduleName: string, actionName: String, params?) => {
    let sendData;
    if (params) {
      // 如果参数是数组的，直接使用传入参数，如果不是数组，外层要包一个数组
      if (params instanceof Array) {
        sendData = {
          action: actionName,
          args: params,
        };
      } else {
        sendData = {
          action: actionName,
          args: [params],
        };
      }
    } else {
      sendData = {
        action: actionName,
      };
    }

    const requestId = this.webSocketStore.superWebsocket.send(
      sendData,
      moduleName
    );
    this.resultDatas.set(requestId, {
      url: `${moduleName}/${actionName}`,
      data: null,
    });

    let promise = new Promise<ResultData>((resolve, reject) => {
      when(
        () => {
          let resultData = toJS(this.resultDatas.get(requestId)).data;
          return !!resultData;
        },
        () => {
          let resultData = toJS(this.resultDatas.get(requestId)).data;
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
    let resultData = toJS(this.resultDatas.get(data.requestId));
    if (resultData) {
      let mapData = {
        url: resultData.url,
        data,
      };
      this.resultDatas.set(data.requestId, mapData);
    }
  };
}
export const wsHttp = new WSHttp();
