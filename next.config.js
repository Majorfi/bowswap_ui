const Dotenv = require('dotenv-webpack');

module.exports = ({
	plugins: [
		new Dotenv()
	],
	env: {
		ALCHEMY_KEY: process.env.ALCHEMY_KEY,
		SIGNATURE_METAPOOL_SWAPPER_ADDRESS: '0xF12eeAB1C759dD7D8C012CcA6d8715EEd80e51b6',
		METAPOOL_SWAPPER_ADDRESS: '0xF12eeAB1C759dD7D8C012CcA6d8715EEd80e51b6',
		VYEMPIRE_SWAPPER: '0xEB8D98f9E42a15b0Eb35315F737bdfDa1a8D2Eaa',
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
