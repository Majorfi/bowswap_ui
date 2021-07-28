/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Saturday January 2nd 2021
**	@Filename:				API.js
******************************************************************************/

import	axios			from	'axios';
import	toast			from	'react-hot-toast';

export const	performGet = (url) => {
	return (
		axios.get(url)
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				console.warn(error);
				return null;
			})
	);
};

export const TMP_VAULTS = [
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417/logo-128.png',
		'symbol': 'yvCurve-USDP',
		'name': 'Curve USDP Pool yVault',
		'displayName': 'crvUSDP',
		'decimals': 18,
		'address': '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417',
		'tokenAddress': '0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6',
		'poolAddress': '0x42d7025938bEc20B69cBae5A77421082407f053A',
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x0FCDAeDFb8A7DfDa2e9838564c5A1665d856AFDF/logo-128.png',
		'symbol': 'yvmusd3CRV',
		'name': 'yearn Curve.fi MUSD/3Crv',
		'displayName': 'crvMUSD',
		'decimals': 18,
		'address': '0x0FCDAeDFb8A7DfDa2e9838564c5A1665d856AFDF',
		'tokenAddress': '0x1AEf73d49Dedc4b1778d0706583995958Dc862e6',
		'poolAddress': '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x8cc94ccd0f3841a468184aCA3Cc478D2148E1757/logo-128.png',
		'symbol': 'yvCurve-mUSD',
		'name': 'Curve mUSD Pool yVault',
		'displayName': 'crvMUSD',
		'decimals': 18,
		'address': '0x8cc94ccd0f3841a468184aCA3Cc478D2148E1757',
		'tokenAddress': '0x1AEf73d49Dedc4b1778d0706583995958Dc862e6',
		'poolAddress': '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x23D3D0f1c697247d5e0a9efB37d8b0ED0C464f7f/logo-128.png',
		'symbol': 'yvCurve-tBTC',
		'name': 'Curve tBTC Pool yVault',
		'displayName': 'crvTBTC',
		'decimals': 18,
		'address': '0x23D3D0f1c697247d5e0a9efB37d8b0ED0C464f7f',
		'tokenAddress': '0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd',
		'poolAddress': '0xC25099792E9349C7DD09759744ea681C7de2cb66'
	},
	{
		'displayName': 'crvUSDN',
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3/logo-128.png',
		'symbol': 'yvusdn3CRV',
		'decimals': 18,
		'name': 'yearn Curve.fi USDN/3Crv',
		'address': '0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3',
		'tokenAddress': '0x4f3E8F405CF5aFC05D68142F3783bDfE13811522',
		'poolAddress': '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x3D27705c64213A5DcD9D26880c1BcFa72d5b6B0E/logo-128.png',
		'symbol': 'yvCurve-USDK',
		'name': 'Curve USDK Pool yVault',
		'displayName': 'crvUSDK',
		'decimals': 18,
		'address': '0x3D27705c64213A5DcD9D26880c1BcFa72d5b6B0E',
		'tokenAddress': '0x97E2768e8E73511cA874545DC5Ff8067eB19B787',
		'poolAddress': '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x5fA5B62c8AF877CB37031e0a3B2f34A78e3C56A6/logo-128.png',
		'symbol': 'yvCurve-LUSD',
		'name': 'Curve LUSD Pool yVault',
		'displayName': 'crvLUSD',
		'decimals': 18,
		'address': '0x5fA5B62c8AF877CB37031e0a3B2f34A78e3C56A6',
		'tokenAddress': '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
		'poolAddress': '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0xf8768814b88281DE4F532a3beEfA5b85B69b9324/logo-128.png',
		'symbol': 'yvCurve-TUSD',
		'name': 'Curve TUSD Pool yVault',
		'displayName': 'crvTUSD',
		'decimals': 18,
		'address': '0xf8768814b88281DE4F532a3beEfA5b85B69b9324',
		'tokenAddress': '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
		'poolAddress': '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x054AF22E1519b020516D72D749221c24756385C9/logo-128.png',
		'symbol': 'yvCurve-HUSD',
		'name': 'Curve HUSD Pool yVault',
		'displayName': 'crvHUSD',
		'decimals': 18,
		'address': '0x054AF22E1519b020516D72D749221c24756385C9',
		'tokenAddress': '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858',
		'poolAddress': '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604'
	},
	{
		'displayName': 'crvTBTC',
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x07FB4756f67bD46B748b16119E802F1f880fb2CC/logo-128.png',
		'symbol': 'yvtbtc/sbtcCrv',
		'name': 'yearn Curve.fi tBTC/sbtcCrv',
		'decimals': 18,
		'address': '0x07FB4756f67bD46B748b16119E802F1f880fb2CC',
		'tokenAddress': '0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd',
		'poolAddress': '0xC25099792E9349C7DD09759744ea681C7de2cb66'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x3B96d491f067912D18563d56858Ba7d6EC67a6fa/logo-128.png',
		'symbol': 'yvCurve-USDN',
		'name': 'Curve USDN Pool yVault',
		'displayName': 'crvUSDN',
		'decimals': 18,
		'address': '0x3B96d491f067912D18563d56858Ba7d6EC67a6fa',
		'tokenAddress': '0x4f3E8F405CF5aFC05D68142F3783bDfE13811522',
		'poolAddress': '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1'
	},
	{
		'displayName': 'crvHUSD',
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x39546945695DCb1c037C836925B355262f551f55/logo-128.png',
		'symbol': 'yvhusd3CRV',
		'decimals': 18,
		'name': 'yearn Curve.fi HUSD/3Crv',
		'address': '0x39546945695DCb1c037C836925B355262f551f55',
		'tokenAddress': '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858',
		'poolAddress': '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x6Ede7F19df5df6EF23bD5B9CeDb651580Bdf56Ca/logo-128.png',
		'symbol': 'yvCurve-BUSD',
		'name': 'Curve BUSD Pool yVault',
		'decimals': 18,
		'displayName': 'crvBUSD',
		'address': '0x6Ede7F19df5df6EF23bD5B9CeDb651580Bdf56Ca',
		'tokenAddress': '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
		'poolAddress': '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a'
	},
	{
		'displayName': 'crvUSDP',
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x1B5eb1173D2Bf770e50F10410C9a96F7a8eB6e75/logo-128.png',
		'symbol': 'yvusdp3CRV',
		'name': 'yearn Curve.fi USDP/3Crv',
		'decimals': 18,
		'address': '0x1B5eb1173D2Bf770e50F10410C9a96F7a8eB6e75',
		'tokenAddress': '0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6',
		'poolAddress': '0x42d7025938bEc20B69cBae5A77421082407f053A'
	}
];


async function	_fetchYearnVaults() {
	const	result = await performGet('https://api.yearn.tools/vaults/all');

	if (result) {
		return result;
	}
	return null;
}
export async function	fetchYearnVaults() {
	return await toast.promise(_fetchYearnVaults(), {
		loading: 'Fetching Vaults',
		success: 'Vaults fetched',
		error: 'Impossible to retrieve the CRV vaults',
	});
}
