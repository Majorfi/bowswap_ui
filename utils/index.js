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

export function	formatAmount(amount, decimals = 2) {
	return (new Intl.NumberFormat('en-US', {minimumFractionDigits: 0, maximumFractionDigits: decimals}).format(amount));
}

export async function newEthCallProvider(provider, chainID) {
	const	ethcallProvider = new Provider();
	if (chainID === 1337 || chainID === 31337) {
		await	ethcallProvider.init(new ethers.providers.JsonRpcProvider('http://localhost:8545'));
		ethcallProvider.multicall = {
			address: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
			block: 0
		};
		ethcallProvider.multicall2 = {
			address: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
			block: 0
		};
		return ethcallProvider;
	}
	await	ethcallProvider.init(provider);
	return	ethcallProvider;
}

let		triCryptoPrice = null;
export async function computeTriCryptoPrice(provider) {
	if (triCryptoPrice === null) {
		const	LP_TOKEN = '0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF';
		const	magicAddress = '0x83d95e0D5f402511dB06817Aff3f9eA88224B030';
		const	magicContract = new ethers.Contract(magicAddress, ['function getNormalizedValueUsdc(address, uint256) public view returns (uint256)'], provider);
		const	priceUSDC = await magicContract.getNormalizedValueUsdc(LP_TOKEN, '1000000000000000000');
		triCryptoPrice = ethers.utils.formatUnits(priceUSDC, 6);
		return	ethers.utils.formatUnits(priceUSDC, 6);
	} else {
		return (triCryptoPrice);
	}
}