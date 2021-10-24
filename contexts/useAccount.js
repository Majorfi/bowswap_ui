import	React, {useContext, useState, useEffect, createContext}	from	'react';
import	{Provider, Contract}				from	'ethcall';
import	useWeb3								from	'contexts/useWeb3';
import	{toAddress}							from	'utils';
import	AAVE_V1								from	'utils/AaveV1';
import	AAVE_V2								from	'utils/AaveV2';
import	COMPOUND							from	'utils/Compound';
import	BOWSWAP_CRV_EUR_VAULTS				from	'utils/BOWSWAP_CRV_EUR_VAULTS';
import	BOWSWAP_CRV_BTC_VAULTS				from	'utils/BOWSWAP_CRV_BTC_VAULTS';
import	BOWSWAP_CRV_USD_VAULTS				from	'utils/BOWSWAP_CRV_USD_VAULTS';
import	BOWSWAP_CRV_V2_VAULTS				from	'utils/BOWSWAP_CRV_V2_VAULTS';

const	ERC20ABI = [{'constant':true,'inputs':[],'name':'name','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_spender','type':'address'},{'name':'_value','type':'uint256'}],'name':'approve','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[],'name':'totalSupply','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_from','type':'address'},{'name':'_to','type':'address'},{'name':'_value','type':'uint256'}],'name':'transferFrom','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[],'name':'decimals','outputs':[{'name':'','type':'uint8'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':true,'inputs':[{'name':'_owner','type':'address'}],'name':'balanceOf','outputs':[{'name':'balance','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':true,'inputs':[],'name':'symbol','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_to','type':'address'},{'name':'_value','type':'uint256'}],'name':'transfer','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[{'name':'_owner','type':'address'},{'name':'_spender','type':'address'}],'name':'allowance','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'payable':true,'stateMutability':'payable','type':'fallback'},{'anonymous':false,'inputs':[{'indexed':true,'name':'owner','type':'address'},{'indexed':true,'name':'spender','type':'address'},{'indexed':false,'name':'value','type':'uint256'}],'name':'Approval','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'from','type':'address'},{'indexed':true,'name':'to','type':'address'},{'indexed':false,'name':'value','type':'uint256'}],'name':'Transfer','type':'event'}];

const AccountContext = createContext();

export const AccountContextApp = ({children}) => {
	const	{active, provider, wrongChain, getProvider, address} = useWeb3();
	const	[nonce, set_nonce] = useState(0);
	const	[yVempireNotificationCounter, set_yVempireNotificationCounter] = useState(0);
	const	[balancesOf, set_balancesOf] = useState({});
	const	[allowances, set_allowances] = useState({});

	async function	retrieveBowswapBalances() {
		const	crvVaults = [...BOWSWAP_CRV_USD_VAULTS, ...BOWSWAP_CRV_BTC_VAULTS, ...BOWSWAP_CRV_EUR_VAULTS, ...BOWSWAP_CRV_V2_VAULTS].map(e => e.address);
		const	crvVaultsNoDuplicates = [...new Set(crvVaults)];
		const	ethcallProvider = new Provider();
		const	{chainId} = await provider.getNetwork();
		if (chainId === 1337) {
			await ethcallProvider.init(getProvider('major'));
			ethcallProvider.multicallAddress = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';
		} else {
			await ethcallProvider.init(provider);
		}

		const	multiCalls = [];
		(crvVaultsNoDuplicates).forEach((vaultAddress) => {
			const	contract = new Contract(vaultAddress, ERC20ABI);
			multiCalls.push(contract.balanceOf(address));
			multiCalls.push(contract.allowance(address, process.env.METAPOOL_SWAPPER_ADDRESS));
		});
		const callResult = await ethcallProvider.all(multiCalls);

		let	index = 0;
		(crvVaultsNoDuplicates).forEach((vaultAddress) => {
			set_balancesOf((b) => {b[vaultAddress] = callResult[index]; return b;});
			set_allowances((b) => {b[vaultAddress] = callResult[index + 1]; return b;});			
			index += 2;
		});
		set_nonce(n => n + 1);
	}

	async function	retrieveYVempireBalances() {
		const	vaults = [...COMPOUND, ...AAVE_V1, ...AAVE_V2].map(e => e.uToken.address);
		const	vaultsNoDuplicates = [...new Set(vaults)];
		const	ethcallProvider = new Provider();
		const	{chainId} = await provider.getNetwork();
		if (chainId === 1337) {
			await ethcallProvider.init(getProvider('major'));
			ethcallProvider.multicallAddress = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';
		} else {
			await ethcallProvider.init(provider);
		}

		const	multiCalls = [];
		vaultsNoDuplicates.forEach((vaultAddress) => {
			const	vaulContract = new Contract(vaultAddress, ERC20ABI);
			multiCalls.push(vaulContract.balanceOf(address));
			multiCalls.push(vaulContract.allowance(address, toAddress(process.env.VYEMPIRE_SWAPPER)));
		});
		const callResult = await ethcallProvider.all(multiCalls);

		let	index = 0;
		let	_yVempireNotificationCounter = 0;
		(vaultsNoDuplicates).forEach((vaultAddress) => {
			if (!callResult[index].isZero()) {
				_yVempireNotificationCounter += 1;
			}
			set_balancesOf((b) => {b[vaultAddress] = callResult[index]; return b;});
			set_allowances((b) => {b[vaultAddress] = callResult[index + 1]; return b;});			
			index += 2;
		});
		set_yVempireNotificationCounter(_yVempireNotificationCounter);
		set_nonce(n => n + 1);
	}

	useEffect(() => {
		if (!active) {
			set_balancesOf({});
			set_allowances({});
			set_nonce(0);
		}
	}, [active]);

	useEffect(() => {
		if (!address) {
			set_balancesOf({});
			set_allowances({});
			set_nonce(0);
		}
	}, [address]);

	useEffect(() => {
		if (wrongChain) {
			set_balancesOf({});
			set_allowances({});
			set_nonce(0);
		}
	}, [wrongChain]);

	useEffect(() => {
		if (active && provider && address && !wrongChain) {
			retrieveBowswapBalances(),
			retrieveYVempireBalances();
			set_nonce(n => n + 1);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider, address, active, wrongChain]);

	async function	updateBalanceOf(addresses) {
		const	ethcallProvider = new Provider();
		const	{chainId} = await provider.getNetwork();
		if (chainId === 1337) {
			await ethcallProvider.init(getProvider('major'));
			ethcallProvider.multicallAddress = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';
		} else {
			await ethcallProvider.init(provider);
		}

		const	multiCalls = [];
		addresses.forEach((addr) => {
			const	vaulContract = new Contract(addr, ERC20ABI);
			multiCalls.push(vaulContract.balanceOf(address));
			multiCalls.push(vaulContract.allowance(address, toAddress(process.env.VYEMPIRE_SWAPPER)));
		});
		const callResult = await ethcallProvider.all(multiCalls);

		let	index = 0;
		(addresses).forEach((addr) => {
			set_balancesOf((b) => {b[addr] = callResult[index]; return b;});
			set_allowances((b) => {b[addr] = callResult[index + 1]; return b;});			
			index += 2;
		});
	}

	return (
		<AccountContext.Provider value={{
			balancesOf, 
			updateBalanceOf, 
			allowances, 
			set_balancesOf, 
			set_allowances, 
			balancesNonce: nonce,
			yVempireNotificationCounter,
			set_yVempireNotificationCounter
		}}>
			{children}
		</AccountContext.Provider>
	);
};

export const useAccount = () => useContext(AccountContext);
export default useAccount;
