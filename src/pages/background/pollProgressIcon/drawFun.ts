import { colors, imgSrc, TAU } from './config';
// 绘制进度条 弧线
const drawProgressArc = (ctx, startAngle, endAngle) => {
  let center = ctx.canvas.width / 2;
  ctx.lineWidth = Math.round(ctx.canvas.width * 0.1);
  ctx.beginPath(); // 开启新路径，与前面的路径区分开
  ctx.moveTo(center, center); // 移动函数
  ctx.arc(center, center, center * 1.5, startAngle, endAngle, false); // 画圆函数 radius = center * 0.9 (画圆)
  ctx.fill(); // 填充函数
  ctx.stroke(); // 描边函数
};

// 无进度
const drawUnknownProgressSpinner = ctx => {
  let center = ctx.canvas.width / 2;
  const segments = 16;
  let segArc = TAU / segments;
  for (let seg = 0; seg < segments; ++seg) {
    ctx.fillStyle = ctx.strokeStyle =
      seg % 2 == 0 ? colors.progressColor : colors.background;
    drawProgressArc(ctx, (seg - 4) * segArc, (seg - 3) * segArc);
  }
};

// 有进度
const drawProgressSpinner = (ctx, stage) => {
  ctx.fillStyle = ctx.strokeStyle = colors.progressColor;
  let clocktop = -TAU / 4;
  drawProgressArc(ctx, clocktop, clocktop + stage * TAU);
};

// 绘制下载箭头 （废弃）
const drawArrow = async ctx => {
  ctx.beginPath();
  ctx.lineWidth = Math.round(ctx.canvas.width * 0.1);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ctx.fillStyle = colors.arrow;
  let center = ctx.canvas.width / 2;
  let minw2 = center * 0.2;
  let maxw2 = center * 0.6;
  let height2 = maxw2;
  ctx.moveTo(center - minw2, center - height2);
  ctx.lineTo(center + minw2, center - height2);
  ctx.lineTo(center + minw2, center);
  ctx.lineTo(center + maxw2, center);
  ctx.lineTo(center, center + height2);
  ctx.lineTo(center - maxw2, center);
  ctx.lineTo(center - minw2, center);
  ctx.lineTo(center - minw2, center - height2);
  ctx.lineTo(center + minw2, center - height2);
  ctx.stroke();
  ctx.fill();

  let minw3 = center * 0.1;
  ctx.beginPath();
  ctx.moveTo(0, 2 * center - minw3);
  ctx.lineTo(2 * center, 2 * center - minw3);
  ctx.stroke();
};

// 绘制图标
const drawImage = async ctx => {
  ctx.beginPath();
  let width = ctx.canvas.width;
  ctx.drawImage(imgSrc, 0, 0, width, width);
};

// 危险徽标
const drawDangerBadge = ctx => {
  let s = ctx.canvas.width / 100;
  ctx.fillStyle = colors.danger;
  ctx.strokeStyle = colors.background;
  ctx.lineWidth = Math.round(s * 5);
  let edge = ctx.canvas.width - ctx.lineWidth;
  ctx.beginPath();
  ctx.moveTo(s * 75, s * 55);
  ctx.lineTo(edge, edge);
  ctx.lineTo(s * 55, edge);
  ctx.lineTo(s * 75, s * 55);
  ctx.lineTo(edge, edge);
  ctx.fill();
  ctx.stroke();
};

// 右下脚暂停徽标
const drawPausedBadge = ctx => {
  let s = ctx.canvas.width / 100;
  ctx.beginPath();
  ctx.strokeStyle = colors.background;
  ctx.lineWidth = Math.round(s * 5);
  ctx.rect(s * 55, s * 55, s * 15, s * 35);
  ctx.fillStyle = colors.paused;
  ctx.fill();
  ctx.stroke();
  ctx.rect(s * 75, s * 55, s * 15, s * 35);
  ctx.fill();
  ctx.stroke();
};

// 右下脚完成徽标
const drawCompleteBadge = ctx => {
  let s = ctx.canvas.width / 100;
  ctx.beginPath();
  ctx.arc(s * 75, s * 75, s * 15, 0, TAU, false);
  ctx.fillStyle = colors.complete;
  ctx.fill();
  ctx.strokeStyle = colors.background;
  ctx.lineWidth = Math.round(s * 5);
  ctx.stroke();
};

const drawIcon = (side, options) => {
  let canvas = document.createElement('canvas');
  canvas.width = canvas.height = side;
  document.body.appendChild(canvas);
  let ctx = canvas.getContext('2d');

  // 图标
  drawImage(ctx);

  // 进度条
  if (options.anyInProgress) {
    if (options.anyMissingTotalBytes) {
      drawUnknownProgressSpinner(ctx);
    } else {
      drawProgressSpinner(
        ctx,
        options.totalBytesReceived / options.totalTotalBytes
      );
    }
  }

  // 状态徽标
  if (options.anyDangerous) {
    drawDangerBadge(ctx);
  } else if (options.anyPaused) {
    drawPausedBadge(ctx);
  } else if (options.anyRecentlyCompleted) {
    drawCompleteBadge(ctx);
  }
  return canvas;
};

// 打开popup 清楚icon 徽标
const maybeOpen = id => {
  let openWhenComplete = [];
  try {
    openWhenComplete = JSON.parse(localStorage.openWhenComplete);
  } catch (e) {
    localStorage.openWhenComplete = JSON.stringify(openWhenComplete);
  }
  let openNowIndex = openWhenComplete.indexOf(id);
  if (openNowIndex >= 0) {
    chrome.downloads.open(id);
    openWhenComplete.splice(openNowIndex, 1);
    localStorage.openWhenComplete = JSON.stringify(openWhenComplete);
  }
};

// 放置图标
const setBrowserActionIcon = options => {
  let canvas1 = drawIcon(19, options);
  let canvas2 = drawIcon(38, options);
  let imageData = {};
  imageData['' + canvas1.width] = canvas1
    .getContext('2d')
    .getImageData(0, 0, canvas1.width, canvas1.height);
  imageData['' + canvas2.width] = canvas2
    .getContext('2d')
    .getImageData(0, 0, canvas2.width, canvas2.height);
  chrome.browserAction.setIcon({ imageData: imageData });
  canvas1.parentNode.removeChild(canvas1);
  canvas2.parentNode.removeChild(canvas2);
};

export {
  drawProgressArc,
  drawUnknownProgressSpinner,
  drawProgressSpinner,
  drawArrow,
  drawImage,
  drawDangerBadge,
  drawPausedBadge,
  drawCompleteBadge,
  drawIcon,
  maybeOpen,
  setBrowserActionIcon
};
