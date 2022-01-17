const {default: axios} = require('axios');
const ethers = require('ethers');

const	FTMSCAN_API_KEY = process.env.FTMSCAN_API_KEY;
const	CURVE_REGISTRY = '0x686d67265703d1f124c45e33d47d794c566889ba';
const	CURVE_FACTORY_REGISTRY = '0x4fb93D7d320E8A263F22f62C2059dFC2A8bCbC4c';
const	provider = new ethers.providers.JsonRpcProvider('https://rpc.ftm.tools/');
const	REGISTRY = new ethers.Contract(
	CURVE_REGISTRY,
	[
		'function pool_count() public view returns (uint256)',
		'function pool_list(uint256) public view returns (address)',
		'function get_lp_token(address) public view returns (address)',
		'function get_coins(address) public view returns (address[4])'
	],
	provider
);

const	FACTORY_REGISTRY = new ethers.Contract(
	CURVE_FACTORY_REGISTRY,
	[
		'function pool_count() public view returns (uint256)',
		'function pool_list(uint256) public view returns (address)',
		'function get_coins(address) public view returns (address[4])'
	],
	provider
);

const	BLACKLIST = ['0x64a4CDc2c96146f8588dfB16DD3660Eb6Ea4109B'];

async function checkWithdrawOneCoin(addr) {
	const	{result} = await axios.get(`https://api.ftmscan.com/api?module=contract&action=getabi&address=${addr}&apikey=${FTMSCAN_API_KEY}`).then(e => e.data);
	const	iface = new ethers.utils.Interface(result)?.format(ethers.utils.FormatTypes.minimal);
	const	hasRemoveLiquidityOneCoin = iface.some((method) => {
		return method.startsWith('function remove_liquidity_one_coin(');
	});

	if (!hasRemoveLiquidityOneCoin) {
		return false;
	}
	return true;
}

async function computePool(registry, index) {
	const	pool = await REGISTRY.pool_list(index);
	if (BLACKLIST.includes(pool)) {
		return registry;
	}
	const	lpToken = pool;
	registry[pool] = {address: pool};

	const	coins = await REGISTRY.get_coins(pool);
	registry[pool].lpToken = lpToken;
	registry[pool].coins = coins.filter(e => e !== ethers.constants.AddressZero);
	registry[pool].canWithdraw = await checkWithdrawOneCoin(pool);

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

