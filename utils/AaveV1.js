/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday August 12th 2021
**	@Filename:				AaveV1.js
******************************************************************************/

const	AAVE_V1 = [
	{
		service: 1,
		decimals: 18,
		underlyingName: 'DAI',
		cgID: 'dai',
		underlyingAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
		image: '/tokens/0x6b175474e89094c44da98b954eedeac495271d0f.svg',
		aToken: {
			name: 'aDAI - v1',
			address: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
			apy: 0,
		},
		yvToken: {
			name: 'yvDAI',
			address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
			apy: 0,
		}
	},
	{
		service: 1,
		decimals: 6,
		underlyingName: 'USDC',
		cgID: 'usd-coin',
		underlyingAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		image: '/tokens/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.svg',
		aToken: {
			name: 'aUSDC - v1',
			address: '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E',
			apy: 0,
		},
		yvToken: {
			name: 'yvUSDC',
			address: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9',
			apy: 0,
		}
	},
	{
		service: 1,
		decimals: 6,
		underlyingName: 'USDT',
		cgID: 'tether',
		underlyingAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
		image: '/tokens/0xdAC17F958D2ee523a2206206994597C13D831ec7.svg',
		aToken: {
			name: 'aUSDT - v1',
			address: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
			apy: 0,
		},
		yvToken: {
			name: 'yvUSDT',
			address: '0x7Da96a3891Add058AdA2E826306D812C638D87a7',
			apy: 0,
		}
	},
	{
		service: 1,
		decimals: 18,
		underlyingName: 'WETH',
		cgID: 'ethereum',
		underlyingAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		image: '/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2.svg',
		aToken: {
			name: 'aWETH - v1',
			address: '0x3a3A65aAb0dd2A17E3F1947bA16138cd37d08c04',
			apy: 0,
		},
		yvToken: {
			name: 'yvWETH',
			address: '0xa258C4606Ca8206D8aA700cE2143D7db854D168c',
			apy: 0,
		}
	},
	{
		service: 1,
		decimals: 8,
		underlyingName: 'WBTC',
		cgID: 'wrapped-bitcoin',
		underlyingAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
		image: '/tokens/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.svg',
		aToken: {
			name: 'aWBTC - v1',
			address: '0xFC4B8ED459e00e5400be803A9BB3954234FD50e3',
			apy: 0,
		},
		yvToken: {
			name: 'yvWBTC',
			address: '0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E',
			apy: 0,
		}
	},
	{
		service: 1,
		decimals: 18,
		underlyingName: 'SUSD',
		cgID: 'nusd',
		underlyingAddress: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
		image: '/tokens/0x57Ab1ec28D129707052df4dF418D58a2D46d5f51.svg',
		aToken: {
			name: 'aSUSD - v1',
			address: '0x625aE63000f46200499120B906716420bd059240',
			apy: 0,
		},
		yvToken: {
			name: 'yvSUSD',
			address: '0xa5cA62D95D24A4a350983D5B8ac4EB8638887396',
			apy: 0,
		}
	},
	{
		service: 1,
		decimals: 18,
		underlyingName: 'LINK',
		cgID: 'chainlink',
		underlyingAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
		image: '/tokens/0x514910771AF9Ca656af840dff83E8264EcF986CA.svg',
		aToken: {
			name: 'aLINK - v1',
			address: '0xA64BD6C70Cb9051F6A9ba1F163Fdc07E0DfB5F84',
			apy: 0,
		},
		yvToken: {
			name: 'yvLINK',
			address: '0x671a912C10bba0CFA74Cfc2d6Fba9BA1ed9530B2',
			apy: 0,
		}
	},
	{
		service: 1,
		decimals: 18,
		underlyingName: 'SNX',
		cgID: 'havven',
		underlyingAddress: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
		image: '/tokens/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F.svg',
		aToken: {
			name: 'aSNX - v1',
			address: '0x328C4c80BC7aCa0834Db37e6600A6c49E12Da4DE',
			apy: 0,
		},
		yvToken: {
			name: 'yvSNX',
			address: '0xF29AE508698bDeF169B89834F76704C3B205aedf',
			apy: 0,
		}
	},
	{
		service: 1,
		decimals: 18,
		underlyingName: 'UNI',
		cgID: 'uniswap',
		underlyingAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
		image: '/tokens/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984.svg',
		aToken: {
			name: 'aUNI - v1',
			address: '0xB124541127A0A657f056D9Dd06188c4F1b0e5aab',
			apy: 0,
		},
		yvToken: {
			name: 'yvUNI',
			address: '0xFBEB78a723b8087fD2ea7Ef1afEc93d35E8Bed42',
			apy: 0,
		}
	},
	{
		service: 1,
		decimals: 18,
		underlyingName: 'YFI',
		cgID: 'yfi',
		underlyingAddress: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
		image: '/tokens/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e.svg',
		aToken: {
			name: 'aYFI - v1',
			address: '0x12e51E77DAAA58aA0E9247db7510Ea4B46F9bEAd',
			apy: 0,
		},
		yvToken: {
			name: 'yvYFI',
			address: '0xE14d13d8B3b85aF791b2AADD661cDBd5E6097Db1',
			apy: 0,
		}
	},
];

export default AAVE_V1;