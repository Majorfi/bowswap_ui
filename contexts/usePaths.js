import	React, {useContext, createContext}	from	'react';
import	useWeb3								from	'contexts/useWeb3';
import	useYearn							from	'contexts/useYearn';
import	useBowswap							from	'contexts/useBowswap';
import	useLocalStorage						from	'hook/useLocalStorage';
import	useIndexDB							from	'hook/useIDB';
import	METAPOOL_SWAPS						from	'utils/swaps/ethereum/metapoolSwaps';
import	SWAPS								from	'utils/swaps/ethereum/swaps';
import	SWAPS_FANTOM						from	'utils/swaps/fantom/swaps';
import	{toAddress, isObjectEmpty}			from	'utils';
import	performBatchedUpdates				from	'utils/performBatchedUpdates';

function	findToVaultList(fromAddress, yearnData, metapoolSwapsList, swapsList, currentToVault = null) {
	const	_metapoolSwaps = metapoolSwapsList.filter(e => toAddress(e[0]) === toAddress(fromAddress)).map(e => e[1]);
	const	_swaps = swapsList.filter(e => toAddress(e[0]) === toAddress(fromAddress)).map(e => e[1]);

	if (_metapoolSwaps.length > 0) {
		const	_allToAddresses = [...(_metapoolSwaps || []), ...(_swaps || [])].map(e => toAddress(e));
		const	_allToVaults = yearnData.filter(e => _allToAddresses.includes(e.address));

		if (_allToVaults.find(e => toAddress(e.address).includes(toAddress(currentToVault.address)))) {
			return ({allTo: _allToVaults, toVault: currentToVault});
		}
		return ({allTo: _allToVaults, toVault: _allToVaults[0]});
	}
	if (_swaps.length > 0) {
		const	_allToAddresses = _swaps.map(e => toAddress(e));
		const	_allToVaults = yearnData.filter(e => _allToAddresses.includes(e.address));
		if (_allToVaults.find(e => toAddress(e.address).includes(toAddress(currentToVault.address)))) {
			return ({allTo: _allToVaults, toVault: currentToVault});
		}
		return ({allTo: _allToVaults, toVault: _allToVaults[0]});
	}
	return ({allTo: [], toVault: {}});
}

