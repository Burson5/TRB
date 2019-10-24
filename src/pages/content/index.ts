import creatPdf from './script/creatPdf';
import transactionView from './script/transactionView';
import allStatements from './script/allStatements';
import dateRange from './script/dateRange';
import commonReport from './script/commonReport';
import Language from '~/pages/background/data/language';
import moment from 'moment';
import Delay from '~/until/Delay';

window.onload = () => {
  const element = document.getElementById('printableSections');
  let isLogin = document.getElementById('sc-quicklink-settings'); // 判断登录状态

  const sendEndMsg = () => {
    chrome.runtime.sendMessage({ cmd: 'scriptEnd' });
  };
  console.clear();
  console.log('[shopReport] 初始化');
  chrome.runtime.sendMessage({ cmd: 'contentReady', isLogin: !!isLogin });

  chrome.runtime.onMessage.addListener(
    (request: ContentReq, sender, sendResponse) => {
      switch (request.cmd) {
        case 'login':
          console.log('--------login----------');
          let loginBtns = [
            document.getElementById('sign-in-button'),
            document.getElementById('ap_switch_account_link'),
            document.getElementById('signInSubmit')
          ];
          Delay(() => {
            for (let btn of loginBtns) {
              if (btn) {
                btn.click();
              }
            }
          }, 500);
          break;

        case 'pageJump':
          let time0 =
            request.data.time == ''
              ? request.data.allTime[0]
              : request.data.time[0];
          let time1 =
            request.data.time == ''
              ? request.data.allTime[1]
              : request.data.time[1];
          if (request.data.key === '0' || request.data.key === '2') {
            const lanSelect = document.getElementById(
              'sc-lang-switcher-header-select'
            );
            const lanIndex = lanSelect.selectedIndex;
            time0 = moment(time0, 'YYYY-MM-DD').format(
              Language[lanIndex].dateFormat
            );
            time1 = moment(time1, 'YYYY-MM-DD').format(
              Language[lanIndex].dateFormat
            );
          }

          let url = request.url
            .replace('{{host}}', location.host)
            .replace('{{start}}', time0)
            .replace('{{end}}', time1);

          chrome.runtime.sendMessage({ cmd: 'saveHost', host: location.host });

          // 在执行任务前关闭多余窗口（仅结算一览任务）
          if (request.data.key === '0') {
            chrome.runtime.sendMessage({ cmd: 'closeOthersTab' });
          }
          sendResponse({ cmd: 'startWork' });
          console.log('------------------------');
          console.log('[shopReport] 页面跳转');
          console.log(request.data.name);
          console.log(url);
          console.log('------------------------');

          location.replace(url);
          // if (parseInt(request.data.key) >= 4) {
          //   Delay(() => {
          //     location.reload();
          //   }, 200);
          // }

          break;

        case 'toCreatPdf':
          creatPdf(element, request.data.name).finally(() => {
            sendResponse();
            window.close();
          });
          break;

        case 'creatPdfEnd':
          sendEndMsg();
          sendResponse();
          break;

        case 'download':
          console.log(`[shopReport] 执行脚本 ${request.data.name}`);
          console.log(request.data);

          switch (request.data.key) {
            case '0':
              allStatements('view').then((data: AllStateResolve) => {
                if (data.cmd == 'end') {
                  Delay(() => {
                    chrome.runtime.sendMessage({ cmd: 'toCreatPdf' });
                  }, 2000);
                } else if (data.cmd == 'continue') {
                  chrome.runtime.sendMessage({ cmd: 'continue' });
                }
              });
              break;

            case '1':
              transactionView().finally(() => {
                sendEndMsg();
              });
              break;

            case '2':
              allStatements('down').then((data: AllStateResolve) => {
                if (data.cmd == 'end') {
                  sendEndMsg();
                } else if (data.cmd == 'continue') {
                  chrome.runtime.sendMessage({ cmd: 'continue' });
                }
              });
              break;

            case '3':
              let reportType = request.data.reportType;
              let date =
                request.data.time == ''
                  ? request.data.allTime
                  : request.data.time;
              if (reportType[0].state == true) {
                dateRange(reportType, date, reportType[0].name).finally(() => {
                  if (reportType[1].state == true) {
                    chrome.runtime.sendMessage({ cmd: 'continue' });
                    window.location.reload();
                  } else {
                    sendEndMsg();
                  }
                });
              } else if (
                reportType[0].state == false &&
                reportType[1].state == true
              ) {
                dateRange(reportType, date, reportType[1].name).finally(() => {
                  sendEndMsg();
                });
              } else if (
                reportType[0].state == false &&
                reportType[1].state == false
              ) {
                sendEndMsg();
              }
              break;

            case '4':
              commonReport(request.data).finally(() => {
                sendEndMsg();
              });
              break;

            case '5':
              commonReport(request.data).finally(() => {
                sendEndMsg();
              });
              break;

            case '6':
              commonReport(request.data).finally(() => {
                sendEndMsg();
              });
              break;

            case '7':
              commonReport(request.data).finally(() => {
                sendEndMsg();
              });
              break;

            default:
              sendEndMsg();
              break;
          }

          sendResponse();

          break;
        case 'cancel':
          console.log('[shopReport] 中断执行脚本');
          break;
      }
    }
  );
};
