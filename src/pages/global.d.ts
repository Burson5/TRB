type reportType = {
  name: string;
  state: boolean;
};

// 报表数据
type reportMapData = {
  key: string;
  name: string;
  selectName: string;
  checked: boolean;
  downLoading: boolean;
  enable: boolean;
  selectTime: boolean;
  time: string;
  allTime: string;
  url: string;
  reportType?: reportType;
};

type filename = {
  prefix: string;
  folder: string;
  host: '';
};

type runStatus = {
  alreadyComplete?: boolean;
}

// 报表运行相关数据
interface ReportData {
  filename: filename;
  reportMap: reportMapData[];
  isDownLoading: boolean;
  runStatus: runStatus;
  language: string;
}

// 所下载文件数据
type urlStack = {
  id?: number;
  fileName: string;
  suffix?: string;
  url: string;
  fileAddress?: string;
  hashName?: string;
  base64: string;
}

// 任务运行时数据
interface ScriptData {
  // 保存通信页面tabId
  tabId: null | number;
  // 通信页面状态
  contentReady: boolean;
  // 登录状态
  isLogin: boolean;
  // 脚本运行中
  running: boolean;
  // 等待延时
  delay: number;
  // 超时计数
  overTimeCount: number;
  // 当前需要执行的脚本
  currentReports: reportMapData[];
  // 正在执行脚本的报表
  current: number;
  // 执行add请求 上传请求堆栈
  submitStack: filename[];
  // 存储定位下载项目
  urlStack: urlStack[];
}

// 通信返回数据
interface ContentReq {
  cmd: string;
  data: reportMapData;
  url?: string;
}

// 通信数据
interface AllStateResolve {
  cmd: string;
}

// http 请求数据
interface ReportFormParams {
  action: string;
  data: {
    store_id: string;
    store_name: string;
    company_id: string;
    site_url: string;
    code: string;
    name: string;
    report_start_time: string;
    report_end_time: string;
    status?: string | number;
  }[];
}
