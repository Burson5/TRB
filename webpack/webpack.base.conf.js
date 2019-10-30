const webpack = require('webpack');
const os = require('os');
const HappyPack = require('happypack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const { entries } = require('./config/pages');
const dirs = require('./config/dirs');

const happyPackThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const extractSass = new ExtractTextPlugin(
  `css/bundle_sass.[chunkhash].min.css`
);
const extractLess = new ExtractTextPlugin(
  `css/bundle_less.[chunkhash].min.css`
);
const extractCSS = new ExtractTextPlugin(`css/bundle_css.[chunkhash].min.css`);

console.log({entries})

module.exports = {
  context: dirs.src,

  entry: entries,

  output: {
    path: dirs.dist,
    publicPath: '/',
    filename: 'js/[name].min.js'
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '~': dirs.src
    }
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'happypack/loader?id=babel'
      },
      {
        test: /\.(json|conf)$/,
        exclude: /node_modules/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: ['css-loader']
        })
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  localIdentName: '[local]__[name]-[hash:base64:8]'
                }
              }
            },
            'sass-loader'
          ]
        })
      },

      {
        test: /\.less$/,
        use: extractLess.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader?javascriptEnabled=true']
        })
      },

      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000000,
              name: 'images/[name].[ext]'
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new HappyPack({
      id: 'babel',
      loaders: [
        {
          loader: 'babel-loader',
          options: {
            babelrc: true,
            cacheDirectory: true
          }
        }
      ],
      threadPool: happyPackThreadPool,
      verbose: true
    }),
    // 抽取样式
    extractSass,
    extractLess,
    extractCSS
  ]
};
