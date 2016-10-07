var webpack = require('webpack'),
    path = require('path'),
    ignorePath = /(node_modules|bower_components)/;

const ENV = process.env.ENV || 'development';

var plugins = [];

if ('production' === ENV) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    comments: false,
    compress: {
      warnings: false
    }
  }));
}

module.exports = {
  context: path.join(__dirname, 'src'),

  entry: {
    'angular-resource-transformer': './index.js'
  },

  module: {
    preLoaders: [
      {test: /\.js$/, loaders: ['eslint'], exclude: ignorePath}
    ],
    loaders: [
      { test: /\.js$/,   loaders: ['babel'], exclude: ignorePath }
    ]
  },

  plugins: plugins,
  
  output: {
    // Make sure to use [name] or [id] in output.filename
    //  when using multiple entry points
    path: __dirname + '/dist',
    filename: '[name].js'
  },
  externals: {
    'angular': 'angular',
    'lodash': '_',
    'moment': 'moment'
  },
  watchOptions: {
    poll: 1000
  },
  eslint: {
    quiet: false
  }
};

