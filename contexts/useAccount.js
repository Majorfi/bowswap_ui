import	React, {useContext, useState, useEffect, createContext}	from	'react';
import	{ethers}							from	'ethers';
import	{Provider, Contract}				from	'ethcall';
import	useWeb3								from	'contexts/useWeb3';
import	{toAddress}							from	'utils';
import	{fetchYearnVaults}					from	'utils/API';
import	AAVE_V1								from	'utils/AaveV1';
import	AAVE_V2								from	'utils/AaveV2';
import	COMPOUND							from	'utils/Compound';

const	LENDING_POOL_ADDRESS = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
const	ERC20ABI = [
	{'constant':true,'inputs':[],'name':'name','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_spender','type':'address'},{'name':'_value','type':'uint256'}],'name':'approve','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[],'name':'totalSupply','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_from','type':'address'},{'name':'_to','type':'address'},{'name':'_value','type':'uint256'}],'name':'transferFrom','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[],'name':'decimals','outputs':[{'name':'','type':'uint8'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':true,'inputs':[{'name':'_owner','type':'address'}],'name':'balanceOf','outputs':[{'name':'balance','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':true,'inputs':[],'name':'symbol','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_to','type':'address'},{'name':'_value','type':'uint256'}],'name':'transfer','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[{'name':'_owner','type':'address'},{'name':'_spender','type':'address'}],'name':'allowance','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'payable':true,'stateMutability':'payable','type':'fallback'},{'anonymous':false,'inputs':[{'indexed':true,'name':'owner','type':'address'},{'indexed':true,'name':'spender','type':'address'},{'indexed':false,'name':'value','type':'uint256'}],'name':'Approval','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'from','type':'address'},{'indexed':true,'name':'to','type':'address'},{'indexed':false,'name':'value','type':'uint256'}],'name':'Transfer','type':'event'}
];
const	LENDING_POOL_ABI = [
	{'inputs':[{'internalType':'address','name':'asset','type':'address'}],'name':'getReserveData','outputs':[{'components':[{'components':[{'internalType':'uint256','name':'data','type':'uint256'}],'internalType':'struct DataTypes.ReserveConfigurationMap','name':'configuration','type':'tuple'},{'internalType':'uint128','name':'liquidityIndex','type':'uint128'},{'internalType':'uint128','name':'variableBorrowIndex','type':'uint128'},{'internalType':'uint128','name':'currentLiquidityRate','type':'uint128'},{'internalType':'uint128','name':'currentVariableBorrowRate','type':'uint128'},{'internalType':'uint128','name':'currentStableBorrowRate','type':'uint128'},{'internalType':'uint40','name':'lastUpdateTimestamp','type':'uint40'},{'internalType':'address','name':'aTokenAddress','type':'address'},{'internalType':'address','name':'stableDebtTokenAddress','type':'address'},{'internalType':'address','name':'variableDebtTokenAddress','type':'address'},{'internalType':'address','name':'interestRateStrategyAddress','type':'address'},{'internalType':'uint8','name':'id','type':'uint8'}],'internalType':'struct DataTypes.ReserveData','name':'','type':'tuple'}],'stateMutability':'view','type':'function'}
];

const	PAIRS = [...COMPOUND, ...AAVE_V1, ...AAVE_V2];
const	AccountContext = createContext();
const	fetcher = (...args) => fetch(...args).then(res => res.json());


