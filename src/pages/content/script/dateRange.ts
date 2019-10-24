import Delay from '~/until/Delay';
import moment from 'moment';
import SilentDownload from '~/until/SilentDownload';

const openModalBtn = document.getElementById(
  'drrGenerateReportButton-announce'
);
const modalOkBtn = document.getElementById('drrGenerateReportsGenerateButton') as HTMLButtonElement;

const drrReportType = document.getElementsByName('drrReportType') as NodeList | HTMLOptGroupElement;

const dateTypes = document.getElementsByName('drrReportRangeType') as NodeList | HTMLOptGroupElement;

const startTime = document.getElementById('drrFromDate') as HTMLInputElement;

const endTime = document.getElementById('drrToDate') as HTMLInputElement;

const downLoad = (reportType, date, typeName) => {
  console.log('-------------------' ,reportType, '------------');
  return new Promise((resolve, reject) => {
    console.log('[shopReport] 点击生成报告');
    openModalBtn.click();
    Delay(() => {

      // 悬着报表类型
      if (reportType[0].state == true) {
        drrReportType[0].checked = true;
      } else {
        drrReportType[1].checked = true;
      }

      // 选择自定义日期
      dateTypes[1].checked = true;

      // 填入时间
      startTime.value = moment(date[0], 'YYYY-MM-DD').format('MM/DD/YYYY');
      endTime.value = moment(date[1], 'YYYY-MM-DD').format('MM/DD/YYYY');

      console.log('[shopReport] modal点击确定');
      modalOkBtn.click();

      const waitRefresh = () => {
        const refresh = document.getElementsByClassName('drrRefreshTable') as HTMLCollectionOf<HTMLButtonElement>;
        console.log('[shopReport] 等待刷新新报告');

        if (refresh.length > 0) {
          Delay(() => {
            if (refresh[0]) refresh[0].click();
            waitRefresh();
          }, 1000);
        } else {
          let downloadBtn;
          try {
            downloadBtn = document.getElementById('0').querySelector('#downloadButton');
          } catch (error) {
            console.error(error);
          }
          if (downloadBtn) {
            let url = downloadBtn.firstElementChild.firstElementChild;
            console.log('[shopReport] 点击下载报告');
            // downloadBtn.click();


            chrome.runtime.sendMessage({ cmd: 'pushUrl' , url: `${url}`, file: `Date Range Reports ${typeName}` });
            SilentDownload(`${url}`);

          } else {
            chrome.runtime.sendMessage({ cmd: 'noData', file: `Date Range Reports ${typeName}` });
            console.log('[shopReport] 未生成报告');
          }

          Delay(resolve, 2000);
        }
      };
      Delay(() => {
        waitRefresh();
      }, 2000);
    }, 2000);
  });
};

export default downLoad;
