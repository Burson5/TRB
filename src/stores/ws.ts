import { observable, when, action } from 'mobx';
import Config from './config.conf';
import Cookie from '~/until/Cookie';
import { wsListener } from '~/websocket/modules/wsListeners';
import { Modules } from '~/websocket/Configs';
import webConnect from '~/until/WebConnect';
import SuperWebsocket from '~/websocket/SuperWebsocket';
import { ConstValues } from '~/until/ConstValues';
import { wsHttp } from '~/websocket/modules/wsHttp';

export class WebSocketStore {
  coded;
  userStore;

  onRedirect;
  onLanguageChange;

  tag: String;
  @observable superWebsocket: SuperWebsocket;
  @observable isAllReady: Boolean = false;
  /**
   * 读取初始化webscoket连接的数据
   * bid,
   * sid,
   * pid
   *
   */
  @observable initData;
  constructor(coded, tag) {
    this.coded = coded;
    this.tag = tag;
    // 开启监听
    this.addListener();
    if (webConnect.isDevelop()) {
      const bid = Config.bid;
      const pid = Config.pid;
      const sid = Config.sid;
      const bName = Config.bName;
      const cid = Config.cid;
      this.initConnect(bid, pid, sid, bName, cid);
    } else {
      Cookie.getCookie().then(res => {
        let bid;
        let pid;
        let sid;
        let bName;
        let cid;
        if (res instanceof Array) {
          res.forEach(item => {
            if (item.name == 'bid') {
              bid = item.value;
            }
            if (item.name == 'pid') {
              pid = item.value;
            }
            if (item.name == 'sid') {
              sid = item.value;
            }
            if (item.name == 'apiid') {
              console.log(`api:${item.value}`);
              webConnect.setBaseUrl(item.value);
            }
            if (item.name == 'bName') {
              bName = item.value;
            }
            if (item.name == 'cid') {
              cid = item.value;
            }
          });
          this.initConnect(bid, pid, sid, bName, cid);
        }
      });
    }
  }
  //
  @action
  addListener = () => {
    wsListener.addListener(
      Modules.WebBrowserManagerModule.key,
      Modules.WebBrowserManagerModule.action.OnRequestAdminRedirect,
      this.onRedirect
    );

    // 监听语言变化
    wsListener.addListener(
      Modules.SystemInfoModule.key,
      Modules.SystemInfoModule.action.OnLanguageChange,
      this.onLanguageChange
    );
  };
  // 初始化连接
  initConnect = (bid, pid, sid, bName, cid) => {
    console.log('读取', bid, pid, sid, bName, cid);
    this.initData = {
      bid,
      pid,
      sid,
      bName,
      cid
    };
    if (!bid || !pid || !sid || !bName || !cid) {
      return;
    }

    when(
      () => {
        return this.coded.isLoaded;
      },
      () => {
        this.superWebsocket = new SuperWebsocket({
          bid,
          pid,
          sid,
          bName,
          cid,
          tag: this.tag,
          coded: this.coded
        });
      }
    );
    when(
      () => {
        return (
          this.superWebsocket &&
          this.superWebsocket.connectStatus ===
            ConstValues.connectStatus.SUCCESS
        );
      },
      async () => {
        // 必须在app初始化完成后webscocket到 wsHttp中去
        wsHttp.setWebsocket(this);
        this.superWebsocket.addListener(wsListener);

        // 等待语言包获取完毕才表示初始化完成
        this.isAllReady = true;
      }
    );
  };
}
export default WebSocketStore;
