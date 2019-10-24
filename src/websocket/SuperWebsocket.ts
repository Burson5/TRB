import { observable } from 'mobx';
import { wsHttp } from './modules/wsHttp';
import CodedStore from '~/stores/Coded';
import { Modules } from './Configs';
import { ConstValues } from '~/until/ConstValues';

interface Config {
  pid: String; // 端口号
  uid?: String; // 用户id
  bid: String; // 浏览器ID,用于定位ws客户端
  cid: String;
  bName?: String,
  sid: String; // 加密字符串
  tag: String; // 浏览器内部模块Tag,用于定位ws客户端
  coded: CodedStore; // 加密对象

}
class SuperWebsocket {
  config: Config;
  websocket: WebSocket; // websocket对象

  // 加解密key
  keys;
  retryConnectTimer; // 重试连接定时器
  @observable connectStatus: number = ConstValues.connectStatus.INIT; // 连接状态
  listeners: Array<MessageAble> = [];
  connectRequestId: String;

  constructor(config: Config) {
    this.config = config;
    this.getEncodeKey(config.sid);
    this.connect();
    this.addListener(wsHttp);
  }

  // 获取加解密key
  getEncodeKey = originKey => {
    this.keys = {
      ...this.keys,
      ...{
        originKey: '',
        key: originKey.substr(1, 16),
        iv: originKey.substr(3, 16),
        deKey: originKey.substr(0, 16),
        deIv: originKey.substr(4, 16)
      }
    };
    return this.keys;
  };
  // 设置消息监听器
  addListener = (listener: MessageAble) => {
    this.listeners.push(listener);
  };

  // 加密
  encode = originStr => {
    // return originStr;
    let secretor = this.config.coded.getSecretor();
    return secretor.encode(originStr, this.keys.key, this.keys.iv);
  };

  // 解密
  decode = encodeStr => {
    // return encodeStr;
    let secretor = this.config.coded.getSecretor();
    let res = secretor.decode(encodeStr, this.keys.deKey, this.keys.deIv);
    return res;
  };

  // 连接websocket
  connect = () => {
    // let ws = new WebSocket(`ws://10.100.16.245:${this.config.pid}`);
    let ws = new WebSocket(`ws://localhost:${this.config.pid}`);

    // 用于指定连接成功后的回调函数
    ws.onopen = () => {
      this.websocket = ws;
      // 发送开启链接
      this.connectRequestId = this.applyForConnect();
    };
    // 用于指定当从服务器接受到信息时的回调函数
    ws.onmessage = e => {
      try {
        let data = this.decode(e.data);
        data = JSON.parse(data);
        if (data.requestId == this.connectRequestId) {
          if (data.ret == 0) {
            // 保活
            setInterval(() => {
              this.keepAlive();
            }, 30 * 1000);
            this.connectStatus = ConstValues.connectStatus.SUCCESS;
          } else {
            this.connectStatus = ConstValues.connectStatus.FAIL;
            this.retryConnect();
          }
        }
        this.listeners.forEach(listener => {
          listener.onMessage(data);
        });
      } catch (err) {
        console.log(err);
      }
    };

    // 用于指定连接关闭后的回调函数
    ws.onclose = e => {
      console.log('WebSocket is closed now.');
    };

    // 用于指定连接失败后的回调函数
    ws.onerror = e => {
      console.log('WebSocket has error now.');
    };
  };

  // 获取默认参数
  getDefaultParams = (moduleName: String) => {
    return {
      requestId: `${new Date().getTime()}_${Math.floor(Math.random() * 100)}`,
      module: moduleName,
      browserId: this.config.bid,
      tag: this.config.tag
    };
  };

  // 重试重新连接
  retryConnect = () => {
    let time = 400; // 重试时间
    this.retryConnectTimer = setTimeout(() => {
      this.connect();
    }, time);
  };

  // 保活
  keepAlive = () => {
    wsHttp.request(
      Modules.WsAuthoModule.key,
      Modules.WsAuthoModule.action.HeartBeat
    );
  };

  // 申请连接
  applyForConnect = () => {
    let params = {
      action: Modules.WsAuthoModule.action.ClientConnected
    };
    return this.send(params, Modules.WsAuthoModule.key);
  };

  // 发送消息
  send = (msg: Object, moduleName?: String) => {
    let data = { ...this.getDefaultParams(moduleName), ...msg };
    let params = JSON.stringify(data);
    if (this.websocket) {
      let readyState = this.websocket.readyState;
      params = this.encode(params);
      // 已经链接并且可以通讯
      if (readyState == 1) {
        this.websocket.send(params);
      }
    }
    return data.requestId;
  };
}
export default SuperWebsocket;
