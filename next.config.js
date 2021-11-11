const Dotenv = require('dotenv-webpack');

module.exports = ({
	plugins: [
		new Dotenv()
	],
	env: {
		ALCHEMY_KEY: process.env.ALCHEMY_KEY,
		BOWSWAP_SWAPPER_ADDR: '0x00000000ff0027b3f3d2b0412d4a4ced4e3366da',
		VYEMPIRE_SWAPPER_ADDR: '0xEB8D98f9E42a15b0Eb35315F737bdfDa1a8D2Eaa',
		SECRET: process.env.SECRET,
	},
	optimization: {
		minimize: true,
		splitChunks: {
			chunks: 'all',
			maxInitialRequests: 25,
			minSize: 20000
		}
	},
	images: {
		domains: [
			'raw.githubusercontent.com',
			'rawcdn.githack.com'
		],
	},
	webpack: (config, {webpack}) => {
		config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));
		return config;
	},
	webpackDevMiddleware: (config) => {
		// Perform customizations to webpack dev middleware config
		// Important: return the modified config
		return config;
	},
});
