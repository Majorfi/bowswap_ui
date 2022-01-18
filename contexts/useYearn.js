import	React, {useContext, createContext}	from	'react';
import	useWeb3								from	'contexts/useWeb3';
import	axios								from	'axios';
import	METAPOOL_SWAPS						from	'utils/swaps/ethereum/metapoolSwaps';
import	SWAPS								from	'utils/swaps/ethereum/swaps';
import	SWAPS_FANTOM						from	'utils/swaps/fantom/swaps';

const	YearnContext = createContext();

export const YearnContextApp = ({children}) => {
	const	{chainID} = useWeb3();
	const	[yearnData, set_yearnData] = React.useState(null);

	const getYearnVaults = React.useCallback(async () => {
		const	safeChain = chainID === 250 ? 250 : 1;
		const	{data} = await axios.get(`https://api.yearn.finance/v1/chains/${safeChain}/vaults/all`);
		if (safeChain === 250) {
			const	allFrom = SWAPS_FANTOM.map(e => e[0]);
			const	allTo = SWAPS_FANTOM.map(e => e[1]);
			setTimeout(() => {
				set_yearnData(data.map((e) => {
					e.icon = (
						e.icon
							.replace('multichain-tokens/1/', 'multichain-tokens/250/')
							.replace('/multichain-tokens/250/0xEF0210eB96c7EB36AF8ed1c20306462764935607/', '/multichain-tokens/1/0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e/') //USDC
							.replace('/multichain-tokens/250/0x0A0b23D9786963DE69CB2447dC125c49929419d8/', '/multichain-tokens/1/0x2DfB14E32e2F8156ec15a2c21c3A6c053af52Be8/') //MIM
					);
					return e;
				}).filter(e => allFrom.includes(e.address) || allTo.includes(e.address)));
			}, 1);
		} else {
			const	allFrom = [...new Set([...METAPOOL_SWAPS.map(e => e[0]), ...SWAPS.map(e => e[0])])];
			const	allTo = [...new Set([...METAPOOL_SWAPS.map(e => e[1]), ...SWAPS.map(e => e[1])])];
			setTimeout(() => {
				set_yearnData(data.filter(e => allFrom.includes(e.address) || allTo.includes(e.address)));
			}, 1);
		}
	}, [chainID]);
	React.useEffect(() => getYearnVaults(), [getYearnVaults]);

	return (
		<YearnContext.Provider value={{yearnData}}>
			{children}
		</YearnContext.Provider>
	);
};

export const useYearn = () => useContext(YearnContext);
export default useYearn;
