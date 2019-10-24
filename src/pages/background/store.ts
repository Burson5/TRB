import reportMapInit from './data/reportMap';
import { Http } from '~/until';
import { Modules } from '~/websocket/Configs';
import { wsHttp } from '~/websocket/modules/wsHttp';
import RootStore from '~/stores';

class Store {
  static instance: Store;

  reportData: ReportData = {
    // 文件名前缀
    filename: { prefix: '', folder: '', host: '' },
    // 报表信息
    reportMap: JSON.parse(JSON.stringify(reportMapInit)),
    // 下载状态
    isDownLoading: false,
    // 运行信息
    runStatus: {
      alreadyComplete: false
    },
    // 语言
    language: 'zh_CN'
  };

  scriptData: ScriptData = {
    // 保存通信页面tabId
    tabId: null,
    // 通信页面状态
    contentReady: false,
    // 登录状态
    isLogin: false,
    // 脚本运行中
    running: false,
    // 等待延时
    delay: 500,
    // 超时计数
    overTimeCount: 0,
    // 当前需要执行的脚本
    currentReports: [],
    // 正在执行脚本的报表
    current: 0,

    // 执行add请求 上传请求堆栈
    submitStack: [],
    // 存储定位下载项目
    urlStack: []
  };

  constructor() {
    if (!Store.instance) {
      let self = this;
      Store.instance = self;
    }
    return Store.instance;
  }

  dataInit = () => {
    // reportData.filename = { prefix: '', folder: '', host: '' };
    // reportData.reportMap = JSON.parse(JSON.stringify(reportMapInit));
    this.reportData.reportMap[3].reportType[0].state = true;
    this.reportData.reportMap[3].reportType[1].state = true;
    this.reportData.isDownLoading = false;
    this.reportData.language = 'zh_CN';
    // scriptData.urlStack = [];
  };

  setData = data => {
    [
      this.reportData.filename,
      this.reportData.reportMap,
      this.reportData.isDownLoading,
      this.reportData.language
    ] = [data.filename, data.reportMap, data.isDownLoading, data.language];
  };

  getCurrentReports: () => reportMapData[] = () => {
    return this.reportData.reportMap.filter(item => item.checked == true);
  };

  /***************************************
 ************* 通信事件 *****************
  客户端Ws、Http请求
 ***************************************/

  addReportForm = async (currentFile, noData?: boolean) => {
    const cookie = RootStore.instance.wsStore.initData;
    const name = encodeURI(`${currentFile.fileName}${currentFile.suffix ? '.' : ''}${currentFile.suffix}`);

    const params: ReportFormParams = {
      action: 'add',
      data: [
        {
          store_id: cookie.bid,
          store_name: cookie.bName,
          company_id: cookie.cid,
          site_url: this.reportData.filename.host,
          // "site_url": "www.amazon.com",
          code: this.reportData.filename.folder,
          name: name,
          report_start_time: this.reportData.reportMap[0].allTime[0],
          report_end_time: this.reportData.reportMap[0].allTime[1]
        }
      ]
    };
    if (noData) {
      params.data[0].status = 4;
      this.clearUrlStack(currentFile.url);
    }
    let res: any = await Http.post('/plugin/report_form', params);
    console.log('http', { params, res });
    if (res && res.ret == 0) {
      currentFile.add = true;
      this.scriptData.submitStack.push(currentFile.fileName);
    }
  };

  waitAdd = (current, fun) => {
    if (current.add) {
      fun();
    } else {
      setTimeout(this.waitAdd.bind(this, current, fun), 200);
    }
  };

  reportPut = async (file, type) => {
    let params = [
      this.reportData.filename.folder,
      encodeURI(`${file.fileName}.${file.suffix}`),
      file.fileAddress || file.base64,
      type
    ];

    const res = await wsHttp.request(
      Modules.ShopReportModule.key,
      Modules.ShopReportModule.action.PluginPeportPut,
      params
    );
    console.log('ws', { params, res });
    if (res && res.ret == 0) {
      if (res.returnObj) {
        // 提交成功
        this.clearUrlStack(file.url);
      } else {
      }
    }
  };

  pdfAddPut = async current => {
    await this.addReportForm(current);
    this.reportPut(current, 1);
  };

  clearUrlStack = thatUrl => {
    this.scriptData.urlStack = this.scriptData.urlStack.filter(
      item => item.url !== thatUrl
    );
  };
}

export default Store;
