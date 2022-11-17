const path = require('path')
const nodeExternals = require('webpack-node-externals')
const CopyPlugin = require('copy-webpack-plugin')

const { NODE_ENV = 'production' } = process.env
module.exports = {
  entry: './src/app.ts',
  mode: NODE_ENV,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './package.json', to: './package.json' },
        { from: './swagger.json', to: './swagger.json' },
        { from: './src/server/views', to: './views' },
      ],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  watch: NODE_ENV === 'development',
}
