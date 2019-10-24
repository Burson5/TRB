import { action, observable, toJS } from 'mobx';
class Store {
  // 长连接
  @observable port = null;

  // 文件名前缀
  @observable filename = {
    prefix: ''
  };

  @observable reportLoading = false;

  // 报表信息
  @observable reportMap = [];

  // 下载状态
  @observable isDownLoading = false;

  // 运行信息
  @observable runStatus: runStatus = {};

  @observable downError = false;
  @observable downErrorMsg = '';

  // 语言
  @observable language = '';

  @observable selectItems = [];

  constructor() {
    this.init();
    // 监听返回消息
    this.port.onMessage.addListener(config => {
      //监听消息
      switch (config.cmd) {
        case 'sendDate':
          this.reportLoading = false;
          this.saveDate(config);
          break;

        case 'sendMsg':
          this.downError = true;
          this.downErrorMsg = config.msg;
          console.log(config.msg);
          break;

        case 'end':
          this.cancelDownload();
          break;
      }
      console.log(config, 'msg');
    });
  }

  @action
  selectChange = value => {
    this.selectItems = value;
    this.reportMap.forEach((item, index) => {
      if (value.includes(item.name)) {
        item.checked = true;
      } else {
        item.checked = false;
      }
    });
  };

  @action
  changeAllTime = value => {
    let time = [];
    if (value.length) {
      time.push(value[0].format('YYYY-MM-DD'));
      time.push(value[1].format('YYYY-MM-DD'));
      this.reportMap.forEach(item => {
        item.allTime = time;
      });
    } else {
      this.reportMap.forEach(item => {
        item.allTime = '';
      });
    }
  };

  // 更改文件前缀
  @action
  changeFilename = name => {
    this.filename.prefix = name;
  };

  // 保存返回数据
  @action
  saveDate = data => {
    [
      this.filename,
      this.reportMap,
      this.isDownLoading,
      this.runStatus,
      this.language
    ] = [
      data.filename,
      data.reportMap,
      data.isDownLoading,
      data.runStatus,
      data.language
    ];

    // 初始选择数据
    this.selectItems = [];
    data.reportMap.forEach(item => {
      if (item.checked) {
        this.selectItems.push(item.name);
      }
    });
  };

  // 开始下载
  @action
  downLoad = () => {
    this.isDownLoading = true;
    let params = {
      cmd: 'download',
      filename: toJS(this.filename),
      reportMap: toJS(this.reportMap),
      isDownLoading: this.isDownLoading,
      language: this.language
    };
    this.port.postMessage(params);
  };

  // 取消下载
  @action
  cancelDownload = () => {
    if (this.isDownLoading) {
      this.isDownLoading = false;
      let params = {
        cmd: 'cancel'
      };
      this.port.postMessage(params);
    }
  };

  // 初始化链接
  @action
  init = () => {
    this.port = chrome.runtime.connect({ name: 'reportConnect' }); // 通道名称
    // 发起链接 初始化
    this.reportLoading = true;
    this.port.postMessage({ cmd: 'init' });
  };
}

export default Store;
