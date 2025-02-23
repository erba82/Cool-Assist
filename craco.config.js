// craco.config.js
const webpack = require('webpack');

module.exports = {
  babel: {
    plugins: [
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-nullish-coalescing-operator"
    ]
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser'
        })
      );
      return webpackConfig;
    }
  }
};