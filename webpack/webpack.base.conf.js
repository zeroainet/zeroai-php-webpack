const dirJSON = require('./src/views/views.json');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isProd = (process.env.NODE_ENV === 'prod');


let entry = {};
let plugins = [];
dirJSON.forEach(page => {
    entry[page.url] = path.resolve(__dirname, `./src/views/${page.url}/index.js`);
    let chunks = [page.url];
    if (isProd) {

        chunks.splice(0, 0, 'assets');
        page.easyui && chunks.splice(0, 0, 'easyui');
    	//page.echarts && chunks.splice(0, 0, 'echarts');
        chunks.splice(0, 0, 'vendors');
    }
    plugins.push(
        new HtmlWebpackPlugin({
            favicon: path.resolve(__dirname, `./src/assets/img/favicon.ico`),
            filename: path.resolve(path.dirname(__dirname), `./dist/html/${page.url}.html`),
            template: path.resolve(__dirname, `./src/views/${page.url}/index.html`),
            chunks: chunks,
            chunksSortMode: 'manual',
            minify: false
        })
    );

});

if (isProd) {
    plugins.push(
        new MiniCssExtractPlugin({
            filename: 'css/' + (isProd ? '[name].[contenthash:8].min.css' : '[name].css'),
            chunkFilename: 'css/' + (isProd ? '[name].chunk.[contenthash:8].min.css' : '[name].chunk.css'),
        })
    );


}
// plugins.push(new HtmlWebpackInlineSourcePlugin());

module.exports = {
    entry: entry,
    output: {
        publicPath: isProd ? '../' : '',
        path: path.resolve(path.dirname(__dirname), './dist'),
        filename: 'js/' + (isProd ? '[name].[chunkhash:8].min.js' : '[name].js'),
        chunkFilename: 'js/' + (isProd ? '[name].chunk.[chunkhash:8].min.js' : '[name].chunk.js'),
    },
    externals:{
    },

    module: {
        rules: [
            {
                test: require.resolve('jquery'),
                use: [{
                    loader: 'expose-loader',
                    options: 'jQuery'
                }, {
                    loader: 'expose-loader',
                    options: '$'
                }]
            },

            {
                test: require.resolve('echarts'),
                use: [{
                    loader: 'expose-loader',
                    options: 'echarts'
                }]
            },

            {
                test: /\.(html|htm)$/,
                use: ['html-withimg-loader']
            },
            {
                test: /\.(png|jpg|jpe?g|gif)$/,
                use: ['file-loader?limit=4096&esModule=false&name=[name]' + (isProd ? '.[hash:8]' : '') + '.[ext]&outputPath=img/',  {
                    loader: 'image-webpack-loader',
                    options: {
                    	   bypassOnDebug: true, // webpack@1.x
                           disable: true, // webpack@2.x and newer
                      mozjpeg: {
                        progressive: true,
                        quality: 65
                      },
                      // optipng.enabled: false will disable optipng
                      optipng: {
                        enabled: false,
                      },
                      pngquant: {
                        quality: [0.65, 0.90],
                        speed: 4
                      },
                      gifsicle: {
                        interlaced: false,
                      },
                      // the webp option will enable WEBP
                      webp: {
                        quality: 75
                      }
                    }
                  },
                ]

            },


            {
                test: /\.(webp)$/,
                use: ['file-loader?&name=[name]' + (isProd ? '.[hash:8]' : '') + '.[ext]&outputPath=img/']
            },
            {
                test: /\.(svg|woff|woff2|ttf|eot)(\?.*$|$)/,
                loader: 'file-loader?name=font/[name].[hash:8].[ext]'
            },
            {
                test: /\.(css)$/,
                use: [isProd ? ({
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: '../'
                    }
                }) : 'style-loader', 'css-loader']
            },
            {
                test: /\.(scss)$/,
                use: [isProd ? ({
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: '../'
                    }
                }) : 'style-loader', 'css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        plugins: function () {
                            return [
                                require('autoprefixer')
                            ];
                        }
                    }
                }, 'sass-loader']
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                include: [path.resolve(__dirname, 'src/views'), path.resolve(__dirname, 'assets/js')], // 指定eslint检查的目录
                loader: 'eslint-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"],
                        plugins: ["@babel/plugin-transform-runtime"]
                    }
                }
            }
        ]
    },
    plugins: [
        ...plugins
    ]
};
