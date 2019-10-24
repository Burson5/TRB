declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}
declare module '*.less' {
  const content: { [className: string]: string };
  export default content;
}
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
declare module '*.conf' {
  const content: { [className: string]: string };
  export default content;
}
declare module '*.png' {
  const content: any;
  export default content;
}
declare module '*.svg' {
  const content: any;
  export default content;
}

type SuperEncoder = {
  isLoaded: true;
};

// axios请求
interface HttpRequestData {
  ret: number;
  msg: string;
  data?;
}

// window
interface Window {
  require: Function;
  superEncoder: SuperEncoder;
  superLanguage: String;
  zg: string;
  Crypto: any;
  html2canvas?: any;
}

/**
 * 用户基础信息
 */
type UserInfo = {
  ret: number;
  comId: number;
  id: number;
  company: number;
  oauth_string: String;
  machine_string: String;
  name: string;
  username: string;
  is_boss: number;
};

/**
 * 机器码数据对象
 */
type MachineData = {
  machine_name: String;
  machine_string: String;
  // 固定秘钥
  pan_gu_epoch: string;
};

type ResultData = {
  requestId: String;
  ret: number;
  returnObj: any;
};
type RequestData = {
  module: String;
  action: String;
  args: any;
};
type MapData = {
  url: String;
  data: ResultData;
};
interface MessageAble {
  onMessage: Function;
}

