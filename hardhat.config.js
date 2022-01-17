require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-truffle5');
require('@nomiclabs/hardhat-ganache');
require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('hardhat-tracer');
require('dotenv').config();

const ALCHEMY_KEY = process.env.ALCHEMY_KEY;

if (!process.env.ALCHEMY_KEY) {
	throw new Error('ENV Variable ALCHEMY_KEY not set!');
}

module.exports = {
	solidity: {
		version: '0.8.10',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		hardhat: {
			forking: {
				url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
				// url: 'https://rpc.ftm.tools/',
				// url: 'http://localhost:8545',
				// blockNumber: 13992195,
				// blockNumber: 28255693
			},
			// blockGasLimit: 12000000,
			initialBaseFeePerGas: 0,
		},
		localhost: {
			url: 'http://localhost:8545',
			timeout: 2000000000
		},
	},
	mocha: {
		timeout: 200000
	}
};
