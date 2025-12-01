const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'PalChatRoom.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'),
            hash: true
        }),
        new CopyPlugin([
            { from: 'src/favicon.ico', to: '' },
            { from: 'src/base64.js', to: '' }
        ])
    ],
    module: {
        rules: [
          {
            test: /\.less$/,
            loaders: [
                {
                    loader: 'style-loader',
                },
                {
                    loader: 'css-loader',
                },
                {
                    loader: 'less-loader',
                }
            ]
          },
          {
              test: /\.(png|svg|jpg|gif)$/,
              loaders:[
                {
                    loader: 'file-loader'
                }
              ]
          }
        ]
    }
};
