import { observable, action, computed } from 'mobx';
import { Modules } from '~/websocket/Configs';
import { message } from 'antd';
import { wsHttp } from '~/websocket/modules/wsHttp';

/**
 * 机器码数据对象
 */
interface MachineData {
  machine_name: String;
  machine_string: String;
  // 固定秘钥
  pan_gu_epoch: string;
};

/**
 * 用户基础信息
 */
interface UserInfo {
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

export class UserStore {
  @observable user: UserInfo;
  @observable machineData: MachineData;

  @observable rules = {
    keyStart: 0,
    ivStart: 4,
    deStart: 1,
    deIvStart: 3
  };
  // 加密解密秘钥及偏移量
  @observable codeKeys: {
    key: String;
    iv: String;
    deKey: String;
    deIv: String;
  };

  // 当前界面语言
  @observable language = 'zh';

  // 用户扩展数据
  @observable extraInfo = {};

  @computed get isLogin() {
    return !!this.user;
  }

  /**
   * 获取用户信息
   */
  @action
  getUser = async () => {
    let userRes = await wsHttp.request(
      Modules.AuthoModule.key,
      Modules.AuthoModule.action.GetLoginInfo
    );
    let loginUser = userRes.returnObj;
    if (loginUser) {
      this.setUserInfo(loginUser);
    } else {
      message.error('您还未登录');
      throw Error('No Login');
    }
  };
  /**
   * 获取机器码信息
   */
  @action
  getMachineData = async () => {
    try {
      // 获取机器码
      let machineRes = await wsHttp.request(
        Modules.AuthoModule.key,
        Modules.AuthoModule.action.GetMachineInfo
      );
      this.setMachineData(machineRes.returnObj);
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  };

  // 设置machinData
  @action
  setMachineData = data => {
    this.machineData = data;
    this.user && (this.user.machine_string = data.machine_string);
  };

  // 设置用户基本信息
  @action
  setUserInfo = data => {
    if (data) {
      this.user = data;
      this.user.machine_string = this.machineData.machine_string;
      this.user.comId = this.user.company;
      this.codeKeys = {
        key: this.user.oauth_string.substr(this.rules.keyStart, 16),
        iv: this.user.oauth_string.substr(this.rules.ivStart, 16),
        deKey: this.user.oauth_string.substr(this.rules.deStart, 16),
        deIv: this.user.oauth_string.substr(this.rules.deIvStart, 16)
      };
    } else {
      this.user = null;
    }
  };

  // 设置用户语言
  @action
  setUserLang = (lang: string) => {
    this.language = lang;
  };

  // http请求的时候需要用到字段- 语言
  @computed
  get apiUseLanguage() {
    let langMap = {
      zh: 'zh-CN',
      en: 'en-US'
    };
    return langMap[this.language] || langMap.zh;
  }
}

export default UserStore;
