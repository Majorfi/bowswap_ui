const {default: axios} = require('axios');
const ethers = require('ethers');

const	ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const	CURVE_REGISTRY = '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5';
const	CURVE_FACTORY_REGISTRY = '0xB9fC157394Af804a3578134A6585C0dc9cc990d4';
const	EXCLUDE_LIST = [
	'0x66b2e9B25F8ABa6B4A10350c785d63bAdE5A11E9',
	'0xa0D35fAead5299Bf18eFbB5dEfd1Ec6D4AB4Ef3B',
	'0x08Eaf78d40abFA6C341F05692eB48eDCA425Ce04',
	'0x5b78b93Fa851c357586915c7bA7258b762eB1ba0',
	'0x1F71f05CF491595652378Fe94B7820344A551B8E',
	'0x45a8CC73EC100306af64AB2CcB7B12E70EC549A8'
];
const	provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

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
	return {address: toAddress(lpToken), minter: toAddress(minter), canWithdraw: false};
}

async function computePool(registry, index) {
	const	pool = toAddress(await REGISTRY.pool_list(index));
	if (EXCLUDE_LIST.includes(pool)) {
		return registry;
	}

	const	lpToken = toAddress(await REGISTRY.get_lp_token(pool));
	registry[pool] = {address: toAddress(pool)};
	registry[lpToken] = await computeLpToken(lpToken);

	if (lpToken !== ethers.constants.AddressZero && lpToken !== pool) {
		const	coins = await REGISTRY.get_coins(pool);
		registry[pool].lpToken = toAddress(lpToken);
		registry[pool].coins = coins.filter(e => e !== ethers.constants.AddressZero).map(e => toAddress(e));
		registry[pool].canWithdraw = await checkWithdrawOneCoin(pool);
	} else {
		const	minter = await REGISTRY.get_pool_from_lp_token(pool);
		registry[pool].minter = toAddress(minter);
		registry[pool].canWithdraw = await checkWithdrawOneCoin(minter);
		const	coins = await REGISTRY.get_coins(minter);
		registry[minter] = {
			address: toAddress(minter),
			coins: coins.filter(e => e !== ethers.constants.AddressZero).map(e => toAddress(e)),
			lpToken: toAddress(pool)
		};
	}

	return registry;
}

async function computeFactoryPool(registry, index) {
	const	pool = toAddress(await FACTORY_REGISTRY.pool_list(index));
	if (EXCLUDE_LIST.includes(pool)) {
		return registry;
	}
	registry[pool] = {address: pool};

	const	coins = await FACTORY_REGISTRY.get_coins(pool);
	registry[pool].coins = coins.filter(e => e !== ethers.constants.AddressZero).map(e => toAddress(e));
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

