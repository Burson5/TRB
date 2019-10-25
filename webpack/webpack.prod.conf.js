const path = require('path');
const dirs = require('./config/dirs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const dllManifestOfVendorFrame = require('../lib/vendor_frame.manifest.dll.json');
const dllManifestOfVendorUI = require('../lib/vendor_ui.manifest.dll.json');
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
    env: 'prod',
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
    }
  };
  plugins.push(new HtmlWebpackPlugin(config));
});
const options = merge(base, {
  mode: 'production',
  devtool: false,
  plugins: [
    ...plugins,
    // 引入框架 dll
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: dllManifestOfVendorFrame
    }),
    // 引入ui dll
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: dllManifestOfVendorUI
    }),
    // 将dll引入html
    new AddAssetHtmlWebpackPlugin([
      {
        typeOfAsset: 'js',
        includeSourcemap: false,
        filepath: path.resolve(dirs.lib, '**/*.dll.js'),
        publicPath: '/js',
        outputPath: '/js'
      }
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
});
module.exports = options;
