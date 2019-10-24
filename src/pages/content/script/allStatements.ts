import Delay from '~/until/Delay';
import SilentDownload from '~/until/SilentDownload';

const downLoad = type => {
  return new Promise((resolve, reject) => {
    // 请求报告
    const regenerateButton = [
      ...Array.from(document.getElementsByClassName('regenerateButton'))
    ] as HTMLBaseElement[];
    if (regenerateButton.length > 0) {
      console.log('[shopReport] 点击请求报告');
      regenerateButton.forEach(element => {
        element.click();
      });

      location.reload();
      resolve({ cmd: 'continue' });
      return;
    }

    // 等待报告刷新页面
    const labels = document.getElementsByClassName('progressText');
    if (labels.length > 0) {
      console.log('[shopReport] 等待报告生成');

      location.reload();
      resolve({ cmd: 'continue' });
      return;
    }

    // 下载报告
    // 页码显示
    const pages = document.getElementsByClassName('smaller')[2];
    // 当前页码
    const currentPage =
      parseInt(
        document.getElementsByClassName('currentpagination')[0].innerHTML
      ) || 1;
    let buttons = [];
    if (type == 'view') {
      buttons = [
        ...Array.from(document.getElementsByName('查看一览')),
        ...Array.from(document.getElementsByName('View Summary')),
        ...Array.from(document.getElementsByName('Übersicht anzeigen')),
        ...Array.from(document.getElementsByName('Ver resumen')),
        ...Array.from(document.getElementsByName('Afficher le récapitulatif')),
        ...Array.from(document.getElementsByName('Visualizza riepilogo')),
        ...Array.from(document.getElementsByName('概要を表示')),
        ...Array.from(document.getElementsByName('요약 보기'))
      ] as HTMLBaseElement[];
    } else {
      buttons = [
        ...Array.from(document.getElementsByName('下载模板文件')),
        ...Array.from(document.getElementsByName('Download Flat File')),
        ...Array.from(document.getElementsByName('決済レポートをダウンロード')),
        ...Array.from(document.getElementsByName('Abrechnungsbericht herunterladen')),
        ...Array.from(document.getElementsByName('Descargar informe')),
        ...Array.from(document.getElementsByName('Télécharger le rapport de paiement')),
        ...Array.from(document.getElementsByName('Scarica report')),
        ...Array.from(document.getElementsByName('플랫 파일 다운로드'))
      ] as HTMLBaseElement[];
      const table = document.getElementById('content-main-entities')
      const unchecked = table.children[1].firstElementChild.children[1].lastElementChild.lastElementChild;
      if (unchecked.children.length === 0) {
        let fileTime = table.children[1].firstElementChild.children[1].firstElementChild.firstElementChild.innerHTML;
        chrome.runtime.sendMessage({ cmd: 'noData', file: `All Statements${fileTime.replace(/\s*/g,"")}` });
      }
    }
    if (buttons.length > 0) {
      console.log(
        `[shopReport] 开始下载模板文件，第${currentPage}页，共${buttons.length}个`
      );

      buttons.forEach(item => {
        // 无法只是用直接click()下载
        // item.click();
        let fileTime = item.parentElement.parentElement.parentElement.firstElementChild.children[0].innerText;
        let url = item.href;

        if (type == 'down') {
          chrome.runtime.sendMessage({ cmd: 'pushUrl' , url: `${url}`, file: `All Statements${fileTime.replace(/\s*/g,"")}` });
          SilentDownload(url);
        } else {
          window.open(url);
        }
      });

      // 跳转
      // 判断是否最后一页：最后一项的text是否为NaN
      const text = pages.lastElementChild.innerHTML;
      // awazon 使用jQuery
      const pageNum = pages.children.length;
      if (
        pageNum == 1 ||
        (pageNum > 1 && parseFloat(text).toString() != 'NaN')
      ) {
        console.log('[shopReport] 完成下载');
        resolve({ cmd: 'end' });
      } else {
        Delay(() => {
          const nextPage = currentPage + 1;
          const items = Array.from(pages.children) as HTMLBaseElement[];
          for (let i = 0; i < items.length; i++) {
            if (parseInt(items[i].innerHTML) == nextPage) {
              items[i].click();
              break;
            }
          }
          console.log(`[shopReport] 跳转到第${nextPage}页`);
          resolve({ cmd: 'continue' });
        }, 2000);
      }
    } else if (buttons.length == 0) {
      console.log(
        `[shopReport] 第${currentPage}页中未发现“下载模板文件”按钮，停止下载`
      );
      resolve({ cmd: 'end' });
    }
  });
};

export default downLoad;
