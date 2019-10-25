const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const base = require('./webpack.base.conf');
const { htmls } = require('./config/pages');

const plugins = [];
htmls.forEach(html => {
  const config = {
    chunks: [html.name],
    chunksSortMode: 'manual',
    template: html.template,
    filename: `${html.name}.html`,
    // favicon: path.resolve(dirs.src, 'favicon.ico'),
    hash: false,
    env: 'dev',
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
    }
  };
  plugins.push(new HtmlWebpackPlugin(config));
});
const options = merge(base, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    hot: true,
    inline: true,
    overlay: {
      warnings: true,
      errors: true
    },
    // https: true,
    host: 'localhost',
    historyApiFallback: true
    // historyApiFallback: {}, // 对于多个单页应用需要专门配置
    // contentBase: path.resolve(dirs.src, 'hotDist')
  },

  watchOptions: {
    aggregateTimeout: 300, // 延迟构建
    ignored: /node_modules/
  },
  plugins: plugins.concat([
    new webpack.HotModuleReplacementPlugin()
  ])
});
module.exports = options;
