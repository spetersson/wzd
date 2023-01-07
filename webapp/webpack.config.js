const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist')

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.png$/,
        use: 'url-loader',
      },
    ],
  },
  resolve: {
    alias: {
      ['@']: src
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: dist,
  },
  plugins: [new HtmlWebpackPlugin({ template: path.join(src, 'index.html'),  })],
};