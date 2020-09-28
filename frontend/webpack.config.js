const src = `${__dirname}/src`
const dst = `${__dirname}/build`

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'development',
    //mode: 'production',

    target: 'electron-main',
    context: src,
    entry: './index.js',
    output: {
        filename: 'index.js',
        path: dst,
    },

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: { presets: [
                    ['@babel/preset-env', {
                        'targets': { 'node': 'current' }
                    }],
                ]}
            }],
        }, {
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                { loader: 'css-loader', options: { importLoaders: 1 } },
                { loader: 'postcss-loader' },
            ]
        }, {
            test: /\.svg$/,
            use: [ {
                loader: 'svg-inline-loader',
                options: {
                    removeTags: true,
                    removingTags: ['style'],
                }
            } ]
            // materials: https://icooon-mono.com/
        }, {
            test: /\.(png|jpe?g|gif)$/i,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'assets',
                }
            }]
        }],
    },
    plugins: [
        new HtmlWebpackPlugin({ 'template': './index.html' }),
        new MiniCssExtractPlugin({ filename: 'style.css' }),
    ],
}