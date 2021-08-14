/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Saturday January 2nd 2021
**	@Filename:				API.js
******************************************************************************/

import	axios			from	'axios';

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

export const USD_VAULTS = [
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417/logo-128.png',
		'symbol': 'yvCurve-USDP',
		'name': 'Curve USDP Pool yVault',
		'displayName': 'crvUSDP',
		'decimals': 18,
		'scope': 'usd',
		'address': '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417',
		'tokenAddress': '0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6',
		'poolAddress': '0x42d7025938bEc20B69cBae5A77421082407f053A',
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x8cc94ccd0f3841a468184aCA3Cc478D2148E1757/logo-128.png',
		'symbol': 'yvCurve-mUSD',
		'name': 'Curve mUSD Pool yVault',
		'displayName': 'crvMUSD',
		'decimals': 18,
		'scope': 'usd',
		'address': '0x8cc94ccd0f3841a468184aCA3Cc478D2148E1757',
		'tokenAddress': '0x1AEf73d49Dedc4b1778d0706583995958Dc862e6',
		'poolAddress': '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x5fA5B62c8AF877CB37031e0a3B2f34A78e3C56A6/logo-128.png',
		'symbol': 'yvCurve-LUSD',
		'name': 'Curve LUSD Pool yVault',
		'displayName': 'crvLUSD',
		'decimals': 18,
		'scope': 'usd',
		'address': '0x5fA5B62c8AF877CB37031e0a3B2f34A78e3C56A6',
		'tokenAddress': '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
		'poolAddress': '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x30FCf7c6cDfC46eC237783D94Fc78553E79d4E9C/logo-128.png',
		'symbol': 'yvCurve-DUSD',
		'name': 'Curve DUSD Pool yVault',
		'displayName': 'crvDUSD',
		'decimals': 18,
		'scope': 'usd',
		'address': '0x30FCf7c6cDfC46eC237783D94Fc78553E79d4E9C',
		'tokenAddress': '0x3a664Ab939FD8482048609f652f9a0B0677337B9',
		'poolAddress': '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0xf8768814b88281DE4F532a3beEfA5b85B69b9324/logo-128.png',
		'symbol': 'yvCurve-TUSD',
		'name': 'Curve TUSD Pool yVault',
		'displayName': 'crvTUSD',
		'decimals': 18,
		'scope': 'usd',
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
		'scope': 'usd',
		'address': '0x054AF22E1519b020516D72D749221c24756385C9',
		'tokenAddress': '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858',
		'poolAddress': '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x3B96d491f067912D18563d56858Ba7d6EC67a6fa/logo-128.png',
		'symbol': 'yvCurve-USDN',
		'name': 'Curve USDN Pool yVault',
		'displayName': 'crvUSDN',
		'decimals': 18,
		'scope': 'usd',
		'address': '0x3B96d491f067912D18563d56858Ba7d6EC67a6fa',
		'tokenAddress': '0x4f3E8F405CF5aFC05D68142F3783bDfE13811522',
		'poolAddress': '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x6Ede7F19df5df6EF23bD5B9CeDb651580Bdf56Ca/logo-128.png',
		'symbol': 'yvCurve-BUSD',
		'name': 'Curve BUSD Pool yVault',
		'decimals': 18,
		'scope': 'usd',
		'displayName': 'crvBUSD',
		'address': '0x6Ede7F19df5df6EF23bD5B9CeDb651580Bdf56Ca',
		'tokenAddress': '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
		'poolAddress': '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x1C6a9783F812b3Af3aBbf7de64c3cD7CC7D1af44/logo-128.png',
		'symbol': 'yvCurve-UST',
		'name': 'Curve UST Pool yVault',
		'decimals': 18,
		'scope': 'usd',
		'displayName': 'crvUST',
		'address': '0x1C6a9783F812b3Af3aBbf7de64c3cD7CC7D1af44',
		'tokenAddress': '0x94e131324b6054c0D789b190b2dAC504e4361b53',
		'poolAddress': '0x890f4e345b1daed0367a877a1612f86a1f86985f'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0xA74d4B67b3368E83797a35382AFB776bAAE4F5C8/logo-128.png',
		'symbol': 'yvCurve-alUSD',
		'name': 'Curve alUSD Pool yVault',
		'decimals': 18,
		'scope': 'usd',
		'displayName': 'crvALUSD',
		'address': '0xA74d4B67b3368E83797a35382AFB776bAAE4F5C8',
		'tokenAddress': '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
		'poolAddress': '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c'
	}
];

export const BTC_VAULTS = [
	{
		'displayName': 'crvPBTC',
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x3c5DF3077BcF800640B5DAE8c91106575a4826E6/logo-128.png',
		'symbol': 'yvCurve-pBTC',
		'name': 'Curve pBTC Pool yVault',
		'decimals': 18,
		'scope': 'btc',
		'address': '0x3c5DF3077BcF800640B5DAE8c91106575a4826E6',
		'tokenAddress': '0xDE5331AC4B3630f94853Ff322B66407e0D6331E8',
		'poolAddress': '0x7f55dde206dbad629c080068923b36fe9d6bdbef'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x8fA3A9ecd9EFb07A8CE90A6eb014CF3c0E3B32Ef/logo-128.png',
		'symbol': 'yvCurve-BBTC',
		'name': 'Curve BBTC Pool yVault',
		'displayName': 'crvBBTC',
		'decimals': 18,
		'scope': 'btc',
		'address': '0x8fA3A9ecd9EFb07A8CE90A6eb014CF3c0E3B32Ef',
		'tokenAddress': '0x410e3E86ef427e30B9235497143881f717d93c2A',
		'poolAddress': '0x071c661b4deefb59e2a3ddb20db036821eee8f4b'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0xe9Dc63083c464d6EDcCFf23444fF3CFc6886f6FB/logo-128.png',
		'symbol': 'yvCurve-oBTC',
		'name': 'Curve oBTC Pool yVault',
		'displayName': 'crvOBTC',
		'decimals': 18,
		'scope': 'btc',
		'address': '0xe9Dc63083c464d6EDcCFf23444fF3CFc6886f6FB',
		'tokenAddress': '0x2fE94ea3d5d4a175184081439753DE15AeF9d614',
		'poolAddress': '0xd81da8d904b52208541bade1bd6595d8a251f8dd'
	},
	{
		'icon': 'https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x23D3D0f1c697247d5e0a9efB37d8b0ED0C464f7f/logo-128.png',
		'symbol': 'yvCurve-tBTC',
		'name': 'Curve tBTC Pool yVault',
		'displayName': 'crvTBTC',
		'decimals': 18,
		'scope': 'btc',
		'address': '0x23D3D0f1c697247d5e0a9efB37d8b0ED0C464f7f',
		'tokenAddress': '0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd',
		'poolAddress': '0xC25099792E9349C7DD09759744ea681C7de2cb66'
	},
];


export async function	fetchCryptoPrice(from, to) {
	const	result = await performGet(
		`https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`
	);

	if (result) {
		return result;
	}
	return null;
}

export async function	fetchYearnVaults() {
	const	result = await performGet('https://api.yearn.finance/v1/chains/1/vaults/all');

	if (result) {
		return result;
	}
	return null;
}

