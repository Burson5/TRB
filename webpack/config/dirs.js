const path = require('path');

const rootDir = path.resolve(__dirname, '../../');

module.exports = {
  root: rootDir,
  lib: path.resolve(rootDir, './lib'),
  src: path.resolve(rootDir, './src'),
  pages: path.resolve(rootDir, './src/pages'),
  dist: path.resolve(rootDir, './dist'),
  modules: path.resolve(rootDir, './node_modules')
};
