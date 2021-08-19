/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Saturday August 14th 2021
**	@Filename:				findPath.js
******************************************************************************/

const {ethers} = require('ethers');
// const META_POOLS = require('./METAPOOL_LISTING.json');
// const BASE_POOLS = require('./BASEPOOL_LISTING.json');
const LISTING = require('./LISTING.json');
const allPools = LISTING; //{...META_POOLS, ...BASE_POOLS};
const allPoolsAsArray = Object.values(allPools);

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
const toAddress = (address) => {
	if (!address) {
		return ADDRESS_ZERO;
	}
	if (address === 'GENESIS') {
		return ADDRESS_ZERO;
	}
	try {
		return ethers.utils.getAddress(address);	
	} catch (error) {
		return ADDRESS_ZERO;
	}
};
const getIntersection = (a, ...arr) => [...new Set(a)].filter(v => arr.every(b => b.includes(v)));

async function newWithBacktracking({from, to, path, i, max}) {
	const	SHOULDLOG = path.length >= 5 &&
	path[0][1] === '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c' &&
	path[1][1] === '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7' &&
	path[2][1] === '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5' &&
	path[3][1] === '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5' &&
	path[4][1] === '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714';

	const	SHOULDALMOSTLOG = path.length === 3 &&
	path[0][1] === '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c' &&
	path[1][1] === '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7' &&
	path[2][1] === '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5';

	if (SHOULDLOG) {
		// console.log('\n\n-------- LOOP --------');
		// console.log(`${from} => ${to}`, path);
	}

	if (path.length > 0) {
		if (from === to) {
			return path;
		}
	}

	const	currentFrom = from;
	const	whereFromIs = allPoolsAsArray.filter(each => (each.coins || []).includes(currentFrom));
	const	whereFromIsLP = allPoolsAsArray.filter(each => each.lpToken === currentFrom);
	const	currentFromCoins = allPools[currentFrom]?.coins || [];

	if (whereFromIsLP.length > 0) {
		for (let index = 0; index < whereFromIsLP.length; index++) {
			const	element = whereFromIsLP[index];
			for (let coinIndex = 0; coinIndex < element.coins.length; coinIndex++) {
				const	coinElement = element.coins[coinIndex];
				if (path.some(([isDeposit, addr]) => (isDeposit === 'False' && addr === element.address))) {
					continue;
				}
				const	result = await newWithBacktracking({
					from: coinElement,
					to,
					path: [...path, ['False', element.address, coinIndex]],
					i: i + 1,
					max
				});
				if (result) {
					return result;
				}	
			}
		}
	}


	const	intersection = getIntersection([to], [from]);
	if (i > max) {
		return;
	}

	if (intersection.length > 0) {
		for (let index = 0; index < intersection.length; index++) {
			const coin = intersection[index];
			if (allPools[from]?.minter) {
				const	minterAddress = allPools[from].minter;
				const	minter = allPools[minterAddress];
				const	intersectionIndex = (minter.coins || []).indexOf(coin);
				if (intersectionIndex === -1) {
					continue;
				}
				if (path.some(([isDeposit, addr]) => (isDeposit === 'False' && addr === minterAddress))) {
					continue;
				}
				const	result = await newWithBacktracking({
					from: coin,
					to,
					path: [...path, ['False', minterAddress, intersectionIndex]],
					i: i + 1,
					max,
				});
				if (result) {
					return result;
				}
			}
			if (allPools[to]?.minter) {
				const	minterAddress = allPools[to].minter;
				const	minter = allPools[minterAddress];
				const	intersectionIndex = (minter.coins || []).indexOf(coin);
				if (intersectionIndex === -1) {
					continue;
				}
				if (path.some(([isDeposit, addr]) => (isDeposit === 'True' && addr === minterAddress))) {
					continue;
				}
				const	result = await newWithBacktracking({
					from: coin,
					to,
					path: [...path, ['True', minterAddress, intersectionIndex]],
					i: i + 1,
					max,
				});
				if (result) {
					return result;
				}
			}
		}
	}

	if (whereFromIs.length > 0) {
		for (let index = 0; index < whereFromIs.length; index++) {
			const	element = whereFromIs[index];
			if (element.lpToken) {
				const	lpToken = allPoolsAsArray.find(e => e.lpToken === element.lpToken);
				const	lpTokenPool = lpToken.coins || [];
				const	lpTokenPoolIndex = lpTokenPool.indexOf(from);
				if (path.some(([isDeposit, addr]) => (isDeposit === 'True' && addr === element.address))) {
					continue;
				}
				if (lpTokenPoolIndex > -1) {
					const	result = await newWithBacktracking({
						from: element.lpToken,
						to,
						path: [...path, ['True', element.address, lpTokenPoolIndex]],
						i: i + 1,
						max,
					});
					if (result) {
						return result;
					}
				}
			}
		}
	}

	if (currentFromCoins.length > 0) {
		for (let index = 0; index < currentFromCoins.length; index++) {
			const	element = currentFromCoins[index];
			if (path.some(([isDeposit, addr]) => (isDeposit === 'False' && addr === element))) {
				continue;
			}

			const	result = await newWithBacktracking({
				from: element,
				to,
				path: [...path, ['False', currentFrom, index]],
				i: i + 1,
				max
			});
			if (result) {
				return result;
			}
		}
	}

	return false;

}

