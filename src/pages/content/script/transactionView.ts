import Delay from '~/until/Delay';
import SilentDownload from '~/until/SilentDownload';

const downLoad = () => {
  return new Promise((resolve, reject) => {
    const btn = document.getElementsByClassName('buttonImage')[0] as HTMLBaseElement;

    if (btn) {
      const url = btn.href;
      console.log(url);
      chrome.runtime.sendMessage({ cmd: 'pushUrl' , url: `${url}`, file: 'Transaction View' });
      SilentDownload(url);
      Delay(resolve, 2000);
    } else {
      // 无数据

      console.log('[shopReport] 无数据');
      chrome.runtime.sendMessage({ cmd: 'noData', file: 'Transaction View' });
      Delay(resolve, 2000);
    }
  });
};

export default downLoad;
