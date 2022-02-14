import	React, {useContext, createContext}	from	'react';
import	{ethers}							from	'ethers';
import	{Contract}							from	'ethcall';
import	useWeb3								from	'contexts/useWeb3';
import	useYearn							from	'contexts/useYearn';
import	{toAddress, newEthCallProvider}		from	'utils';
import	AAVE_V1								from	'utils/yVempire/AaveV1';
import	AAVE_V2								from	'utils/yVempire/AaveV2';
import	COMPOUND							from	'utils/yVempire/Compound';
import	performBatchedUpdates				from	'utils/performBatchedUpdates';

const	LENDING_POOL_ADDRESS = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
const	ERC20ABI = [
	{'constant':true,'inputs':[],'name':'name','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_spender','type':'address'},{'name':'_value','type':'uint256'}],'name':'approve','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[],'name':'totalSupply','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_from','type':'address'},{'name':'_to','type':'address'},{'name':'_value','type':'uint256'}],'name':'transferFrom','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[],'name':'decimals','outputs':[{'name':'','type':'uint8'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':true,'inputs':[{'name':'_owner','type':'address'}],'name':'balanceOf','outputs':[{'name':'balance','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':true,'inputs':[],'name':'symbol','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},{'constant':false,'inputs':[{'name':'_to','type':'address'},{'name':'_value','type':'uint256'}],'name':'transfer','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function'},{'constant':true,'inputs':[{'name':'_owner','type':'address'},{'name':'_spender','type':'address'}],'name':'allowance','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function'},{'payable':true,'stateMutability':'payable','type':'fallback'},{'anonymous':false,'inputs':[{'indexed':true,'name':'owner','type':'address'},{'indexed':true,'name':'spender','type':'address'},{'indexed':false,'name':'value','type':'uint256'}],'name':'Approval','type':'event'},{'anonymous':false,'inputs':[{'indexed':true,'name':'from','type':'address'},{'indexed':true,'name':'to','type':'address'},{'indexed':false,'name':'value','type':'uint256'}],'name':'Transfer','type':'event'}
];
const	LENDING_POOL_ABI = [
	{'inputs':[{'internalType':'address','name':'asset','type':'address'}],'name':'getReserveData','outputs':[{'components':[{'components':[{'internalType':'uint256','name':'data','type':'uint256'}],'internalType':'struct DataTypes.ReserveConfigurationMap','name':'configuration','type':'tuple'},{'internalType':'uint128','name':'liquidityIndex','type':'uint128'},{'internalType':'uint128','name':'variableBorrowIndex','type':'uint128'},{'internalType':'uint128','name':'currentLiquidityRate','type':'uint128'},{'internalType':'uint128','name':'currentVariableBorrowRate','type':'uint128'},{'internalType':'uint128','name':'currentStableBorrowRate','type':'uint128'},{'internalType':'uint40','name':'lastUpdateTimestamp','type':'uint40'},{'internalType':'address','name':'aTokenAddress','type':'address'},{'internalType':'address','name':'stableDebtTokenAddress','type':'address'},{'internalType':'address','name':'variableDebtTokenAddress','type':'address'},{'internalType':'address','name':'interestRateStrategyAddress','type':'address'},{'internalType':'uint8','name':'id','type':'uint8'}],'internalType':'struct DataTypes.ReserveData','name':'','type':'tuple'}],'stateMutability':'view','type':'function'}
];

const	PAIRS = [...COMPOUND, ...AAVE_V1, ...AAVE_V2];
const	YVempireContext = createContext();
const	fetcher = (...args) => fetch(...args).then(res => res.json());

export const YVempireContextApp = ({children}) => {
	const	{active, provider, chainID, address, disconnected} = useWeb3();
	const	{yearnData} = useYearn();
	const	[yVempireData, set_yVempireData] = React.useState(PAIRS);
	const	[yVempireNotificationCounter, set_yVempireNotificationCounter] = React.useState([]);
	const	[balancesOf, set_balancesOf] = React.useState({});
	const	[allowances, set_allowances] = React.useState({});

	/* 🏹 - Bowswap Finance ************************************************************************
	**	On disconnect, clear balances and allowances.
	**********************************************************************************************/
	React.useEffect(() => {
		if (disconnected) {
			performBatchedUpdates(() => {
				set_balancesOf({});
				set_allowances({});
			});
		}
	}, [disconnected]);

	/* 🏹 - Bowswap Finance ************************************************************************
	**	When using yVempire, we need to retrieve the balances of the user's tokens in some other
	**	protocole to incentive to move to Yearn
	**********************************************************************************************/
	const retrieveYVempireBalances = React.useCallback(async ({_prices}) => {
		const	LENDERS = [...COMPOUND, ...AAVE_V1, ...AAVE_V2];
		const	vaults = LENDERS.map(e => e.uToken.address);
		const	vaultsNoDuplicates = [...new Set(vaults)];
		const	ethcallProvider = await newEthCallProvider(provider);
		const	multiCalls = [];
		vaultsNoDuplicates.forEach((vaultAddress) => {
			const	vaulContract = new Contract(vaultAddress, ERC20ABI);
			multiCalls.push(vaulContract.balanceOf(address));
			multiCalls.push(vaulContract.allowance(address, toAddress(process.env.VYEMPIRE_SWAPPER_ADDR)));
		});
		const callResult = await ethcallProvider.all(multiCalls);
		let	index = 0;
		let	_yVempireNotificationCounter = {};
		performBatchedUpdates(() => {
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
		});

		set_yVempireNotificationCounter(_yVempireNotificationCounter);
	}, [address, chainID, provider]);

	/* 🏹 - Bowswap Finance ************************************************************************
	**	When using yVempire, we need to retrieve the balances of the user's tokens in some other
	**	protocole to incentive to move to Yearn
	**********************************************************************************************/
	const retrieveUTokenBalances = React.useCallback(async () => {
		const	aLendingPoolContract = new ethers.Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, provider);
		const	_yVempireData = yVempireData;

		for (let index = 0; index < _yVempireData.length; index++) {
			const	pair = _yVempireData[index];
			const	fromTokenContract = new ethers.Contract(pair.uToken.address, [
				'function supplyRatePerBlock() view returns (uint256)'
			], provider);
			const	currentYearnVault = yearnData.find(yv => yv.address === pair.yvToken.address);
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
	}, [provider, yVempireData, yearnData]);

	const updateData = React.useCallback(async () => {
		if (active && provider && address) {
			const	LENDERS = [...COMPOUND, ...AAVE_V1, ...AAVE_V2];
			const	ids = [...new Set(LENDERS.map(e => e.cgID))];
			const	_prices = await fetcher(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
			retrieveYVempireBalances({_prices});
			retrieveUTokenBalances();
		}
	}, [active, address, provider, retrieveUTokenBalances, retrieveYVempireBalances]);
	React.useEffect(() => updateData(), [updateData]);

	return (
		<YVempireContext.Provider value={{
			balancesOf, 
			allowances, 
			set_balancesOf, 
			set_allowances, 
			yVempireNotificationCounter,
			set_yVempireNotificationCounter,
			yVempireData,
		}}>
			{children}
		</YVempireContext.Provider>
	);
};

export const useYVempire = () => useContext(YVempireContext);
export default useYVempire;