async function findPath({from, to}) {
	const	provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
	// const	provider = new ethers.providers.AlchemyProvider(1, process.env.ALCHEMY_KEY);
	const	fromVaults = new ethers.Contract(from, ['function token() public view returns (address)'], provider);
	const	toVaults = new ethers.Contract(to, ['function token() public view returns (address)'], provider);
	const	fromToken = toAddress(await fromVaults.token());
	const	toToken = toAddress(await toVaults.token());

	const	fromAsLPToken = allPoolsAsArray.find(e => e.lpToken === fromToken);
	const	fromList = [fromToken, ...fromAsLPToken?.coins || ''];
	
	let	returnValue = undefined;
	for (let max = 0; max < 6; max++) {
		const	result = await newWithBacktracking({
			from: fromToken,
			// fromList,
			// currentToken: fromToken,
			to: toToken,
			path: [],
			i: 0,
			max: max
		});
		if (result !== false) {
			// console.log('\n\n==================== RESULT ====================');
			// console.log(result);
			returnValue = result;
			break;
		}
	}
	return returnValue;
}

async function	findAllPath() {
	const	VAULT_ADDRESSES = [
		'0xA74d4B67b3368E83797a35382AFB776bAAE4F5C8',
		'0x8414Db07a7F743dEbaFb402070AB01a4E0d2E45e',
		'0x2a38B9B0201Ca39B17B460eD2f11e4929559071E',
		'0x5a770DbD3Ee6bAF2802D29a901Ef11501C44797A',
		'0x1C6a9783F812b3Af3aBbf7de64c3cD7CC7D1af44',
		'0xf2db9a7c0ACd427A680D640F02d90f6186E71725',
		'0x84E13785B5a27879921D6F685f041421C7F482dA',
		'0x132d8D2C76Db3812403431fAcB00F3453Fc42125',
		'0xdCD90C7f6324cfa40d7169ef80b12031770B4325',
		'0x986b4AFF588a109c09B50A03f42E4110E29D353F',
		'0x6Ede7F19df5df6EF23bD5B9CeDb651580Bdf56Ca',
		'0xBfedbcbe27171C418CDabC2477042554b1904857',
		'0x3B96d491f067912D18563d56858Ba7d6EC67a6fa',
		'0xC116dF49c02c5fD147DE25Baa105322ebF26Bd97',
		'0x4B5BfD52124784745c1071dcB244C6688d2533d3',
		'0x3c5DF3077BcF800640B5DAE8c91106575a4826E6',
		'0x054AF22E1519b020516D72D749221c24756385C9',
		'0xb4D1Be44BfF40ad6e506edf43156577a3f8672eC',
		'0x7047F90229a057C13BF847C0744D646CFb6c9E1A',
		'0xe9Dc63083c464d6EDcCFf23444fF3CFc6886f6FB',
		'0x39CAF13a104FF567f71fd2A4c68C026FDB6E740B',
		'0xf8768814b88281DE4F532a3beEfA5b85B69b9324',
		'0x30FCf7c6cDfC46eC237783D94Fc78553E79d4E9C',
		'0x625b7DF2fa8aBe21B0A976736CDa4775523aeD1E',
		'0x5fA5B62c8AF877CB37031e0a3B2f34A78e3C56A6',
		'0x3D27705c64213A5DcD9D26880c1BcFa72d5b6B0E',
		'0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139',
		'0x3D980E50508CFd41a13837A60149927a11c03731',
		'0xD6Ea40597Be05c201845c0bFd2e96A60bACde267',
		'0x80bbeE2fa460dA291e796B9045e93d19eF948C6A',
		'0x8fA3A9ecd9EFb07A8CE90A6eb014CF3c0E3B32Ef',
		'0x23D3D0f1c697247d5e0a9efB37d8b0ED0C464f7f',
		'0x8cc94ccd0f3841a468184aCA3Cc478D2148E1757',
		'0x8ee57c05741aA9DB947A744E713C15d4d19D8822',
		'0x27b7b1ad7288079A66d12350c828D3C00A6F07d7',
		'0xE537B5cc158EB71037D4125BDD7538421981E6AA',
		'0x25212Df29073FfFA7A67399AcEfC2dd75a831A1A',
		'0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417',
	];

	for (let vaultIndex = 0; vaultIndex < VAULT_ADDRESSES.length; vaultIndex++) {
		const element = VAULT_ADDRESSES[vaultIndex];
		for (let secondVaultIndex = 0; secondVaultIndex < VAULT_ADDRESSES.length; secondVaultIndex++) {
			const secondElement = VAULT_ADDRESSES[secondVaultIndex];
			if (element === secondElement) {
				continue;
			}
			const	result = await findPath({from: element, to: secondElement});
			if (result) {
				console.dir([element, secondElement, [...result]]);
			} else {
				// console.dir([element, secondElement, [[]]]);
			}
		}
		// return; 
	}
}

