class ToPopup {
  // popup长连接
  connectPort = null;
  reportData: ReportData;

  constructor(config) {
    this.reportData = config.store.reportData;
    /**
     * 长连接通信 传输报表信息
     */
    chrome.runtime.onConnect.addListener(port => {
      // 暴露连接口
      this.connectPort = port;
      // 监听链接信息
      port.onMessage.addListener(config.addListener);
      // 监听链接关闭
      port.onDisconnect.addListener(() => {
        this.connectPort = null;
      });
    });
  }

  // 长连接发送数据方法
  connectPost = msg => {
    // 控制再popup开启状态通信
    if (this.connectPort) {
      this.connectPort.postMessage(msg);
    }
  };

  // 发送报表数据
  sendData = () => {
    const params = {
      cmd: 'sendDate',
      ...this.reportData
    };
    this.connectPost(params);
  };
}

export default ToPopup;
