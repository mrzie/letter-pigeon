const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const basic = {
    entry: ['@babel/polyfill', './pages/src/index.tsx'],
    output: {
        path: path.resolve(__dirname, './pages/dist'),
        filename: 'main.js',
        publicPath: '/static', // todo
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['babel-loader', 'ts-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: [
                    'css-hot-loader',
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../',
                            modules: true,
                            minimize: true,
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            modules: true,
                            importLoaders: 1,
                            camelCase: true,
                        }
                    }, {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true,
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'css-hot-loader',
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../',
                            // modules: true,
                            // minimize: true,
                        }
                    },
                    // 'style-loader',
                    'css-loader',
                ]
            },
        ]
    },


    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "styles.[name].css"
        }),

        new HtmlWebpackPlugin({
            //    / templateContent: '<div id="app" />',
            template: "./pages/src/template.html",
            filename: 'index.html'
        }),
    ],
};

const dev = {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
        ...basic.plugins,
        // new HtmlWebpackPlugin({
        //     templateContent: '<div id="app" />',
        //     filename: 'index.html'
        // }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        host: 'localhost', //服务器的ip地址
        port: 1573, //端口
        open: true, //自动打开页面
        hot: true,
        // contentBase: path.resolve(__dirname, '../pages/dist'),
        // openPage: 'static',
        proxy: {
            "/": {
                target: "http://localhost:5387",
                changeOrigin: true,
            },
            '/ws': {
                target: 'http://localhost:5387',
                ws: true,
                changeOrigin: true,
                pathRewrite: {
                    '^/ws': ''
                },
            }
        },
    },
};

const prod = {
    // optimization: {
    //     minimizer: [
    //         new UglifyJsPlugin({
    //             uglifyOptions: {
    //                 output: {
    //                     comments: false,
    //                 },
    //             },
    //         })
    //     ]
    // }
};

module.exports = (env = {}) => {
    if (env.production) {
        return {
            ...basic,
            ...prod,
        };
    } else {
        return {
            ...basic,
            ...dev,
        };
    }
}