const	PathsContext = createContext();
export const PathsContextApp = ({children}) => {
	const	{disconnected, chainID} = useWeb3();
	const	{yearnData} = useYearn();
	const	{regeneration, balancesOf} = useBowswap();
	const	[allFromVaults, set_allFromVaults] = useIndexDB('allFromVaults', []);
	const	[allToVaults, set_allToVaults] = useIndexDB('allToVaults', []);
	const	[fromVault, set_fromVault] = useLocalStorage('fromVault', {});
	const	[toVault, set_toVault] = useLocalStorage('toVault', {});
	const	[path, set_path] = useLocalStorage('path', {});

	React.useEffect(() => {
		if (disconnected) {
			performBatchedUpdates(() => {
				set_fromVault({});
				set_toVault({});
				set_path({});
			});
		}
	}, [disconnected]);

	/* 🏹 - Bowswap Finance ************************************************************************
	**	On chain change, update the list of available paths.
	**********************************************************************************************/
	const	prepareFrom = React.useCallback(() => {
		if (!yearnData || isObjectEmpty(balancesOf)) {
			return;
		}
		if (chainID === 250) {
			performBatchedUpdates(() => {
				const	_allFromPaths = [...SWAPS_FANTOM.map(e => e[0])];
				const	_allFromAddresses = _allFromPaths.map(e => toAddress(e));
				const	_allFromVaults = yearnData.filter(e => _allFromAddresses.includes(e.address));
				const	_allFromVaultsWithBalance = _allFromVaults.filter(e => Number(balancesOf?.[toAddress(e.address)] || '0') > 0);
				const	_allSortedFromVaultWithBalance = _allFromVaultsWithBalance.sort((a, b) => Number(balancesOf?.[toAddress(b.address)] || '0') - Number(balancesOf?.[toAddress(a.address)] || '0'));

				set_allFromVaults(_allSortedFromVaultWithBalance);
				set_fromVault(_allSortedFromVaultWithBalance[0]);
			});
		} else {
			performBatchedUpdates(() => {
				const	_allFromPaths = [...new Set([...METAPOOL_SWAPS.map(e => e[0]), ...SWAPS.map(e => e[0])])];
				const	_allFromAddresses = _allFromPaths.map(e => toAddress(e));
				const	_allFromVaults = yearnData.filter(e => _allFromAddresses.includes(e.address));
				const	_allFromVaultsWithBalance = _allFromVaults.filter(e => Number(balancesOf?.[toAddress(e.address)] || '0') > 0);
				const	_allSortedFromVaultWithBalance = _allFromVaultsWithBalance.sort((a, b) => Number(balancesOf?.[toAddress(b.address)] || '0') - Number(balancesOf?.[toAddress(a.address)] || '0'));

				set_allFromVaults(_allSortedFromVaultWithBalance);
				set_fromVault(_allSortedFromVaultWithBalance[0]);
			});
		}
	}, [yearnData, chainID, balancesOf, regeneration]);
	React.useEffect(() => prepareFrom(), [prepareFrom]);

	/* 🏹 - Bowswap Finance ************************************************************************
	**	When fromVault changes, then we need to recompute the toVault list.
	**********************************************************************************************/
	React.useEffect(() => {
		if (!yearnData) {
			return;
		}
		if (chainID === 250) {
			performBatchedUpdates(() => {
				const	_allToPaths = [...SWAPS_FANTOM.map(e => e[1])];
				const	_allToAddresses = _allToPaths.map(e => toAddress(e));
				const	_allToVaults = yearnData.filter(e => _allToAddresses.includes(e.address));
				const	toVaultAssign = findToVaultList(toAddress(fromVault?.address), _allToVaults, [], SWAPS_FANTOM, toVault);
				set_toVault(toVaultAssign.toVault);
				set_allToVaults(toVaultAssign.allTo);
				if (toVault === toVaultAssign.toVault) {
					preparePath();
				}
			});
		} else {
			performBatchedUpdates(() => {
				const	_allToPaths = [...new Set([...METAPOOL_SWAPS.map(e => e[1]), ...SWAPS.map(e => e[1])])];
				const	_allToAddresses = _allToPaths.map(e => toAddress(e));
				const	_allToVaults = yearnData.filter(e => _allToAddresses.includes(e.address));
				const	toVaultAssign = findToVaultList(toAddress(fromVault?.address), _allToVaults, METAPOOL_SWAPS, SWAPS, toVault);
				set_toVault(toVaultAssign.toVault);
				set_allToVaults(toVaultAssign.allTo);
				if (toVault === toVaultAssign.toVault) {
					preparePath();
				}
			});
		}
	}, [chainID, fromVault, yearnData]);

	/* 🏹 - Bowswap Finance ************************************************************************
	**	When toVault changes, we need to retrieve the estimate out tokens amount.
	**********************************************************************************************/
	const	preparePath = React.useCallback(() => {
		if (!yearnData) {
			return;
		}
		if (chainID === 250) {
			performBatchedUpdates(() => {
				const	standardPath = SWAPS_FANTOM.find(e => toAddress(e[0]) === toAddress(fromVault?.address) && toAddress(e[1]) === toAddress(toVault?.address));
				set_path({type: 'standard', data: standardPath, fromDecimals: fromVault?.decimals || 18, toDecimals: toVault?.decimals || 18});
			});
		} else {
			performBatchedUpdates(() => {
				const	metapoolPath = METAPOOL_SWAPS.find(e => toAddress(e[0]) === toAddress(fromVault?.address) && toAddress(e[1]) === toAddress(toVault?.address));
				if (metapoolPath) {
					set_path({type: 'metapool', data: metapoolPath, fromDecimals: fromVault?.decimals || 18, toDecimals: toVault?.decimals || 18});
				} else {
					const	standardPath = SWAPS.find(e => toAddress(e[0]) === toAddress(fromVault?.address) && toAddress(e[1]) === toAddress(toVault?.address));
					set_path({type: 'standard', data: standardPath, fromDecimals: fromVault?.decimals || 18, toDecimals: toVault?.decimals || 18});
				}
			});
		}
	}, [chainID, toVault, yearnData]);
	React.useEffect(() => preparePath(), [preparePath]);

	return (
		<PathsContext.Provider value={{
			fromVault, set_fromVault,
			toVault, set_toVault,
			allFromVaults, allToVaults,
			currentPath: path
		}}>
			{children}
		</PathsContext.Provider>
	);
};

export const usePaths = () => useContext(PathsContext);
export default usePaths;
