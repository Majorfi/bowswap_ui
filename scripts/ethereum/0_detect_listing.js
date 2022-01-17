const {default: axios} = require('axios');
const ethers = require('ethers');

const	ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const	CURVE_REGISTRY = '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5';
const	CURVE_FACTORY_REGISTRY = '0xB9fC157394Af804a3578134A6585C0dc9cc990d4';
const	provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const	REGISTRY = new ethers.Contract(
	CURVE_REGISTRY,
	[
		'function pool_count() public view returns (uint256)',
		'function pool_list(uint256) public view returns (address)',
		'function get_lp_token(address) public view returns (address)',
		'function get_coins(address) public view returns (address[8])',
		'function get_pool_from_lp_token(address) public view returns (address)',
	],
	provider
);

const	FACTORY_REGISTRY = new ethers.Contract(
	CURVE_FACTORY_REGISTRY,
	[
		'function pool_count() public view returns (uint256)',
		'function pool_list(uint256) public view returns (address)',
		'function get_coins(address) public view returns (address[4])',
		'function get_pool_from_lp_token(address) public view returns (address)',
	],
	provider
);

async function checkWithdrawOneCoin(addr) {
	const	{result} = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${addr}&apikey=${ETHERSCAN_API_KEY}`).then(e => e.data);

	const	iface = new ethers.utils.Interface(result)?.format(ethers.utils.FormatTypes.minimal);
	const	hasRemoveLiquidityOneCoin = iface.some((method) => {
		return method.startsWith('function remove_liquidity_one_coin(');
	});

	if (!hasRemoveLiquidityOneCoin) {
		return false;
	}
	return true;
}

async function computeLpToken(lpToken) {
	const	minter = await REGISTRY.get_pool_from_lp_token(lpToken);
	return {address: lpToken, minter, canWithdraw: false};
}

async function computePool(registry, index) {
	const	pool = await REGISTRY.pool_list(index);
	const	lpToken = await REGISTRY.get_lp_token(pool);
	registry[pool] = {address: pool};
	registry[lpToken] = await computeLpToken(lpToken);

	if (lpToken !== ethers.constants.AddressZero && lpToken !== pool) {
		const	coins = await REGISTRY.get_coins(pool);
		registry[pool].lpToken = lpToken;
		registry[pool].coins = coins.filter(e => e !== ethers.constants.AddressZero);
		registry[pool].canWithdraw = await checkWithdrawOneCoin(pool);
	} else {
		const	minter = await REGISTRY.get_pool_from_lp_token(pool);
		registry[pool].minter = minter;
		registry[pool].canWithdraw = await checkWithdrawOneCoin(minter);
		const	coins = await REGISTRY.get_coins(minter);
		registry[minter] = {
			address: minter,
			coins: coins.filter(e => e !== ethers.constants.AddressZero),
			lpToken: pool
		};
	}

	return registry;
}

async function computeFactoryPool(registry, index) {
	const	pool = await FACTORY_REGISTRY.pool_list(index);
	registry[pool] = {address: pool};

	const	coins = await FACTORY_REGISTRY.get_coins(pool);
	registry[pool].coins = coins.filter(e => e !== ethers.constants.AddressZero);
	registry[pool].canWithdraw = await checkWithdrawOneCoin(pool);

	return registry;
}

async function detectPoolsFromCurve(withFactory) {
	let		registry = {};
	const	poolCount = await REGISTRY.pool_count();

	for (let i = 0; i < Number(poolCount); i++) {
		registry = await computePool(registry, i);
	}

	if (withFactory) {
		const	factoryPoolCount = await FACTORY_REGISTRY.pool_count();
		for (let i = 0; i < Number(factoryPoolCount); i++) {
			registry = await computeFactoryPool(registry, i);
		}
	}
	console.log(JSON.stringify(registry, null, 2));
}

detectPoolsFromCurve(true);