export async function newEthCallProvider(provider, chainID) {
	const	ethcallProvider = new Provider();
	console.warn(ethcallProvider);
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

export const AccountContextApp = ({children}) => {
	const	{active, provider, chainID, address} = useWeb3();
	const	[yVempireData, set_yVempireData] = useState(PAIRS);
	const	[nonce, set_nonce] = useState(0);
	const	[yVempireNotificationCounter, set_yVempireNotificationCounter] = useState([]);
	const	[yearnVaultData, set_yearnVaultData] = useState([]);
	const	[balancesOf, set_balancesOf] = useState({});
	const	[allowances, set_allowances] = useState({});

	// async function	newEthCallProvider(provider) {
	// 	const	ethcallProvider = new Provider();
	// 	const	{chainId} = await provider.getNetwork();
	// 	console.warn({chainId});
	// 	if (chainId === 1337 || chainId === 31337) {
	// 		await ethcallProvider.init(getProvider('major'));
	// 		ethcallProvider.multicallAddress = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';
	// 	} else {
	// 		await ethcallProvider.init(provider);
	// 	}
	// 	return ethcallProvider;
	// }

	async function	retrieveBalances(yVaults) {
		const	crvVaults = yVaults.filter(e => e.type === 'v2').filter(e => !e.migration || e.migration?.available === false).map(e => e.address);
		const	crvVaultsNoDuplicates = [...new Set(crvVaults)];
		const	ethcallProvider = await newEthCallProvider(provider, chainID);
		const	multiCalls = [];
		(crvVaultsNoDuplicates).forEach((vaultAddress) => {
			const	contract = new Contract(vaultAddress, ERC20ABI);
			multiCalls.push(contract.balanceOf(address));
			multiCalls.push(contract.allowance(address, process.env.BOWSWAP_SWAPPER_ADDR));
		});
		const callResult = await ethcallProvider.all(multiCalls);

		let	index = 0;
		(crvVaultsNoDuplicates).forEach((vaultAddress) => {
			set_balancesOf((b) => {b[vaultAddress] = callResult[index]; return b;});
			set_allowances((b) => {b[vaultAddress] = callResult[index + 1]; return b;});			
			index += 2;
		});
	}

	async function	retrieveYVempireBalances({_prices}) {
		const	LENDERS = [...COMPOUND, ...AAVE_V1, ...AAVE_V2];
		const	vaults = LENDERS.map(e => e.uToken.address);
		const	vaultsNoDuplicates = [...new Set(vaults)];
		const	ethcallProvider = await newEthCallProvider(provider, chainID);
		const	multiCalls = [];
		vaultsNoDuplicates.forEach((vaultAddress) => {
			const	vaulContract = new Contract(vaultAddress, ERC20ABI);
			multiCalls.push(vaulContract.balanceOf(address));
			multiCalls.push(vaulContract.allowance(address, toAddress(process.env.VYEMPIRE_SWAPPER_ADDR)));
		});
		const callResult = await ethcallProvider.all(multiCalls);
		let	index = 0;
		let	_yVempireNotificationCounter = {};
		(vaultsNoDuplicates).forEach((vaultAddress) => {
			if (!callResult[index].isZero()) {
				const	lender = LENDERS.find(e => e.uToken.address === vaultAddress);
				const	price = _prices[lender.cgID].usd;
				const	decimals = lender.decimals;
				const	value = ethers.utils.formatUnits(callResult[index], decimals) * price;
				if (Number(value) >= 100) {
					_yVempireNotificationCounter[vaultAddress] = value;
				}
			}
			set_balancesOf((b) => {b[vaultAddress] = callResult[index]; return b;});
			set_allowances((b) => {b[vaultAddress] = callResult[index + 1]; return b;});			
			index += 2;
		});

		set_yVempireNotificationCounter(_yVempireNotificationCounter);
	}

	async function retrieveUTokenBalances({_yVaultsData}) {
		const	aLendingPoolContract = new ethers.Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, provider);
		const	_yVempireData = yVempireData;

		for (let index = 0; index < _yVempireData.length; index++) {
			const	pair = _yVempireData[index];
			const	fromTokenContract = new ethers.Contract(pair.uToken.address, [
				'function supplyRatePerBlock() view returns (uint256)'
			], provider);
			const	currentYearnVault = _yVaultsData.find(yv => yv.address === pair.yvToken.address);
			_yVempireData[index].yvToken.apy = (currentYearnVault?.apy?.net_apy || 0) * 100;

			if (pair.service === 0) {
				const	supplyRatePerBlock = await fromTokenContract.supplyRatePerBlock();
				const	ethMantissa = 1e18;
				const	blocksPerDay = 6570;
				const	daysPerYear = 365;
				const	supplyApy = (((Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
				_yVempireData[index].uToken.apy = supplyApy;
			} else {
				const	reserveData = await aLendingPoolContract.getReserveData(pair.underlyingAddress);
				_yVempireData[index].uToken.apy = ethers.utils.formatUnits(reserveData.currentLiquidityRate, 25);
			}

			const	yearnAPY = Number((currentYearnVault?.apy?.net_apy || 0) * 100);
			const	uAPY = Number(_yVempireData[index].uToken.apy);
			if (uAPY > yearnAPY) {
				_yVempireData[index].uToken.isHidden = true;
			}
			set_yVempireData(p => {p[index] = _yVempireData[index]; return p;});
		}
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

	async function updateData() {
		const	LENDERS = [...COMPOUND, ...AAVE_V1, ...AAVE_V2];
		const	ids = [...new Set(LENDERS.map(e => e.cgID))];
		const	[_prices, _yVaultsData] = await Promise.all([
			fetcher(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`),
			fetchYearnVaults()
		]);
		set_yearnVaultData(_yVaultsData);
		retrieveBalances(_yVaultsData);
		// retrieveYVempireBalances({_prices});
		// retrieveUTokenBalances({_yVaultsData});
		set_nonce(n => n + 1);
	}

	useEffect(() => {
		if (active && provider && address) {
			updateData();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider, address, active]);

	async function	updateBalanceOf(addresses) {
		const	ethcallProvider = await newEthCallProvider(provider, chainID);
		const	multiCalls = [];
		addresses.forEach((addr) => {
			const	vaulContract = new Contract(addr, ERC20ABI);
			multiCalls.push(vaulContract.balanceOf(address));
			multiCalls.push(vaulContract.allowance(address, toAddress(process.env.VYEMPIRE_SWAPPER_ADDR)));
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
			set_yVempireNotificationCounter,
			yearnVaultData,
			yVempireData,
		}}>
			{children}
		</AccountContext.Provider>
	);
};

export const useAccount = () => useContext(AccountContext);
export default useAccount;
