import	React, {useContext, createContext}	from	'react';
import	{Contract}							from	'ethcall';
import	{ethers}							from	'ethers';
import	useWeb3								from	'contexts/useWeb3';
import	useYearn							from	'contexts/useYearn';
import	useIndexDB							from	'hook/useIDB';
import	{newEthCallProvider}				from	'utils';
import	performBatchedUpdates				from	'utils/performBatchedUpdates';

const	ERC20ABI = [
	{'constant':true,'inputs':[],'name':'name','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_spender','type':'address'},{'name':'_value','type':'uint256'}],'name':'approve','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[],'name':'totalSupply','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_from','type':'address'},{'name':'_to','type':'address'},{'name':'_value','type':'uint256'}],'name':'transferFrom','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[],'name':'decimals','outputs':[{'name':'','type':'uint8'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':true,'inputs':[{'name':'_owner','type':'address'}],'name':'balanceOf','outputs':[{'name':'balance','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':true,'inputs':[],'name':'symbol','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_to','type':'address'},{'name':'_value','type':'uint256'}],'name':'transfer','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[{'name':'_owner','type':'address'},{'name':'_spender','type':'address'}],'name':'allowance','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'payable':true,'stateMutability':'payable','type':'fallback'},{'anonymous':false,'inputs':[{'indexed':true,'name':'owner','type':'address'},{'indexed':true,'name':'spender','type':'address'},{'indexed':false,'name':'value','type':'uint256'}],'name':'Approval','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'from','type':'address'},{'indexed':true,'name':'to','type':'address'},{'indexed':false,'name':'value','type':'uint256'}],'name':'Transfer','type':'event'}
];

const	BowswapContext = createContext();
export const BowswapContextApp = ({children}) => {
	const	{active, provider, chainID, address, disconnected} = useWeb3();
	const	{yearnData} = useYearn();
	const	[nonce, set_nonce] = React.useState(0);
	const	[regeneration, set_regeneration] = React.useState(0);
	const	[vaultsBalancesOf, set_vaultsBalancesOf] = useIndexDB('vaultsBalances', {});
	const	[balancesOf, set_balancesOf] = useIndexDB('userBalances', {});
	const	[allowances, set_allowances] = useIndexDB('userAllowances', {});

	/* 🏹 - Bowswap Finance ************************************************************************
	**	On disconnect, clear balances and allowances.
	**********************************************************************************************/
	React.useEffect(() => {
		if (disconnected) {
			performBatchedUpdates(() => {
				set_balancesOf({});
				set_allowances({});
				set_nonce(0);
			});
		}
	}, [disconnected]);

	/* 🏹 - Bowswap Finance ************************************************************************
	**	For every Yearn Vault, we need to retrieve the balance of tokens in the user's wallet and 
	**	check the allowance for Bowswap contract.
	**********************************************************************************************/
	const retrieveBalances = React.useCallback(async (yVaults) => {
		if (active && address && provider && yVaults) {
			const	ethcallProvider = await newEthCallProvider(provider);
			const	crvVaults = yVaults.filter(e => e.type === 'v2').filter(e => !e.migration || e.migration?.available === false);
			const	multiCalls = [];

			for (let index = 0; index < crvVaults.length; index++) {
				const	vault = crvVaults[index];
				const	contract = new Contract(vault.address, ERC20ABI);
				multiCalls.push(contract.balanceOf(address));
				multiCalls.push(contract.allowance(address, chainID === 250 ? process.env.BOWSWAP_SWAPPER_FTM_ADDR : process.env.BOWSWAP_SWAPPER_ADDR));

				const	underlying = new Contract(vault?.token?.address, ERC20ABI);
				multiCalls.push(underlying.balanceOf(vault.address));
			}

			const	callResult = await ethcallProvider.tryAll(multiCalls);
			const	_balancesOf = {};
			const	_allowances = {};
			const	_balancesOfVault = {};
			performBatchedUpdates(() => {
				let	rIndex = 0;
				for (let index = 0; index < crvVaults.length; index++) {
					const	vault = crvVaults[index];
					_balancesOf[vault.address] = ethers.utils.formatUnits(callResult[rIndex++], vault?.decimals || 18);
					_allowances[vault.address] = ethers.utils.formatUnits(callResult[rIndex++], vault?.decimals || 18);
					_balancesOfVault[vault.address] = ethers.utils.formatUnits(callResult[rIndex++], vault?.decimals || 18);
				}
				set_balancesOf(_balancesOf);
				set_allowances(_allowances);
				set_vaultsBalancesOf(_balancesOfVault);
			});
		}
	}, [active, address, chainID, provider]);
	React.useEffect(() => retrieveBalances(yearnData), [retrieveBalances, yearnData]);

	/* 🏹 - Bowswap Finance ************************************************************************
	**	When a swap is performed, we need to update the balance and refetch the allowances. We
	**	need to do that for a bunch of vaults.
	**********************************************************************************************/
	async function	updateBalanceOf(vaults) {
		const	ethcallProvider = await newEthCallProvider(provider);
		const	multiCalls = [];
		vaults.forEach((vault) => {
			const	vaulContract = new Contract(vault.address, ERC20ABI);
			multiCalls.push(vaulContract.balanceOf(address));
			multiCalls.push(vaulContract.allowance(address, chainID === 250 ? process.env.BOWSWAP_SWAPPER_FTM_ADDR : process.env.BOWSWAP_SWAPPER_ADDR));
		});

		const	callResult = await ethcallProvider.tryAll(multiCalls);
		const	_balancesOf = balancesOf;
		const	_allowances = allowances;
		performBatchedUpdates(() => {
			let	rIndex = 0;
			for (let index = 0; index < vaults.length; index++) {
				const	vault = vaults[index];
				_balancesOf[vault.address] = ethers.utils.formatUnits(callResult[rIndex++], vault?.decimals || 18);
				_allowances[vault.address] = ethers.utils.formatUnits(callResult[rIndex++], vault?.decimals || 18);
			}
			set_balancesOf(_balancesOf);
			set_allowances(_allowances);
			set_regeneration(r => r + 1);
		});
	}

	async function	updateAllowancesOf(vaults) {
		const	ethcallProvider = await newEthCallProvider(provider);
		const	multiCalls = [];
		vaults.forEach((vault) => {
			const	vaulContract = new Contract(vault.address, ERC20ABI);
			multiCalls.push(vaulContract.allowance(address, chainID === 250 ? process.env.BOWSWAP_SWAPPER_FTM_ADDR : process.env.BOWSWAP_SWAPPER_ADDR));
		});

		const	callResult = await ethcallProvider.tryAll(multiCalls);
		const	_allowances = allowances;
		performBatchedUpdates(() => {
			let	rIndex = 0;
			for (let index = 0; index < vaults.length; index++) {
				const	vault = vaults[index];
				_allowances[vault.address] = ethers.utils.formatUnits(callResult[rIndex++], vault?.decimals || 18);
			}
			set_allowances(_allowances);
		});
	}

	return (
		<BowswapContext.Provider value={{
			balancesOf, allowances, vaultsBalancesOf,
			set_balancesOf, set_allowances, 
			updateBalanceOf,
			updateAllowancesOf,
			regeneration,
			balancesNonce: nonce,
		}}>
			{children}
		</BowswapContext.Provider>
	);
};

export const useBowswap = () => useContext(BowswapContext);
export default useBowswap;
