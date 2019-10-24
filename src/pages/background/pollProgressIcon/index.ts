import { maybeOpen, setBrowserActionIcon } from './drawFun';

const pollProgress = () => {
  pollProgress.tid = -1;
  chrome.downloads.search({}, items => {
    let popupLastOpened = parseInt(localStorage.popupLastOpened);
    let options = {
      anyMissingTotalBytes: false,
      anyInProgress: false,
      anyRecentlyCompleted: false,
      anyPaused: false,
      anyDangerous: false,
      totalBytesReceived: 0,
      totalTotalBytes: 0
    };
    items.forEach(item => {
      if (item.state == 'in_progress') {
        options.anyInProgress = true;
        if (item.totalBytes) {
          options.totalTotalBytes += item.totalBytes;
          options.totalBytesReceived += item.bytesReceived;
        } else {
          options.anyMissingTotalBytes = true;
        }
        let dangerous = item.danger != 'safe' && item.danger != 'accepted';
        options.anyDangerous = options.anyDangerous || dangerous;
        options.anyPaused = options.anyPaused || item.paused;
      } else if (item.state == 'complete' && item.endTime && !item.error) {
        options.anyRecentlyCompleted =
          options.anyRecentlyCompleted ||
          new Date(item.endTime).getTime() >= popupLastOpened;
        maybeOpen(item.id);
      }
    });

    let targetIcon = JSON.stringify(options);
    if (sessionStorage.currentIcon != targetIcon) {
      setBrowserActionIcon(options);
      sessionStorage.currentIcon = targetIcon;
    }

    if (options.anyInProgress && pollProgress.tid < 0) {
      pollProgress.start();
    }
  });
};
pollProgress.tid = -1 as any;
pollProgress.MS = 200;

pollProgress.start = () => {
  if (pollProgress.tid < 0) {
    pollProgress.tid = setTimeout(pollProgress, pollProgress.MS);
  }
};

pollProgress.tid = -1;
pollProgress.MS = 200;

let isNumber = n => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

if (!isNumber(localStorage.popupLastOpened)) {
  localStorage.popupLastOpened = '' + new Date().getTime();
}

chrome.downloads.onCreated.addListener(item => {
  pollProgress();
});

pollProgress();

chrome.runtime.onMessage.addListener(request => {
  if (request == 'poll') {
    pollProgress.start();
  }
});

export default pollProgress;
