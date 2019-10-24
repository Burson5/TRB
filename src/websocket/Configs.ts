export const Modules = {
  AuthoModule: {
    key: 'AuthoModule',
    action: {
      GetMachineInfo: 'GetMachineInfo',
      GetLoginInfo: 'GetLoginInfo',
      OnLogin: 'OnLogin',
      OnLogout: 'OnLogout',
      Logout: 'Logout',
    },
  },
  WsAuthoModule: {
    key: 'WsAuthoModule',
    action: {
      ClientConnected: 'ClientConnected',
      HeartBeat: 'HeartBeat',
    },
  },
  WebBrowserManagerModule: {
    key: 'WebBrowserManagerModule',
    action: {
      OpenBrowserManagement: 'OpenBrowserManagement',
      OnRequestAdminRedirect: 'OnRequestAdminRedirect',
      // 替换浏览器下某URL所在tab店铺
      ReplaceBrowserTag: 'ReplaceBrowserTag',
    },
  },
  DataObserverModule: {
    key: 'DataObserverModule',
    action: {
      NotifyStoreInfoChange: 'NotifyStoreInfoChange',
      OnHasNewMessage: 'OnHasNewMessage',
      NotifyMsgReadStateChange: 'NotifyMsgReadStateChange',
      OnMsgReadStateChange: 'OnMsgReadStateChange',
    },
  },
  SystemInfoModule: {
    key: 'SystemInfoModule',
    action: {
      GetLanguageSetting: 'GetLanguageSetting',
      OnLanguageChange: 'OnLanguageChange',
      GetVersion: 'GetVersion',
    },
  },
  ShopReportModule: {
    key: 'ShopReportModule',
    action: {
      PluginPeportPut: 'PluginPeportPut',
    },
  },
};
