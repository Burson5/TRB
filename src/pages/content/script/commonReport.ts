import SilentDownload from '~/until/SilentDownload';
import { parseURL } from '~/until/Url';
import Delay from '~/until/Delay';
import moment from 'moment';

const waitText = [
  'In Progress',
  '进行中',
  'In Arbeit',
  'En proceso',
  'En cours',
  'In corso',
  '処理中',
  '진행 중'
];
const overText = [
  'No Data Available',
  '无可用数据',
  'Keine Daten verfügbar',
  'No hay datos disponibles',
  "Aucune donnée n'est disponible",
  'Nessun dato disponibile.',
  'データはありません',
  '사용 가능한 데이터 없음'
];

// 报告一览页面 5-8
let waitCount = 0;

// 点击下载tabs 等待
const waitLoading = next => {
  const loading = document.getElementById('pleaseWaitLoading');
  if (loading.style.display != 'none') {
    console.log(`[shopReport] 等待${waitCount}`);
    waitCount++;
    Delay(waitLoading.bind(this, next), 500);
  } else {
    waitCount = 0;
    console.log('[shopReport] 等待结束');
    if (next) {
      Delay(next, 1000);
    }
  }
};

// 点击下载tabs
const downLoadTabsClick = next => {
  const downloadTab = document.getElementById('tab_download');
  console.log('[shopReport] 进入下载tabs');
  downloadTab.click();

  waitLoading(next);
};

// 请求csv下载
const csvDownlodaClick = next => {
  const btns = document
    .getElementById('requestCsvTsvDownload')
    .querySelectorAll('button');
  console.log('[shopReport] 请求 .csv 下载');
  btns[0].click();

  waitLoading(next);
};

// 请求txt下载
const txtDownloadClick = next => {
  const btns = document
    .getElementById('requestCsvTsvDownload')
    .querySelectorAll('button');
  console.log('[shopReport] 请求 .txt 下载');
  btns[1].click();

  waitLoading(next);
};

// 'In Progress' '进行中'

const waitDownload = next => {
  let downLoadBtn = document.getElementsByClassName('downloadTableRow');
  let text1 = downLoadBtn[0].lastElementChild.innerHTML;
  let text2 = downLoadBtn[1].lastElementChild.innerHTML;
  console.log(text1, text2);
  if (waitText.includes(text1.trim()) || waitText.includes(text2.trim())) {
    console.log('[shopReport] 等待请求结果');
    downLoadTabsClick(() => {
      console.log('等待循环');
      waitDownload(next);
    });
  } else {
    console.log('[shopReport] 无数据请求结束');
    next();
  }
};

const downLoad = data => {
  const type = parseURL(data.url).hash.split('=')[1];
  const mune = document.getElementById(type);

  const complete = resolve => {
    let downLoadBtn = document.getElementsByClassName('downloadTableRow');
    let btn1: any = downLoadBtn[0].querySelector('a');
    let fileName1 = `${data.name}${downLoadBtn[0].children[1].innerHTML.trim()}${downLoadBtn[0].children[3].innerHTML.trim()}`;
    let btn2: any = downLoadBtn[1].querySelector('a');
    let fileName2 = `${data.name}${downLoadBtn[1].children[1].innerHTML.trim()}${downLoadBtn[1].children[3].innerHTML.trim()}`;

    let text1 = downLoadBtn[0].lastElementChild.innerHTML;
    let text2 = downLoadBtn[1].lastElementChild.innerHTML;

    if (overText.includes(text1.trim())) {
      console.log('[shopReport] 无数据', fileName2);
      chrome.runtime.sendMessage({ cmd: 'noData', file: fileName1 });
    }
    if (overText.includes(text2.trim())) {
      console.log('[shopReport] 无数据', fileName2);
      chrome.runtime.sendMessage({ cmd: 'noData', file: fileName2 });
    }

    if (btn1) {
      chrome.runtime.sendMessage({
        cmd: 'pushUrl',
        url: `${btn1.href}`,
        file: data.name
      });
      SilentDownload(btn1.href);
    }
    if (btn2) {
      chrome.runtime.sendMessage({
        cmd: 'pushUrl',
        url: `${btn2.href}`,
        file: data.name
      });
      SilentDownload(btn2.href);
    }

    console.log('[shopReport] 完成下载');
    Delay(resolve, 2000);
  };

  return new Promise((resolve, reject) => {
    mune.click();
    waitLoading(() => {
      if (data.key == '5' || data.key == '6') {
        // 语言 日语6
        const lanSelect = document.getElementById(
          'sc-lang-switcher-header-select'
        );
        const lanIndex = lanSelect.selectedIndex;


        downLoadTabsClick(() => {
          const selects =
            data.key == '5'
              ? (document.getElementById('downloadDateDropdown') as HTMLSelectElement)
              : (document.getElementById('downloadMonthDropDown') as HTMLSelectElement);
          // 选中自定义日期项
          selects.selectedIndex = 5;
          downLoadTabsClick(() => {
            const date = data.time == '' ? data.allTime : data.time;
            if (data.key == '5') {
              const startTime = document.getElementById(
                'fromDateDownload'
              ) as HTMLInputElement;
              const endTime = document.getElementById(
                'toDateDownload'
              ) as HTMLInputElement;
              console.log(date);
              // 填入日期
              console.log('data', lanIndex);
              if (lanIndex == 6) {
                const weekday = ['Monec','Tueec','Wedec', 'Thuec', 'Friec', 'Satec', 'Sunec'];
                const value1 = `${weekday[moment().weekday() - 1]}${moment(date[0], 'YYYY-MM-DD').format(' DD, YYYY')}`;
                const value2 = `${weekday[moment().weekday() - 1]}${moment(date[1], 'YYYY-MM-DD').format(' DD, YYYY')}`;
                console.log(value1, value2);
                startTime.value = value1;
                endTime.value = value2;
              } else {
                startTime.value = moment(date[0], 'YYYY-MM-DD').format(
                  'MM/DD/YYYY'
                );
                endTime.value = moment(date[1], 'YYYY-MM-DD').format('MM/DD/YYYY');
              }
            } else {
              const startMM = document.getElementById(
                'fromMonthDownload'
              ) as HTMLSelectElement;
              const endMM = document.getElementById(
                'toMonthDownload'
              ) as HTMLSelectElement;
              const startYYYY = document.getElementById(
                'fromYearDownload'
              ) as HTMLSelectElement;
              const endYYYY = document.getElementById(
                'toYearDownload'
              ) as HTMLSelectElement;

              // 填入月份
              startMM.selectedIndex =
                parseInt(moment(date[0], 'YYYY-MM-DD').format('MM')) - 1;
              endMM.selectedIndex =
                parseInt(moment(date[1], 'YYYY-MM-DD').format('MM')) - 1;
              startYYYY.selectedIndex =
                parseInt(moment().format('YYYY')) -
                parseInt(moment(date[0], 'YYYY-MM-DD').format('YYYY'));
              endYYYY.selectedIndex =
                parseInt(moment().format('YYYY')) -
                parseInt(moment(date[1], 'YYYY-MM-DD').format('YYYY'));
            }
            csvDownlodaClick(() => {
              txtDownloadClick(() => {
                waitDownload(() => {
                  complete(resolve);
                });
              });
            });
          });
        });
      } else {
        downLoadTabsClick(() => {
          csvDownlodaClick(() => {
            txtDownloadClick(() => {
              waitDownload(() => {
                complete(resolve);
              });
            });
          });
        });
      }
    });
  });
};

export default downLoad;
