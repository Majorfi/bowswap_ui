const Dotenv = require('dotenv-webpack');

module.exports = ({
	plugins: [
		new Dotenv()
	],
	env: {
		IS_TEST: true,
		TESTED_NETWORK: 1,

		ALCHEMY_KEY: process.env.ALCHEMY_KEY,
		BOWSWAP_SWAPPER_ADDR: '0x000000000037D42ab4e2226CE6f44C5dC0Cf5b16',
		BOWSWAP_SWAPPER_FTM_ADDR: '0x162A433068F51e18b7d13932F27e66a3f99E6890',

		CURVE_REGISTRY_ADDR: '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5',
		CURVE_REGISTRY_FTM_ADDR: '0x4fb93D7d320E8A263F22f62C2059dFC2A8bCbC4c',

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
	}
});
