const SilentDownload = url => {
  window.open(`${url}?sbsilentdownload=true`);
};
export default SilentDownload;
