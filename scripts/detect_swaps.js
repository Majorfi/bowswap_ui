/******************************************************************************
**	This script is used to find all the possible path from the LISTING.json
**	file
**	Usage: node scripts/findPath.js > _newListing.json
******************************************************************************/

const {default: axios} = require('axios');
const {ethers} = require('hardhat');
const {Provider, Contract} = require('ethcall');
const LISTING = require('./detected_listing');
const allPools = LISTING;
const allPoolsAsArray = Object.values(allPools);

const vaultABI = [{'stateMutability':'view','type':'function','name':'depositLimit','inputs':[],'outputs':[{'name':'','type':'uint256'}],'gas':4008}];

const toAddress = (address) => {
	if (!address) {
		return ethers.constants.AddressZero;
	}
	if (address === 'GENESIS') {
		return ethers.constants.AddressZero;
	}
	try {
		return ethers.utils.getAddress(address);	
	} catch (error) {
		return ethers.constants.AddressZero;
	}
};
const getIntersection = (a, ...arr) => [...new Set(a)].filter(v => arr.every(b => b.includes(v)));

async function	multiCallProvider() {
	const	provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
	const	ethcallProvider = new Provider();
	await	ethcallProvider.init(provider);
	return	ethcallProvider;
}

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
async function newWithBacktracking({from, to, path, i, max}) {
	if (path.length > 0) {
		if (from === to) {
			return path;
		}
	}
	if (i > max) {
		return false;
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
				if (
					coinElement === ethers.constants.AddressZero ||
					coinElement === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
				) {
					continue;
				}
				if (path.some(([isDeposit, addr]) => (isDeposit === 'False' && addr === element.address))) {
					continue;
				}
				if (element.canWithdraw === false) {
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
	if (intersection.length > 0) {
		for (let index = 0; index < intersection.length; index++) {
			const coin = intersection[index];
			if (
				coin === ethers.constants.AddressZero ||
				coin === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
			) {
				continue;
			}

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
				if (minter.canWithdraw === false) {
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
			if (
				element === ethers.constants.AddressZero ||
				element === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
			) {
				continue;
			}

			if (path.some(([isDeposit, addr]) => (isDeposit === 'False' && addr === element))) {
				continue;
			}

			if (allPools[currentFrom]?.canWithdraw === false) {
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
	const	fromVaults = new ethers.Contract(from, ['function token() public view returns (address)'], provider);
	const	toVaults = new ethers.Contract(to, ['function token() public view returns (address)'], provider);
	const	fromToken = toAddress(await fromVaults.token());
	const	toToken = toAddress(await toVaults.token());
	
	let	returnValue = undefined;
	for (let max = 0; max < 9; max++) {
		const	result = await newWithBacktracking({
			from: fromToken,
			to: toToken,
			path: [],
			i: 0,
			max: max
		});
		if (result !== false) {
			returnValue = result;
			break;
		}
	}
	return returnValue;
}

async function	findAllPath() {
	const	allVaults = await axios.get('https://api.yearn.finance/v1/chains/1/vaults/all');
	const	validVaults = allVaults.data.filter(e => e.type === 'v2').filter(e => !e.migration || e.migration?.available === false);
	const	vaultsWithDepositLimit = [];
	const	calls = [];

	const	ethcallProvider = await multiCallProvider();
	for (let index = 0; index < validVaults.length; index++) {
		const	element = validVaults[index];
		const	contract = new Contract(element.address, vaultABI);
		calls.push(contract.depositLimit());
	}
	const callResult = await ethcallProvider.all(calls);
	for (let index = 0; index < validVaults.length; index++) {
		const	element = validVaults[index];
		const	depositLimit = callResult[index].toString();
		if (depositLimit !== '0') {
			vaultsWithDepositLimit.push(element);
		}
	}

	const	results = [];
	await asyncForEach(vaultsWithDepositLimit, async (_element) => {
		const	element = _element.address;
		await asyncForEach(vaultsWithDepositLimit, async (_secondElement) => {
			const	secondElement = _secondElement.address;
			if (element === secondElement) {
				return;
			}
			const	result = await findPath({from: element, to: secondElement});
			if (result) {
				// console.log(`${_element.display_name} (${element}) to ${_secondElement.display_name} (${secondElement}) ✅`);
				results.push([element, secondElement, [...result]]);
			} else {
				// console.log(`${_element.display_name} (${element}) to ${_secondElement.display_name} (${secondElement}) ❌`);
			}
		});
	});
	const toJSON = JSON.stringify(results, null, 2).replaceAll('"False"', 'false').replaceAll('"True"', 'true');
	console.log(toJSON);
}

findAllPath();
