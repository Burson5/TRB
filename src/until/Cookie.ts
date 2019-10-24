const Cookie = {
  setCookie: (name, value) => {
    let Days = 30;
    let exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie =
      name + '=' + escape(value) + ';expires=' + exp.toUTCString();
  },
  getCookie: (name?: string) => {
    // 是本地服务器场景
    if (window.location.host.indexOf('localhost') >= 0) {
      const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
      const arr = document.cookie.match(reg);
      if (arr != null) {
        return Promise.resolve(unescape(arr[2]));
      } else {
        return Promise.resolve('');
      }
    } else {
      return Cookie.getAllCookie();
    }
  },

  getAllCookie: () => {
    return new Promise((resolve, reject) => {
      chrome.cookies.getAll({ domain: location.host }, res => {
        if (res) {
          resolve(res);
        }
      });
    });
  },
};

export default Cookie;
