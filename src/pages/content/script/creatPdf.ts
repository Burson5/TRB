import jsPDF from 'jspdf';
import html2canvas from 'jspdf/node_modules/html2canvas';
window.html2canvas = html2canvas; // 这里记得将html2canvas设为全局，不然后面找不到

const SIZE = [595.28, 841.89]; // a4宽高
const WGUTTER = 20; // 横向页边距
let position = 20; // pdf页面竖向偏移

const creatPdf = (node, name: string) => {
  let nameDateStr = '';
  let outName;
  try {
    let gFBox = document.getElementsByClassName('pGroupsSelection')[0];
    let groups = Array.from(
      document.getElementById('groups').children
    ) as any[];
    let selected = [...groups].find(item => item.selected);
    gFBox.className = '';
    gFBox.innerHTML = selected.innerText;
    nameDateStr = gFBox.innerHTML.replace(/\s*/g, '');

    let dateMap = [
      nameDateStr.split('GMT-7'),
      nameDateStr.split('UTC−7'),
      nameDateStr.split('PDT')
    ];

    outName = dateMap.find(i => i.length > 1);
  } catch (error) {
    console.error(error);
  }
  try {
    const btn1 = document.getElementById('disburse_button_top_id');
    const btn2 = document.getElementById('disburse_button_bottom_id');
    btn1.style.display = 'none';
    btn2.style.display = 'none';
  } catch (error) {
    console.error(error);
  }
  node.parentNode.style.width = '810px';

  return html2canvas(node).then(function(canvas) {
    let contentWidth = canvas.width;
    let contentHeight = canvas.height;
    // 一页pdf显示html页面生成的canvas高度;
    let pageHeight = (contentWidth / SIZE[0]) * SIZE[1];
    // 未生成pdf的html页面高度
    let leftHeight = contentHeight;
    // html页面生成的canvas在pdf中图片的宽高
    let imgWidth = SIZE[0] - WGUTTER * 2;
    let imgHeight = (imgWidth / contentWidth) * contentHeight;
    let pageData = canvas.toDataURL('image/jpeg', 1.0);
    let pdf = new jsPDF('', 'pt', 'a4', true);
    if (leftHeight < pageHeight) {
      pdf.addImage(
        pageData,
        'JPEG',
        WGUTTER,
        position,
        imgWidth,
        imgHeight,
        'FAST'
      );
    } else {
      while (leftHeight > 0) {
        pdf.addImage(pageData, 'JPEG', WGUTTER, position, imgWidth, imgHeight);
        leftHeight -= pageHeight;
        position -= SIZE[1];
        // 避免添加空白页
        if (leftHeight > 0) {
          pdf.addPage();
        }
      }
    }

    let out = pdf
      .output('datauristring')
      .replace('data:application/pdf;filename=generated.pdf;base64,', '');

    console.log(outName)
    chrome.runtime.sendMessage({
      cmd: 'pushUrl',
      name: `${name}${outName[0].split(outName[0].substr(-5))[0].replace(/월/g, ',')}${outName[1].split(outName[1].substr(-5))[0].replace(/월/g, ',')}`,
      base64: out
    });
    // pdf.save(`${nameDateStr}.pdf`);
    node.parentNode.style.width = '100%';
    window.html2canvas = null;
  });
};

export default creatPdf;
