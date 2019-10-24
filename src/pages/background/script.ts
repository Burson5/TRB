import { toJS } from 'mobx';
import RootStore from '~/stores';
import Store from './store';
import CrxTabControl from './crxTabControl';
import ToPopup from './crxConnectControl/toPopup';
import ToContent from './crxConnectControl/toContent';
import CreateHash from '~/until/CreateHash';

class BackScript {
  store: Store;
  crxTabControl: CrxTabControl;
  toPopup: ToPopup;
  toContent: ToContent;
  constructor() {
    console.log('[shopReport] background载入');
    this.store = new Store();
    this.crxTabControl = new CrxTabControl({ store: this.store });
    this.toPopup = new ToPopup({
      store: this.store,
      addListener: this.popupAddListener
    });
    this.toContent = new ToContent({
      store: this.store,
      toPopup: this.toPopup,
      addListener: this.contentAddListener
    });

    // 监听下载完成文件名
    chrome.downloads.onDeterminingFilename.addListener(
      this.downloadAddListenerFileRename
    );

    chrome.downloads.onChanged.addListener(this.downloadAddListenerChange);
  }

  contentAddListener = (request, sender, response) => {
    console.log('contentAddListener', request);
    switch (request.cmd) {
      // content 页面准备就绪
      case 'contentReady':
        this.contentAddListenerPageReady(request, sender, response);
        break;
      case 'saveHost':
        this.contentAddListenerSaveHost(request, sender, response);
        break;
      case 'pushUrl':
        this.contentAddListenerPushUrl(request, sender, response);
        break;
      case 'noData':
        this.contentAddListenerNoData(request, sender, response);
        break;
      case 'closeOthersTab':
        this.contentAddListenerCloseOthersTab(request, sender, response);
        break;
      case 'toCreatPdf':
        this.contentAddListenerToCreatPdf(request, sender, response);
        break;
      case 'continue':
        this.contentAddListenerContinue(request, sender, response);
        break;
      case 'scriptEnd':
        this.contentAddListenerScriptEnd(request, sender, response);
        break;
    }
  };

  contentAddListenerPageReady = (request, sender, response) => {
    this.crxTabControl.getHomeTab(this.toPopup.connectPort);
    this.crxTabControl.jumpToHomeTab();
    setTimeout(() => {
      if (sender.tab.id == this.store.scriptData.tabId) {
        console.log('[shopReport] 主页面准备就绪', {
          tabId: this.store.scriptData.tabId
        });
        this.store.scriptData.isLogin = request.isLogin;
        this.store.scriptData.contentReady = true;
      }
    }, 0);
  };
  contentAddListenerSaveHost = (request, sender, response) => {
    this.store.reportData.filename.host = request.host;
  };
  contentAddListenerPushUrl = (request, sender, response) => {
    if (request.base64) {
      this.store.pdfAddPut({
        fileName: request.name,
        suffix: 'pdf',
        base64: request.base64
      });
    } else {
      this.store.scriptData.urlStack.push({
        fileName: request.file,
        url: request.url,
        base64: request.base64
      });
    }
    console.log('[shopReport] pushUrl:', request);
  };
  contentAddListenerNoData = (request, sender, response) => {
    console.log('[shopReport] 报表无数据');
    this.store.addReportForm({ fileName: request.file, suffix: '' }, true);
  };
  contentAddListenerCloseOthersTab = (request, sender, response) => {
    console.log('[shopReport] 关闭其余结算一览页面');
    chrome.tabs.query({}, tabs => {
      let selectTabs = tabs.filter(item => {
        let isSView =
          new URL(item.url).pathname === '/payments/reports/statement/details';
        return item.id != this.store.scriptData.tabId && isSView;
      });

      selectTabs.forEach(item => {
        chrome.tabs.remove(item.id);
      });
    });
  };
  contentAddListenerToCreatPdf = (request, sender, response) => {
    chrome.tabs.query({}, tabs => {
      let openerTabs = tabs.filter(
        item => item.id != this.store.scriptData.tabId
      );
      const msg = {
        cmd: 'toCreatPdf',
        data: this.store.scriptData.currentReports[0]
      };
      chrome.tabs.update(this.store.scriptData.tabId, { active: true });

      openerTabs.forEach((item, index) => {
        this.toContent.waitSubpageLoading(() => {
          try {
            chrome.tabs.sendMessage(item.id, msg, response => {});
          } catch (error) {
            console.error({ error });
          }
          if (index == openerTabs.length - 1) {
            console.log('[shopReport] 结算一览下载结束');
            this.toContent.sendMessageToContent(
              { cmd: 'creatPdfEnd' },
              () => {}
            );
          }
        }, item.id);
      });
    });
  };
  contentAddListenerContinue = (request, sender, response) => {
    this.store.scriptData.contentReady = false;
    this.toContent.waitContentLoading(this.toContent.startWork);
  };
  contentAddListenerScriptEnd = (request, sender, response) => {
    console.log('[shopReport] 脚本执行结束');
    this.store.reportData.reportMap.find(
      item =>
        item.key ==
        this.store.scriptData.currentReports[this.store.scriptData.current].key
    ).downLoading = false;
    this.toPopup.sendData();

    if (
      this.store.scriptData.currentReports.length - 1 >
      this.store.scriptData.current
    ) {
      this.store.scriptData.current++;
      this.toContent.waitContentLoading(this.toContent.pageJump);
    } else {
      console.log('[shopReport] 任务执行结束,等待下载上传');
      const waitEnd = () => {
        chrome.downloads.search({ state: 'in_progress' }, items => {
          if (items.length == 0) {
            console.log('[shopReport] 下载完成上传');
            this.store.dataInit();
            this.store.reportData.runStatus.alreadyComplete = true;
            this.toPopup.sendData();
            // 清空已选下载列表
            this.store.scriptData.currentReports = [];
            this.store.scriptData.current = 0;
            this.store.scriptData.running = false;
            this.toContent.waitContentLoading(this.toContent.stopWork);
          } else {
            setTimeout(waitEnd, 200);
          }
        });
      };
      waitEnd();
    }
  };

