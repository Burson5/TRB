import Http from './Http';

class WebConnect {
  // 全局wsStore；
  wsStore;

  /**
   * 是否可以使用chrome调试
   * 现阶段只有local和mock环境可以使用chrome调试
   */
  isDevelop = () => {
    return (
      ['local', 'mock'].indexOf(process.env.API_ENV) >= 0 ||
      process.env.USE_LOCAL
    );
  };
  // 设置请求url前缀
  setBaseUrl = prefix => {
    Http.defaults.baseURL = prefix;
  };
}
const webConnect = new WebConnect();

export default webConnect;
