/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Saturday August 14th 2021
**	@Filename:				findPath.js
******************************************************************************/

const {ethers} = require('ethers');
const META_POOLS = require('./METAPOOL_LISTING.json');
const BASE_POOLS = require('./BASEPOOL_LISTING.json');
const allPools = {...META_POOLS, ...BASE_POOLS};
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

async function withBacktracking({from, fromList, visitedFrom, to, toList, path, i, max}) {
	if (path.length > 0) {
		const	first = path[0];
		const	last = path[path.length - 1];
		//TODO: CORRIGER FUNCTION D'ARRET
		const	lastIsValid = allPools[last[1]]?.coins?.[last[2]] === to || allPools[last[1]]?.lpToken === to;
		const	firstIsValid = (allPools[first[1]]?.coins || []).includes(from) || allPools[first[1]]?.lpToken === from;
		if (firstIsValid && lastIsValid) {
			return path;
		}
	}
	if (i > 0) {
		// console.log('-------- LOOP --------');
		// console.log(path);
	}

	const	intersection = getIntersection(toList, fromList);
	if (i > max) {
		return;
	}

	if (intersection.length > 0) {
		for (let index = 0; index < intersection.length; index++) {
			const inter = intersection[index];
			if (allPools[from]?.minter) {
				const	minterAddress = allPools[from].minter;
				const	minter = allPools[minterAddress];
				const	intersectionIndex = (minter.coins || []).indexOf(inter);
				if (intersectionIndex === -1) {
					continue;
				}
				if (path.find(([, addr]) => addr === minterAddress)) {
					continue;
				}
				const	result = await withBacktracking({
					from,
					fromList,
					visitedFrom,
					to,
					toList,
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
				const	intersectionIndex = (minter.coins || []).indexOf(inter);
				if (intersectionIndex === -1) {
					continue;
				}
				if (path.find(([, addr]) => addr === minterAddress)) {
					continue;
				}
				const	result = await withBacktracking({
					from,
					fromList,
					visitedFrom,
					to,
					toList,
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

	for (let fromListIndex = 0; fromListIndex < fromList.length; fromListIndex++) {
		const	currentFrom = fromList[fromListIndex];
		const	whereFromIs = allPoolsAsArray.filter(each => (each.coins || []).includes(currentFrom));
		const	whereFromIsLP = allPoolsAsArray.filter(each => each.lpToken === currentFrom);

		if (whereFromIsLP.length > 0) {
			for (let index = 0; index < whereFromIsLP.length; index++) {
				const	element = whereFromIsLP[index];
				for (let coinIndex = 0; coinIndex < element.coins.length; coinIndex++) {
					const	coinElement = element.coins[coinIndex];
					if (path.find(([, addr]) => addr === coinElement)) {
						continue;
					}

					const	result = await withBacktracking({
						from,
						fromList: [coinElement],
						visitedFrom,
						to,
						toList,
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

		if (whereFromIs.length > 0) {
			for (let index = 0; index < whereFromIs.length; index++) {
				const	element = whereFromIs[index];
				if (element.lpToken) {
					const	lpToken = allPoolsAsArray.find(e => e.lpToken === element.lpToken);
					const	lpTokenPool = lpToken.coins || [];
					const	lpTokenPoolIndex = lpTokenPool.indexOf(from);
					
					if (path.find(([, addr]) => addr === lpTokenPoolIndex)) {
						continue;
					}
					if (lpTokenPoolIndex > -1) {
						const	result = await withBacktracking({
							from,
							fromList: [element.lpToken],
							visitedFrom,
							to,
							toList,
							path: [...path, ['True', element.address, lpTokenPoolIndex]],
							i: i + 1,
							max,
						});
						if (result) {
							return result;
						}
					}
				}

				const	iterationKeys = element.coins;
				for (let coinIndex = 0; coinIndex < iterationKeys.length; coinIndex++) {
					const	iterationKey = iterationKeys[coinIndex];
					if (path.find(([, addr]) => addr === iterationKey)) {
						continue;
					}
					const	result = await withBacktracking({
						from,
						fromList: [iterationKey],
						visitedFrom,
						to,
						toList,
						path: [...path, ['True', element.address, coinIndex]],
						i: i + 1,
						max
					});
					if (result) {
						return result;
					}


				}
			}
		}
	}

	return false;

}

async function findPath({from, to}) {
	const	provider = new ethers.providers.AlchemyProvider(1, process.env.ALCHEMY_KEY);
	const	fromVaults = new ethers.Contract(from, ['function token() public view returns (address)'], provider);
	const	toVaults = new ethers.Contract(to, ['function token() public view returns (address)'], provider);
	const	fromToken = toAddress(await fromVaults.token());
	const	toToken = toAddress(await toVaults.token());

	const	fromAsLPToken = allPoolsAsArray.find(e => e.lpToken === fromToken);
	const	toAsLPToken = allPoolsAsArray.find(e => e.lpToken === toToken);
	const	fromList = [fromToken, ...fromAsLPToken?.coins || ''];
	const	toList = [toToken, ...toAsLPToken?.coins || ''];
	
	for (let max = 1; max < 3; max++) {
		const	result = await withBacktracking({from: fromToken, fromList, visitedFrom: [], to: toToken, toList, path: [], i: 0, max});
		if (result !== false) {
			console.log(result);
			break;
		}
	}
}

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
findPath({from: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9', to: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417'});

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
findPath({from: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417', to: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9'});

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
findPath({from: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417', to: '0x3D980E50508CFd41a13837A60149927a11c03731'});
