import	React, {useContext, createContext}	from	'react';
import	{ethers}							from	'ethers';
import	{Contract}							from	'ethcall';
import	axios								from	'axios';
import	useIndexDB							from	'hook/useIDB';
import	useWeb3								from	'contexts/useWeb3';
import	useYearn							from	'contexts/useYearn';
import	{computeTriCryptoPrice, toAddress, newEthCallProvider}				from	'utils';

const	MIXED_ABI = [
	{'constant': true, 'inputs': [], 'name': 'pricePerShare', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'},
	{'constant': true, 'inputs':[{'name':'lp','type':'address'}], 'name': 'get_virtual_price_from_lp_token', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'},
];

const	PricesContext = createContext();
export const PricesContextApp = ({children}) => {
	const	{chainID, getProvider} = useWeb3();
	const	{yearnData} = useYearn();
	const	[prices, set_prices] = useIndexDB('cgPrices', null);
	const	[virtualPrices, set_virtualPrices] = useIndexDB('virtualPrices', {});

	const fetchPrices = React.useCallback(async () => {
		const	CG_IDs = ['bitcoin', 'ethereum', 'aave', 'chainlink', 'tether-eurt'];
		const	[{data}, triCryptoPrice] = await Promise.all([
			axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${CG_IDs}&vs_currencies=usd`),
			computeTriCryptoPrice(getProvider('ethereum'))
		]);
		data['triCrypto'] = {usd: Number(triCryptoPrice)};
		set_prices(data);
	}, []);
	React.useEffect(() => fetchPrices(), [fetchPrices]);

	const	assignVirtualPrices = React.useCallback(async () => {
		if (yearnData && prices) {
			const	ethcallProvider = await newEthCallProvider(getProvider(chainID === 250 ? 'fantom' : 'ethereum'));
			const	multiCalls = [];
			for (let index = 0; index < yearnData.length; index++) {
				const	vault = yearnData[index];
				const	curveContract = new Contract(
					chainID === 250 ? process.env.CURVE_REGISTRY_FTM_ADDR : process.env.CURVE_REGISTRY_ADDR,
					MIXED_ABI
				);
				const	yearnVaultContract = new Contract(vault.address, MIXED_ABI);
				multiCalls.push(curveContract.get_virtual_price_from_lp_token(vault.token.address));
				multiCalls.push(yearnVaultContract.pricePerShare());
			}

			const _virtualPrices = {};
			const callResult = await ethcallProvider.tryAll(multiCalls);
			let	rIndex = 0;
			for (let index = 0; index < yearnData.length; index++) {
				const	vault = yearnData[index];
				const	virtualPrice = callResult[rIndex++];
				const	pricePerShare = callResult[rIndex++];
				const	scaledBalanceOf = ethers.BigNumber.from(ethers.constants.WeiPerEther)
					.mul(pricePerShare).div(ethers.BigNumber.from(10).pow(18))
					.mul(virtualPrice || 1).div(virtualPrice ? ethers.BigNumber.from(10).pow(18) : 1);

				let		price = 0;
				const	isEUR = (vault.display_name.toLowerCase()).includes('eur');
				const	isBTC = (vault.display_name.toLowerCase()).includes('btc');
				const	isETH = (vault.display_name.toLowerCase()).includes('eth');
				const	isAAVE = (vault.display_name.toLowerCase()).includes('aave');
				const	isLINK = (vault.display_name.toLowerCase()).includes('link');
				const	isTRI = ((vault.display_name.toLowerCase()).includes('tri') || (vault.display_name.toLowerCase()).includes('3crypto'));
				if (isBTC) {
					price = (prices.bitcoin.usd * ethers.utils.formatUnits(scaledBalanceOf, vault.decimals));
				} else if (isEUR) {
					price = ((prices?.['tether-eurt'].usd || 1) * ethers.utils.formatUnits(scaledBalanceOf, vault.decimals));
				} else if (isETH) {
					price = (prices.ethereum.usd * ethers.utils.formatUnits(scaledBalanceOf, vault.decimals));
				} else if (isAAVE) {
					price = (prices.aave.usd * ethers.utils.formatUnits(scaledBalanceOf, vault.decimals));
				} else if (isLINK) {
					price = (prices.chainlink.usd * ethers.utils.formatUnits(scaledBalanceOf, vault.decimals));
				} else if (isTRI) {
					price = (prices.triCrypto.usd * ethers.utils.formatUnits(scaledBalanceOf, vault.decimals));
				} else {
					price = (ethers.utils.formatUnits(scaledBalanceOf, vault.decimals));
				}
				_virtualPrices[toAddress(vault.address)] = Number(price);
			}
			set_virtualPrices(_virtualPrices);
		}
	}, [chainID, prices, yearnData]);
	React.useEffect(() => assignVirtualPrices(), [assignVirtualPrices]);

	return (
		<PricesContext.Provider value={{prices, virtualPrices}}>
			{children}
		</PricesContext.Provider>
	);
};

export const usePrices = () => useContext(PricesContext);
export default usePrices;