  popupAddListener = msg => {
    switch (msg.cmd) {
      case 'init':
        this.popupAddListenerInit(msg);
        break;
      case 'download': // 开始下载
        this.popupAddListenerDownload(msg);
        break;
    }
  };

  popupAddListenerInit = msg => {
    this.crxTabControl.getHomeTab(this.toPopup.connectPost);
    this.toPopup.sendData();
  };

  popupAddListenerDownload = msg => {
    this.store.scriptData.urlStack = [];
    this.store.reportData.filename = { prefix: '', folder: '', host: '' };
    this.store.reportData.runStatus = { alreadyComplete: false };
    this.store.setData(msg);
    // 时间戳+随机数生成文件夹
    this.store.reportData.filename.folder = `${new Date().getTime()}${Math.floor(
      Math.random() * 10
    )}`;
    console.log('start download:', msg);
    // 获取已选下载列表
    this.store.scriptData.currentReports = this.store.getCurrentReports();
    this.store.scriptData.running = true;

    // 执行脚本
    this.toContent.waitContentLoading(this.toContent.pageHome);
  };

  downloadAddListenerChange = item => {
    if (
      this.store.scriptData.urlStack.length > 0 &&
      item.state &&
      item.state.current == 'complete'
    ) {
      const currentFile = this.store.scriptData.urlStack.find(
        file => file.id == item.id
      );
      chrome.downloads.search({ id: item.id }, c => {
        currentFile.fileAddress = c[0].filename;
        console.log(currentFile.fileAddress, '++++');

        this.store.waitAdd(
          currentFile,
          this.store.reportPut.bind(
            this,
            currentFile,
            currentFile.fileAddress ? 0 : 1
          )
        );
      });
    }
  };

  downloadAddListenerFileRename = (item, suggest) => {
    if (this.store.scriptData.urlStack.length > 0) {
      console.log('rename', this.store.reportData.filename.folder, item);
      const fileNameSplit = item.filename.split('.');
      const suffix = fileNameSplit[fileNameSplit.length - 1];
      const currentFile = this.store.scriptData.urlStack.find(
        file =>
          `${file.url}?sbsilentdownload=true` == item.url ||
          file.url == item.url
      );
      console.log(toJS(this.store.scriptData), currentFile);
      if (currentFile) {
        currentFile.id = item.id;
        currentFile.suffix = suffix;
        currentFile.hashName = CreateHash(16);
      }

      this.store.addReportForm(currentFile);
      suggest({
        filename: `SRDownload/${currentFile.hashName}`
      });
    }
  };
}

export default BackScript;
