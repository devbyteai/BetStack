const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);

const babelLoaderConfiguration = {
  test: /\.(js|jsx|ts|tsx)$/,
  include: [
    path.resolve(appDirectory, 'index.web.js'),
    path.resolve(appDirectory, 'App.tsx'),
    path.resolve(appDirectory, 'src'),
    path.resolve(appDirectory, 'node_modules/react-native-vector-icons'),
  ],
  exclude: [
    path.resolve(appDirectory, 'node_modules/react-native-reanimated'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      configFile: path.resolve(appDirectory, 'babel.config.web.js'),
    },
  },
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

module.exports = {
  entry: path.resolve(appDirectory, 'index.web.js'),
  output: {
    filename: 'bundle.web.js',
    path: path.resolve(appDirectory, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [babelLoaderConfiguration, imageLoaderConfiguration],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'public/index.html'),
    }),
  ],
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      '@': path.resolve(appDirectory, 'src'),
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      'react-native-safe-area-context': path.resolve(appDirectory, 'src/web/SafeAreaMock.js'),
      'react-native-gesture-handler': path.resolve(appDirectory, 'src/web/GestureHandlerMock.js'),
      'react-native-reanimated': path.resolve(appDirectory, 'src/web/ReanimatedMock.js'),
      '@react-native-async-storage/async-storage': path.resolve(appDirectory, 'src/web/AsyncStorageMock.js'),
      'react-native-haptic-feedback': path.resolve(appDirectory, 'src/web/HapticMock.js'),
      'react-native-notifications': path.resolve(appDirectory, 'src/web/NotificationsMock.js'),
      '@sentry/react-native': path.resolve(appDirectory, 'src/web/SentryMock.js'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  devServer: {
    static: {
      directory: path.join(appDirectory, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  mode: 'development',
  devtool: 'source-map',
};
