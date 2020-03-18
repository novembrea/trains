var webpack = require('webpack')
var path = require('path')
var package = require('./package.json')
var { CleanWebpackPlugin } = require('clean-webpack-plugin')

var isProduction = process.argv.indexOf('-p') >= 0 || process.env.NODE_ENV === 'production'
var sourcePath = path.join(__dirname, './src')
var outPath = path.join(__dirname, './build')

var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: sourcePath,
  entry: {
    trains: './index.ts',
  },
  output: {
    path: outPath,
    publicPath: '/',
    filename: isProduction ? '[contenthash].js' : '[name].js',
  },
  target: 'web',
  resolve: {
    extensions: ['.js', '.ts'],
    mainFields: ['module', 'browser', 'main'],
    alias: {},
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          !isProduction && {
            loader: 'babel-loader',
          },
          'ts-loader',
        ].filter(Boolean),
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: false,
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html',
      minify: {
        minifyJS: true,
        minifyCSS: true,
        removeComments: true,
        useShortDoctype: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
      },
      append: {
        head: `<script src="//cdn.polyfill.io/v3/polyfill.min.js"></script>`,
      },
      meta: {
        title: package.name,
        description: package.description,
        keywords: Array.isArray(package.keywords) ? package.keywords.join(',') : undefined,
      },
    }),
  ],
  devServer: {
    publicPath: '/',
    contentBase: sourcePath,
    hot: true,
    inline: true,
    historyApiFallback: true,
    stats: 'minimal',
    clientLogLevel: 'warning',
  },
  devtool: isProduction ? 'hidden-source-map' : 'cheap-module-eval-source-map',
  node: {
    fs: 'empty',
    net: 'empty',
  },
}
