const	COMPOUND = [
	{
		service: 0,
		decimals: 18,
		underlyingName: 'DAI',
		cgID: 'dai',
		underlyingAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
		image: '/tokens/0x6b175474e89094c44da98b954eedeac495271d0f.svg',
		uToken: {
			name: 'cDAI',
			image: '/uTokens/0x5d3a536e4d6dbd6114cc1ead35777bab948e3643.svg',
			address: '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
			apy: 0,
		},
		yvToken: {
			name: 'yvDAI',
			image: '/yvTokens/0xdA816459F1AB5631232FE5e97a05BBBb94970c95.svg',
			address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
			apy: 0,
		}
	},
	{
		service: 0,
		decimals: 6,
		underlyingName: 'USDC',
		cgID: 'usd-coin',
		underlyingAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		image: '/tokens/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.svg',
		uToken: {
			name: 'cUSDC',
			image: '/uTokens/0x39aa39c021dfbae8fac545936693ac917d5e7563.svg',
			address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
			apy: 0,
		},
		yvToken: {
			name: 'yvUSDC',
			image: '/yvTokens/0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9.svg',
			address: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9',
			apy: 0,
		}
	},
	{
		service: 0,
		decimals: 6,
		underlyingName: 'USDT',
		cgID: 'tether',
		underlyingAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
		image: '/tokens/0xdAC17F958D2ee523a2206206994597C13D831ec7.svg',
		uToken: {
			name: 'cUSDT',
			image: '/uTokens/0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9.svg',
			address: '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
			apy: 0,
		},
		yvToken: {
			name: 'yvUSDT',
			image: '/yvTokens/0x7Da96a3891Add058AdA2E826306D812C638D87a7.svg',
			address: '0x7Da96a3891Add058AdA2E826306D812C638D87a7',
			apy: 0,
		}
	},
	{
		service: 0,
		decimals: 8,
		underlyingName: 'WBTC',
		cgID: 'wrapped-bitcoin',
		underlyingAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
		image: '/tokens/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.svg',
		uToken: {
			name: 'cWBTC',
			image: '/uTokens/0xc11b1268c1a384e55c48c2391d8d480264a3a7f4.svg',
			address: '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4',
			apy: 0,
		},
		yvToken: {
			name: 'yvWBTC',
			image: '/yvTokens/0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E.svg',
			address: '0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E',
			apy: 0,
		}
	},
	{
		service: 0,
		decimals: 8,
		underlyingName: 'WBTC',
		cgID: 'wrapped-bitcoin',
		underlyingAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
		image: '/tokens/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.svg',
		uToken: {
			name: 'cWBTC - 2',
			image: '/uTokens/0xc11b1268c1a384e55c48c2391d8d480264a3a7f4.svg',
			address: '0xccf4429db6322d5c611ee964527d42e5d685dd6a',
			apy: 0,
		},
		yvToken: {
			name: 'yvWBTC',
			image: '/yvTokens/0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E.svg',
			address: '0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E',
			apy: 0,
		}
	},
	{
		service: 0,
		decimals: 18,
		underlyingName: 'LINK',
		cgID: 'chainlink',
		underlyingAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
		image: '/tokens/0x514910771AF9Ca656af840dff83E8264EcF986CA.svg',
		uToken: {
			name: 'cLINK',
			image: '/uTokens/0xface851a4921ce59e912d19329929ce6da6eb0c7.svg',
			address: '0xface851a4921ce59e912d19329929ce6da6eb0c7',
			apy: 0,
		},
		yvToken: {
			name: 'yvLINK',
			image: '/yvTokens/0x671a912C10bba0CFA74Cfc2d6Fba9BA1ed9530B2.svg',
			address: '0x671a912C10bba0CFA74Cfc2d6Fba9BA1ed9530B2',
			apy: 0,
		}
	},
	{
		service: 0,
		decimals: 18,
		underlyingName: 'UNI',
		cgID: 'uniswap',
		underlyingAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
		image: '/tokens/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984.svg',
		uToken: {
			name: 'cUNI',
			image: '/uTokens/0x35a18000230da775cac24873d00ff85bccded550.svg',
			address: '0x35a18000230da775cac24873d00ff85bccded550',
			apy: 0,
		},
		yvToken: {
			name: 'yvUNI',
			image: '/yvTokens/0xFBEB78a723b8087fD2ea7Ef1afEc93d35E8Bed42.svg',
			address: '0xFBEB78a723b8087fD2ea7Ef1afEc93d35E8Bed42',
			apy: 0,
		}
	},
	{
		service: 0,
		decimals: 18,
		underlyingName: 'YFI',
		cgID: 'yfi',
		underlyingAddress: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
		image: '/tokens/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e.svg',
		uToken: {
			name: 'cYFI',
			image: '/uTokens/0x80a2ae356fc9ef4305676f7a3e2ed04e12c33946.svg',
			address: '0x80a2ae356fc9ef4305676f7a3e2ed04e12c33946',
			apy: 0,
		},
		yvToken: {
			name: 'yvYFI',
			image: '/yvTokens/0xE14d13d8B3b85aF791b2AADD661cDBd5E6097Db1.svg',
			address: '0xE14d13d8B3b85aF791b2AADD661cDBd5E6097Db1',
			apy: 0,
		}
	},
];

export default COMPOUND;