const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const { NODE_ENV = 'development' } = process.env;
module.exports = {
	entry: './src/index.js',
	mode: NODE_ENV,
	target: 'node',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'index.js',
	},
	resolve: {
		extensions: ['.ts', '.js', '.json', '.prisma', '.env'],
	},
	module: {
		rules: [
			{
				test: /\.js$/i,
				exclude: /node_modules/,
				include: path.resolve(__dirname, 'src'),
				use: {
					loader: 'babel-loader',
				},
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: './upload', to: 'upload' },
				{ from: './prisma', to: 'prisma' },
				{ from: 'package.json', to: 'package.json' },
			],
		}),
		new Dotenv(),
	],

	externals: [nodeExternals()],
};
