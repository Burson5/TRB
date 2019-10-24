import amazonHost from './data/amazonHost';
import { parseURL } from '~/until/Url';

class CrxTabControl {
  scriptData: ScriptData;
  constructor(config) {
    this.scriptData = config.store.scriptData;
    // 关闭页面tabId -> null
    chrome.tabs.onRemoved.addListener(id => {
      if (id == this.scriptData.tabId) {
        this.scriptData.tabId == null;
      }
    });
  }

  // 获取主页面tabid
  getHomeTab = connectPost => {
    if (this.scriptData.tabId == null) {
      chrome.tabs.query({ active: true }, tabs => {
        console.log('[shopReport] 获取主页面id:', tabs[0].id);
        // 判断是否为亚马逊后台页面
        if (amazonHost.find(item => item.host === parseURL(tabs[0].url).host)) {
          this.scriptData.tabId = tabs.length ? tabs[0].id : null;
        } else {
          const params = {
            cmd: 'sendMsg',
            msg: '请进入亚马逊后台页面'
          };
          connectPost(params);
        }
      });
    }
  };

  // 返回主页面
  jumpToHomeTab = () => {
    if (this.scriptData.tabId) {
      chrome.tabs.query({ active: true }, tabs => {
        if (tabs[0].id != this.scriptData.tabId) {
          chrome.tabs.update(this.scriptData.tabId, { active: true });
        }
      });
    }
  };
}

export default CrxTabControl;
