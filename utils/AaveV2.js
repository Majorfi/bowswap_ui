/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday August 12th 2021
**	@Filename:				AaveV2.js
******************************************************************************/

const	AAVE_V2 = [
	{
		service: 2,
		decimals: 18,
		underlyingName: 'DAI',
		cgID: 'dai',
		underlyingAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
		image: '/tokens/0x6b175474e89094c44da98b954eedeac495271d0f.svg',
		aToken: {
			name: 'aDAI',
			address: '0x028171bca77440897b824ca71d1c56cac55b68a3',
			apy: 0,
		},
		yvToken: {
			name: 'yvDAI',
			address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
			apy: 0,
		}
	},
	{
		service: 2,
		decimals: 6,
		underlyingName: 'USDC',
		cgID: 'usd-coin',
		underlyingAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		image: '/tokens/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.svg',
		aToken: {
			name: 'aUSDC',
			address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
			apy: 0,
		},
		yvToken: {
			name: 'yvUSDC',
			address: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9',
			apy: 0,
		}
	},
	{
		service: 2,
		decimals: 6,
		underlyingName: 'USDT',
		cgID: 'tether',
		underlyingAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
		image: '/tokens/0xdAC17F958D2ee523a2206206994597C13D831ec7.svg',
		aToken: {
			name: 'aUSDT',
			address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
			apy: 0,
		},
		yvToken: {
			name: 'yvUSDT',
			address: '0x7Da96a3891Add058AdA2E826306D812C638D87a7',
			apy: 0,
		}
	},
	{
		service: 2,
		decimals: 18,
		underlyingName: 'WETH',
		cgID: 'ethereum',
		underlyingAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		image: '/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2.svg',
		aToken: {
			name: 'aWETH',
			address: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
			apy: 0,
		},
		yvToken: {
			name: 'yvWETH',
			address: '0xa258C4606Ca8206D8aA700cE2143D7db854D168c',
			apy: 0,
		}
	},
	{
		service: 2,
		decimals: 8,
		underlyingName: 'WBTC',
		cgID: 'wrapped-bitcoin',
		underlyingAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
		image: '/tokens/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.svg',
		aToken: {
			name: 'aWBTC',
			address: '0x9ff58f4fFB29fA2266Ab25e75e2A8b3503311656',
			apy: 0,
		},
		yvToken: {
			name: 'yvWBTC',
			address: '0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E',
			apy: 0,
		}
	},
	{
		service: 2,
		decimals: 18,
		underlyingName: 'SUSD',
		cgID: 'nusd',
		underlyingAddress: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
		image: '/tokens/0x57Ab1ec28D129707052df4dF418D58a2D46d5f51.svg',
		aToken: {
			name: 'aSUSD',
			address: '0x6C5024Cd4F8A59110119C56f8933403A539555EB',
			apy: 0,
		},
		yvToken: {
			name: 'yvSUSD',
			address: '0xa5cA62D95D24A4a350983D5B8ac4EB8638887396',
			apy: 0,
		}
	},
	{
		service: 2,
		decimals: 18,
		underlyingName: 'LINK',
		cgID: 'chainlink',
		underlyingAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
		image: '/tokens/0x514910771AF9Ca656af840dff83E8264EcF986CA.svg',
		aToken: {
			name: 'aLINK',
			address: '0xa06bC25B5805d5F8d82847D191Cb4Af5A3e873E0',
			apy: 0,
		},
		yvToken: {
			name: 'yvLINK',
			address: '0x671a912C10bba0CFA74Cfc2d6Fba9BA1ed9530B2',
			apy: 0,
		}
	},
	{
		service: 2,
		decimals: 18,
		underlyingName: 'RAI',
		cgID: 'rai',
		underlyingAddress: '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
		image: '/tokens/0x03ab458634910aad20ef5f1c8ee96f1d6ac54919.svg',
		aToken: {
			name: 'aRAI',
			address: '0xc9BC48c72154ef3e5425641a3c747242112a46AF',
			apy: 0,
		},
		yvToken: {
			name: 'yvRAI',
			address: '0x671a912C10bba0CFA74Cfc2d6Fba9BA1ed9530B2',
			apy: 0,
		}
	},
	{
		service: 2,
		decimals: 18,
		underlyingName: 'SNX',
		cgID: 'havven',
		underlyingAddress: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
		image: '/tokens/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F.svg',
		aToken: {
			name: 'aSNX',
			address: '0x35f6B052C598d933D69A4EEC4D04c73A191fE6c2',
			apy: 0,
		},
		yvToken: {
			name: 'yvSNX',
			address: '0xF29AE508698bDeF169B89834F76704C3B205aedf',
			apy: 0,
		}
	},
	{
		service: 2,
		decimals: 18,
		underlyingName: 'UNI',
		cgID: 'uniswap',
		underlyingAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
		image: '/tokens/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984.svg',
		aToken: {
			name: 'aUNI',
			address: '0xB9D7CB55f463405CDfBe4E90a6D2Df01C2B92BF1',
			apy: 0,
		},
		yvToken: {
			name: 'yvUNI',
			address: '0xFBEB78a723b8087fD2ea7Ef1afEc93d35E8Bed42',
			apy: 0,
		}
	},
	{
		service: 2,
		decimals: 18,
		underlyingName: 'YFI',
		cgID: 'yfi',
		underlyingAddress: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
		image: '/tokens/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e.svg',
		aToken: {
			name: 'aYFI',
			address: '0x5165d24277cD063F5ac44Efd447B27025e888f37',
			apy: 0,
		},
		yvToken: {
			name: 'yvYFI',
			address: '0xE14d13d8B3b85aF791b2AADD661cDBd5E6097Db1',
			apy: 0,
		}
	},
];

export default AAVE_V2;