// findAllPath();


// on s'arrete avec le token qu'on doit deposer dans le truc final
// truc final 0x075b1bb99792c9e1041ba13afef80c91a1e70fb3
// "coins"
// 	"0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
// 	"0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
// 	"0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6"


// findPath({from: '0xA74d4B67b3368E83797a35382AFB776bAAE4F5C8', to: '0x8414Db07a7F743dEbaFb402070AB01a4E0d2E45e'});
// findPath({from: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417', to: '0x84E13785B5a27879921D6F685f041421C7F482dA'});
// findPath({from: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9', to: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417'});

// [
// 	[ 'True', '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c', 1 ],
// 	[ 'False', '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7', 2 ],
// 	[ 'True', '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5', 1 ],
// 	[ 'True', '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714', 0 ]
//   ]

// findPathAlt({from: '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9', to: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3'});
// 0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c
// 0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3

// "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9",
// "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490"

/******************************************************************************
**	META to 3CRV
**	[
** 		"0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417",
**		"0x84E13785B5a27879921D6F685f041421C7F482dA",
**		[
**			(False, "0x42d7025938bEc20B69cBae5A77421082407f053A", 1)
**		]
**	]
******************************************************************************/
findPath({from: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417', to: '0x84E13785B5a27879921D6F685f041421C7F482dA'});

/******************************************************************************
**	3CRV to META
**	[
** 		"0x84E13785B5a27879921D6F685f041421C7F482dA",
**		"0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417",
**		[
**			(True, "0x42d7025938bEc20B69cBae5A77421082407f053A", 1)
**		]
**	]
******************************************************************************/
findPath({from: '0x84E13785B5a27879921D6F685f041421C7F482dA', to: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417'});

/******************************************************************************
**	USDC vault to cuve vault
**	[
** 		"0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9",
**		"0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417",
**		[
**			(True, "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7", 1),
**			(True, "0x42d7025938bEc20B69cBae5A77421082407f053A", 1),
**		]
**	]
******************************************************************************/
// findPath({from: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9', to: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417'});

/******************************************************************************
**	cuve vault to USDC vault
**	[
** 		"0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417",
**		"0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9",
**		[
**			(False, "0x42d7025938bEc20B69cBae5A77421082407f053A", 1),
**			(False, "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7", 1),
**		]
**	]
******************************************************************************/
// findPath({from: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417', to: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9'});

/******************************************************************************
**	USDP crv to tricrv
**	[
** 		"0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417",
**		"0x3D980E50508CFd41a13837A60149927a11c03731",
**		[
**			(False, "0x42d7025938bEc20B69cBae5A77421082407f053A", 1),
**			(False, "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7", 2),
**			(True, "0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5", 0),
**		]
**	]
******************************************************************************/
// findPath({from: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417', to: '0x3D980E50508CFd41a13837A60149927a11c03731'});

// 0x7eb40e450b9655f4b3cc4259bcc731c63ff55ae6
// coins:
// "0x1456688345527bE1f37E9e627DA0837D6f08C925",
// "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490"