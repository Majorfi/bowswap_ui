import	{ethers}		from	'ethers';
import	{Provider}		from	'ethcall';

export const toAddress = (address) => {
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

export function truncateAddress(address) {
	if (address !== undefined) {
		return `${address.slice(0, 4)}...${address.slice(-4)}`;
	}
	return '0x000...0000';
}

export const isObjectEmpty = (obj) => !obj || JSON.stringify(obj) === '{}';

export function	formatAmount(amount, decimals = 2) {
	return (new Intl.NumberFormat('en-US', {minimumFractionDigits: 0, maximumFractionDigits: decimals}).format(amount));
}

export async function newEthCallProvider(provider) {
	const	ethcallProvider = new Provider();
	if (process.env.IS_TEST) {
		try {
			await	ethcallProvider.init(new ethers.providers.JsonRpcProvider('http://localhost:8545'));
			if (process.env.TESTED_NETWORK === 250) {
				ethcallProvider.multicall = {address: '0xc04d660976c923ddba750341fe5923e47900cf24'};
				ethcallProvider.multicall2 = {address: '0x470ADB45f5a9ac3550bcFFaD9D990Bf7e2e941c9'};
			} else {
				ethcallProvider.multicall = {address: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441'};
				ethcallProvider.multicall2 = {address: '0x5ba1e12693dc8f9c48aad8770482f4739beed696'};
			}
			return ethcallProvider;
		} catch (error) {
			console.warn('Could not connect to test provider, using mainnet provider');
			await	ethcallProvider.init(provider);
			return	ethcallProvider;
		}
	}
	await	ethcallProvider.init(provider);
	return	ethcallProvider;
}

export async function computeTriCryptoPrice(provider) {
	const	LP_TOKEN = '0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF';
	const	magicAddress = '0x83d95e0D5f402511dB06817Aff3f9eA88224B030';
	const	magicContract = new ethers.Contract(magicAddress, ['function getNormalizedValueUsdc(address, uint256) public view returns (uint256)'], provider);
	const	priceUSDC = await magicContract.getNormalizedValueUsdc(LP_TOKEN, '1000000000000000000');
	return	ethers.utils.formatUnits(priceUSDC, 6);
}

export function parseAmount(amount = '0') {
	let		_value = amount.replaceAll('..', '.').replaceAll(/[^0-9.]/g, '');
	const	[dec, frac] = _value.split('.');
	if (frac) _value = `${dec}.${frac.slice(0, 12)}`;

	if (_value === '.') {
		return ('0.');
	} else if (_value.length > 0 && _value[0] === '-') {
		return ('');
	} else if (_value.length >= 2 && _value[0] === '0' && _value[1] !== '.') {
		return (_value.slice(1) || '');
	} else {
		return (_value || '');
	}
}