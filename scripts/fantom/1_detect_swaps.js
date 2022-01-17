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
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const YEARN_API_ROUTE = 'https://api.yearn.finance/v1/chains/250/vaults/all';
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
	const	ethcallProvider = new Provider();
	await	ethcallProvider.init(provider);
	ethcallProvider.multicall = {address: '0xc04d660976c923ddba750341fe5923e47900cf24'};
	ethcallProvider.multicall2 = {address: '0x470ADB45f5a9ac3550bcFFaD9D990Bf7e2e941c9'};
	return	ethcallProvider;
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
				if (path.some(([isDeposit, addr]) => (isDeposit === 1 && addr === element.address))) {
					continue;
				}
				if (element.canWithdraw === false) {
					continue;
				}
				const	result = await newWithBacktracking({
					from: coinElement,
					to,
					path: [...path, [1, element.address, coinIndex, 0]],
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
				if (path.some(([isDeposit, addr]) => (isDeposit === 1 && addr === minterAddress))) {
					continue;
				}
				if (minter.canWithdraw === false) {
					continue;
				}
				const	result = await newWithBacktracking({
					from: coin,
					to,
					path: [...path, [1, minterAddress, intersectionIndex, 0]],
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
				if (path.some(([isDeposit, addr]) => (isDeposit === 0 && addr === minterAddress))) {
					continue;
				}
				const	result = await newWithBacktracking({
					from: coin,
					to,
					path: [...path, [0, minterAddress, intersectionIndex, 0]],
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
				if (path.some(([isDeposit, addr]) => (isDeposit === 0 && addr === element.address))) {
					continue;
				}
				if (lpTokenPoolIndex > -1) {
					const	result = await newWithBacktracking({
						from: element.lpToken,
						to,
						path: [...path, [0, element.address, lpTokenPoolIndex, 0]],
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

			if (path.some(([isDeposit, addr]) => (isDeposit === 1 && addr === element))) {
				continue;
			}

			if (allPools[currentFrom]?.canWithdraw === false) {
				continue;
			}

			const	result = await newWithBacktracking({
				from: element,
				to,
				path: [...path, [1, currentFrom, index, 0]],
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
	const	fromVaults = new ethers.Contract(from, ['function token() public view returns (address)'], provider);
	const	toVaults = new ethers.Contract(to, ['function token() public view returns (address)'], provider);
	const	fromToken = toAddress(await fromVaults.token());
	const	toToken = toAddress(await toVaults.token());
	
	let	returnValue = undefined;
	for (let max = 0; max < 7; max++) {
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
	const	allVaults = await axios.get(YEARN_API_ROUTE);
	const	validVaults = allVaults.data
		.filter(e => !e.migration || e.migration?.available === false);
	const	vaultsWithDepositLimit = [];
	const	calls = [];

	const	ethcallProvider = await multiCallProvider();
	for (let index = 0; index < validVaults.length; index++) {
		const	element = validVaults[index];
		const	contract = new Contract(element.address, vaultABI);
		calls.push(contract.depositLimit());
	}
	const callResult = await ethcallProvider.tryAll(calls);
	for (let index = 0; index < validVaults.length; index++) {
		const	element = validVaults[index];
		const	depositLimit = callResult[index].toString();
		if (depositLimit !== '0') {
			vaultsWithDepositLimit.push(element);
		}
	}

	const	results = [];
	for (let index = 0; index < vaultsWithDepositLimit.length; index++) {
		const	_element = vaultsWithDepositLimit[index];
		const	element = _element.address;
		for (let jindex = 0; jindex < vaultsWithDepositLimit.length; jindex++) {
			const _secondElement = vaultsWithDepositLimit[jindex];
			const	secondElement = _secondElement.address;
			if (element === secondElement) {
				continue;
			}
			const	result = await findPath({from: element, to: secondElement});
			if (result) {
				// console.log(`${_element.display_name} (${element}) to ${_secondElement.display_name} (${secondElement}) ✅`);
				results.push([element, secondElement, [...result]]);
			} else {
				// console.log(`${_element.display_name} (${element}) to ${_secondElement.display_name} (${secondElement}) ❌`);
			}
		}
	}	

	const toJSON = JSON.stringify(results, null, 2);
	console.log(toJSON);
}

findAllPath();
