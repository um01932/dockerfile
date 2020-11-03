
var webpack = require('webpack');


module.exports = {
    mode: 'production',
    entry: ['./src/iwp/Messaging'],
    devtool: 'source-map',
    output: {
        path: require("path").resolve("./lib"),
        filename: 'workplace-api.js',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(require("./package.json").version)
        })
    ]
};