const fs = require('fs');
const path = require('path');
const glob = require('glob');
const dirs = require('./dirs');

let JSReg = /([\w-]+)(?=\/index.tsx)/;

const htmls = [];
const entries = glob
  .sync(path.resolve(dirs.src, './app/**/index.tsx'))
  .reduce((entArr, item) => {
    const name = item.match(JSReg)[1];

    // 配置html-webpack-plugin
    // 如果没有个性化页面模板，启用公共模板
    let template = path.resolve(dirs.src, `./app/${name}/index.ejs`);
    if (!fs.existsSync(template)) {
      template = path.resolve(dirs.src, `./app/common.ejs`);
    }

    htmls.push({
      name,
      template
    });

    entArr[name] = item;
    return entArr;
  }, {});

module.exports = { entries, htmls };
