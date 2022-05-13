const {default: axios} = require('axios');
const ethers = require('ethers');

const	API_KEY = 'JXRIIVMTAN887F9D7NCTVQ7NMGNT1A4KA3';
const	provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const	REGISTRY = new ethers.Contract(
	'0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5',
	[
		'function pool_count() public view returns (uint256)',
		'function pool_list(uint256) public view returns (address)',
		'function get_pool_name(address) public view returns (string)',
		'function get_lp_token(address) public view returns (address)',
		'function get_coins(address) public view returns (address[8])',
		'function get_pool_from_lp_token(address) public view returns (address)',
	],
	provider
);

const	FACTORY_REGISTRY = new ethers.Contract(
	'0xB9fC157394Af804a3578134A6585C0dc9cc990d4',
	[
		'function pool_count() public view returns (uint256)',
		'function pool_list(uint256) public view returns (address)',
		'function get_pool_name(address) public view returns (string)',
		'function get_coins(address) public view returns (address[4])',
		'function get_pool_from_lp_token(address) public view returns (address)',
	],
	provider
);

const	FACTORY_ABI = [
	'function name() public view returns (string)',
	'function coins(uint256) public view returns (address)',
];

async function checkWithdrawOneCoin(addr) {
	const	{result} = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${addr}&apikey=${API_KEY}`).then(e => e.data);


	const	iface = new ethers.utils.Interface(result)?.format(ethers.utils.FormatTypes.minimal);
	const	hasRemoveLiquidityOneCoin = iface.some((method) => {
		return method.startsWith('function remove_liquidity_one_coin(');
	});

	if (!hasRemoveLiquidityOneCoin) {
		return false;
	}
	return true;
}

async function computeLpToken(lpToken, name) {
	const	minter = await REGISTRY.get_pool_from_lp_token(lpToken);
	return {address: lpToken, name, minter, canWithdraw: false};
}

async function computePool(registry, index) {
	const	pool = await REGISTRY.pool_list(index);
	const	name = await REGISTRY.get_pool_name(pool);
	const	lpToken = await REGISTRY.get_lp_token(pool);
	registry[pool] = {address: pool, name};
	registry[lpToken] = await computeLpToken(lpToken, name);

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
			name: name,
			coins: coins.filter(e => e !== ethers.constants.AddressZero),
			lpToken: pool
		};
	}

	return registry;
}

async function computeFactoryPool(registry, index) {
	const	pool = await FACTORY_REGISTRY.pool_list(index);
	const	contract = new ethers.Contract(pool, FACTORY_ABI, provider);
	const	name = await contract.name();

	registry[pool] = {address: pool, name};

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

