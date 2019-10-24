import store from '../store';
import tabControl from '../crxTabControl';
import ToPopup from './toPopup';

class ToContent {
  store: store;
  scriptData: ScriptData;
  reportData: ReportData;
  toPopup: ToPopup;
  constructor(config) {
    this.store = config.store;
    this.scriptData = config.store.scriptData;
    this.reportData = config.store.reportData;
    this.toPopup = config.toPopup;
    /**
     * content消息监听
     */
    chrome.runtime.onMessage.addListener(config.addListener);
    // 关闭页面tabId -> null
    chrome.tabs.onRemoved.addListener(id => {
      if (id == this.scriptData.tabId) {
        this.scriptData.tabId == null;
      }
    });
  }

  sendMessageToContent = (message, callback) => {
    // 保存通信tabId， 确保通信content tab 相同
    if (this.scriptData.tabId == null) {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        this.scriptData.tabId = tabs.length ? tabs[0].id : null;
        chrome.tabs.sendMessage(this.scriptData.tabId, message, response => {
          if (callback) {
            callback(response);
          }
        });
      });
    } else {
      chrome.tabs.sendMessage(this.scriptData.tabId, message, response => {
        if (callback) {
          callback(response);
        }
      });
    }
  };

  // 等待content页面加载
  waitContentLoading = fun => {
    // tabId 不能存在 未能注入js或者不在亚马逊后台页面
    if (!this.scriptData.tabId) {
      const params = {
        cmd: 'sendMsg',
        msg: '请登录亚马逊后台或者刷新后台页面'
      };

      this.store.dataInit();
      this.toPopup.sendData();
      this.toPopup.connectPost(params);

      // 清空已选下载列表
      this.scriptData.currentReports = [];
      this.scriptData.current = 0;
      this.scriptData.running = false;

      console.log('[shopReport] 未能注入js或者不在亚马逊后台页面');
      return;
    }

    // 脚本运行结束
    if (!this.scriptData.running) {
      console.countReset('[shopReport] 等待页面加载');
      return;
    }

    console.count('[shopReport] 等待页面加载');
    if (!this.scriptData.contentReady) {

      // 页面加载时间为 n*20*500ms 页面重载
      if (this.scriptData.overTimeCount % 20 == 0) {
        try {
          chrome.tabs.get(this.scriptData.tabId, tabs => {
            if (!tabs) {
              this.scriptData.tabId = null;
            } else if (tabs.status == 'complete') {
              console.log({ tabs });
              // 页面加载时间超过 120*500ms 判定任务失败
              if (this.scriptData.overTimeCount >= 120) {
                this.scriptData.tabId = null;
                this.scriptData.overTimeCount = 0;
              } else {
                chrome.tabs.reload(this.scriptData.tabId);
              }
            }
          });
        } catch (error) {
          this.scriptData.tabId = null;
          console.error(error);
        }
      }

      setTimeout(
        this.waitContentLoading.bind(this, fun),
        this.scriptData.delay
      );
    } else {
      console.countReset('[shopReport] 等待页面加载');
      this.scriptData.overTimeCount = 0;

      if (this.scriptData.isLogin) {
        fun();
      } else {
        // 执行登录脚本
        console.log('[shopReport] 未登录');

        this.sendMessageToContent({ cmd: 'login' }, () => {});
        this.scriptData.contentReady = false;
        setTimeout(
          this.waitContentLoading.bind(this, fun),
          this.scriptData.delay
        );
      }
    }
    // 计数器+1
    this.scriptData.overTimeCount++;
  };

  // 等待子页面页面加载
  waitSubpageLoading = (fun, Id) => {
    // 脚本运行结束
    let timeCount = 0;
    let pageReady = false;

    let eventLoop = () => {
      timeCount++;

      chrome.tabs.get(Id, tabs => {
        if (tabs.status == 'complete') {
          pageReady = true;
        }
        console.log(pageReady, 'waitSubpageLoading');
        if (!pageReady) {
          // 页面加载时间为 n*20*500ms 页面重载
          if (timeCount % 20 == 0) {
            chrome.tabs.reload(Id);
          }
          setTimeout(eventLoop, this.scriptData.delay);
        } else {
          timeCount = 0;
          fun();
        }
      });
    };
    eventLoop();
  };

  // 发送content中断指令
  stopWork = () => {
    console.log('[shopReport] 发送中断脚本指令');
    this.sendMessageToContent({ cmd: 'cancel' }, () => {});
  };

  // 发送content执行指令
  startWork = () => {
    console.log(
      `[shopReport] 发送执行脚本指令 ${this.scriptData.currentReports[this.scriptData.current].name}`
    );
    if (
      this.scriptData.currentReports[this.scriptData.current].key == '0' &&
      !this.scriptData.currentReports[this.scriptData.current].name.search(
        this.scriptData.currentReports[this.scriptData.current].name
      )
    ) {
      this.scriptData.currentReports[
        this.scriptData.current
      ].name = this.scriptData.currentReports[this.scriptData.current].name;
    }
    console.log(
      this.scriptData.currentReports[this.scriptData.current].name,
      'name'
    );
    this.sendMessageToContent(
      {
        cmd: 'download',
        data: this.scriptData.currentReports[this.scriptData.current]
      },
      () => {}
    );
    if (this.scriptData.currentReports[this.scriptData.current].reportType) {
      // 日期范围报告 有两个选项可选
      if (
        this.scriptData.currentReports[this.scriptData.current].reportType[0]
          .state == true
      ) {
        this.scriptData.currentReports[
          this.scriptData.current
        ].reportType[0].state = false;
      }
    }
  };

  // 发送content页面跳转指令
  pageJump = () => {
    this.reportData.reportMap.find(
      item =>
        item.key == this.scriptData.currentReports[this.scriptData.current].key
    ).downLoading = true;
    this.toPopup.sendData();

    console.log('[shopReport] 发送页面跳转指令');
    console.log(
      `[shopReport] 跳转链接：${this.scriptData.currentReports[this.scriptData.current].url}`
    );
    this.scriptData.contentReady = false;
    this.sendMessageToContent(
      {
        cmd: 'pageJump',
        url: this.scriptData.currentReports[this.scriptData.current].url,
        data: this.scriptData.currentReports[this.scriptData.current]
      },
      res => {
        if (res && res.cmd == 'startWork') {
          // 由于后四个为相同路径下 hash改变需要手动触发更新
          if (
            parseInt(
              this.scriptData.currentReports[this.scriptData.current].key
            ) > 3 &&
            this.scriptData.current - 1 >= 0 &&
            parseInt(
              this.scriptData.currentReports[this.scriptData.current - 1].key
            ) > 3
          ) {
            chrome.tabs.reload(this.scriptData.tabId);
          }
          this.waitContentLoading(this.startWork);
        }
      }
    );
  };

  pageHome = () => {
    console.log('[shopReport] 跳转首页');
    this.scriptData.contentReady = false;
    this.sendMessageToContent(
      {
        cmd: 'pageJump',
        url: 'https://{{host}}/home',
        data: this.scriptData.currentReports[this.scriptData.current]
      },
      res => {
        if (res && res.cmd == 'startWork') {
          this.waitContentLoading(this.pageJump);
        }
      }
    );
  };
}

export default ToContent;
