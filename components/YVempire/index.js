/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Wednesday August 18th 2021
**	@Filename:				yVempire.js
******************************************************************************/

import	React, {useState, useEffect, useCallback}			from	'react';
import	{ethers}											from	'ethers';
import	useWeb3												from	'contexts/useWeb3';
import	useAccount											from	'contexts/useAccount';
import	BlockStatus											from	'components/YVempire/BlockStatus';
import	ButtonMigrate										from	'components/YVempire/ButtonMigrate';
import	ButtonApprove										from	'components/YVempire/ButtonApprove';
import	TableHead											from	'components/YVempire/TableHead';
import	TableBody											from	'components/YVempire/TableBody';
import	Success												from	'components/Icons/Success';
import	Error												from	'components/Icons/Error';
import	Pending												from	'components/Icons/Pending';
import	{asyncForEach}										from	'utils';
import	AAVE_V1												from	'utils/AaveV1';
import	AAVE_V2												from	'utils/AaveV2';
import	COMPOUND											from	'utils/Compound';

const	PAIRS = [...COMPOUND, ...AAVE_V1, ...AAVE_V2];
const	LENDING_POOL_ADDRESS = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
const	LENDING_POOL_ABI = [
	{'inputs':[{'internalType':'address','name':'asset','type':'address'}],'name':'getReserveData','outputs':[{'components':[{'components':[{'internalType':'uint256','name':'data','type':'uint256'}],'internalType':'struct DataTypes.ReserveConfigurationMap','name':'configuration','type':'tuple'},{'internalType':'uint128','name':'liquidityIndex','type':'uint128'},{'internalType':'uint128','name':'variableBorrowIndex','type':'uint128'},{'internalType':'uint128','name':'currentLiquidityRate','type':'uint128'},{'internalType':'uint128','name':'currentVariableBorrowRate','type':'uint128'},{'internalType':'uint128','name':'currentStableBorrowRate','type':'uint128'},{'internalType':'uint40','name':'lastUpdateTimestamp','type':'uint40'},{'internalType':'address','name':'aTokenAddress','type':'address'},{'internalType':'address','name':'stableDebtTokenAddress','type':'address'},{'internalType':'address','name':'variableDebtTokenAddress','type':'address'},{'internalType':'address','name':'interestRateStrategyAddress','type':'address'},{'internalType':'uint8','name':'id','type':'uint8'}],'internalType':'struct DataTypes.ReserveData','name':'','type':'tuple'}],'stateMutability':'view','type':'function'}
];

function	YVempire({yearnVaultData}) {
	const	{active, provider, address} = useWeb3();
	const	{balancesOf, allowances, set_balancesOf, set_allowances} = useAccount();
	const	[pairs, set_pairs] = useState(PAIRS);
	const	[, set_nonce] = useState(0);
	const	[selectedTokens, set_selectedTokens] = useState([]);

	const	[txApproveStatus, set_txApproveStatus] = useState({none: true, pending: false, success: false, error: false, step: ''});
	const	[txMigrateStatus, set_txMigrateStatus] = useState({none: true, pending: false, success: false, error: false});

	/**************************************************************************
	**	Reset the state of this componant on address change
	**
	**	@TRIGGER : any time the address changes.
	**************************************************************************/
	useEffect(() => {
		set_selectedTokens([]);
		set_txApproveStatus({none: true, pending: false, success: false, error: false, step: ''});
		set_txMigrateStatus({none: true, pending: false, success: false, error: false});
		set_nonce(n => n + 1);
	}, [address]);

	const	retrieveUTokenBalances = useCallback(async (address) => {
		if (!active) {
			return;
		}
		if (!provider) {
			return;
		}
		const	yearnVaults = yearnVaultData;
		const	aLendingPoolContract = new ethers.Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, provider);
		const	_pairs = pairs;

		await asyncForEach(_pairs, async (pair, index) => {
			const	fromTokenContract = new ethers.Contract(
				pair.uToken.address,
				[
					'function balanceOf(address user) view returns (uint256)',
					'function supplyRatePerBlock() view returns (uint256)'
				],
				provider
			);
			const	balance = await fromTokenContract.balanceOf(address);
			if (balance.isZero()) {
				return;
			}
			const	currentYearnVault = yearnVaults.find(yv => yv.address === pair.yvToken.address);
			_pairs[index].yvToken.apy = (currentYearnVault?.apy?.net_apy || 0) * 100;

			if (pair.service === 0) {
				const	supplyRatePerBlock = await fromTokenContract.supplyRatePerBlock();

				const ethMantissa = 1e18;
				const blocksPerDay = 6570;
				const daysPerYear = 365;
				const supplyApy = (((Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
				_pairs[index].uToken.apy = supplyApy;
			} else {
				const	reserveData = await aLendingPoolContract.getReserveData(pair.underlyingAddress);
				_pairs[index].uToken.apy = ethers.utils.formatUnits(reserveData.currentLiquidityRate, 25);
			}
			set_pairs(p => {p[index] = _pairs[index]; return p;});
			set_nonce(n => n + 1);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider]);

	useEffect(() => {
		retrieveUTokenBalances(address);
	}, [address, retrieveUTokenBalances]);

	async function resetUTokenBalances(selectedTokensList) {
		const	migrated = {};
		selectedTokensList.forEach(each => migrated[each] = ethers.BigNumber.from(0));
		set_balancesOf(b => ({...b, ...migrated}));
		set_txApproveStatus({none: true, pending: false, success: false, error: false, step: ''});
		set_txMigrateStatus({none: true, pending: false, success: false, error: false});
		set_selectedTokens([]);
		set_nonce(n => n + 1);
	}

	function	renderMiddlePart() {
		const	getArgs = () => {
			if (txApproveStatus.pending)
				return {open: true, title: txApproveStatus.step || 'PENDING...', color: 'bg-pending', icon: <Pending width={24} height={24} className={'mr-4'} />};
			if (txMigrateStatus.pending)
				return {open: true, title: 'PENDING...', color: 'bg-pending', icon: <Pending width={24} height={24} className={'mr-4'} />};
			if (txApproveStatus.success && !txApproveStatus.hide)
				return {open: true, title: 'APPROVE COMPLETED', color: 'bg-success', icon: <Success width={24} height={24} className={'mr-4'} />};
			if (txMigrateStatus.success)
				return {open: true, title: 'MIGRATION COMPLETED', color: 'bg-success', icon: <Success width={24} height={24} className={'mr-4'} />};
			if (txMigrateStatus.error)
				return {open: true, title: 'MIGRATION FAILED', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
			if (txApproveStatus.error)
				return {open: true, title: 'APPROVE TRANSACTION FAILURE', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
			return {open: false, title: '', color: 'bg-yblue', icon: <div/>};
		};
		return (
			<BlockStatus {...getArgs()} />
		);
	}

	const	elements = pairs.filter(p => !(balancesOf[p.uToken.address] || ethers.BigNumber.from(0)).isZero());
	const	compound = elements.filter(e => e.service === 0);
	const	aave = elements.filter(e => e.service === 1 || e.service === 2);
	return (
		<div className={'bg-white rounded-xl shadow-base px-4 pt-4 w-full relative'}>
			<div className={'relative withBeforeGradient'}>
				{elements.length > 0 ?
					<div className={'overflow-scroll relative vampireList pb-4'} style={{minHeight: 384, maxHeight: 384}}>
						{aave.length > 0 ?
							<>
								<TableHead from={'AAVE'} to={'Yearn'} />
								<TableBody 
									elements={aave}
									balancesOf={balancesOf}
									set_selectedTokens={set_selectedTokens}
									set_nonce={set_nonce} />
							</> : null}
						{compound.length > 0 ?
							<div className={'mt-6'}>
								<TableHead from={'Compound'} to={''} />
								<TableBody 
									elements={compound}
									balancesOf={balancesOf}
									set_selectedTokens={set_selectedTokens}
									set_nonce={set_nonce} />
							</div> : null}
					</div>
					: (
						<div className={'h-64 py-12 bg-white w-full flex flex-col justify-center items-center'} style={{minHeight: 384, maxHeight: 384}}>
							<svg xmlns={'http://www.w3.org/2000/svg'} x={'0px'} y={'0px'} viewBox={'0 0 274.001 274.001'} xmlSpace={'preserve'} className={'w-64 h-64 text-gray-200'} ><g><path fill={'currentcolor'} d={'M150.905,175.061c-28.218,7.6-21.313-5.932-18.589-26.34l0,0 c-10.142,14.938-24.158,6.084-20.715-7.271c-5.529,10.365-16.657,21.303-28.558,13.391c-12.46-8.039-7.688-85-83.043-114.833 c11.459,7.41,32.063,33.354,2.302,60.66c36.499,1.346,22.635,36.253,13.426,38.675c22.66,2.598,33.872,14.784,27.071,44.2 c18.725-10.427,52.082-8.753,41.083,37.198c8.803-21.631,50.63-27.257,45.071,6.77c15.223-19.209,48.701-14.457,56.256,6.482 c-0.384-19.43,25.111-35.564,41.476-23.154c-1.149-20.68,24.084-39.162,47.316-37.398 C234.244,141.285,181.952,166.709,150.905,175.061z'}/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
							<p className={'text-gray-300 text-sm font-medium'}>{'Nothing to see here'}</p>
						</div>
					)}
				<div className={'absolute inset-0 z-50 pointer-events-none'}>
					{renderMiddlePart()}
				</div>
			</div>

			<div className={'w-full py-4 bg-white flex justify-center items-end'}>
				<div className={'flex flex-row justify-center w-full space-x-4'}>
					<ButtonApprove
						pairs={pairs}
						selectedTokens={selectedTokens}
						balancesOf={balancesOf}
						allowances={allowances}
						approved={txApproveStatus.success}
						onStepComplete={approval => set_allowances(b => ({...b, ...approval}))}
						onStep={step => set_txApproveStatus(status => ({...status, step}))}
						onCallback={(type) => {
							set_txApproveStatus({none: false, pending: type === 'pending', error: type === 'error', success: type === 'success'});
							if (type === 'error') {
								setTimeout(() => set_txApproveStatus((s) => s.error ? {none: true, pending: false, error: false, success: false} : s), 2500);
							}
							if (type === 'success') {
								setTimeout(() => set_txApproveStatus({none: false, pending: false, error: false, success: true, hide: true}), 2500);
							}
						}}
					/>
					<ButtonMigrate
						pairs={pairs}
						selectedTokens={selectedTokens}
						approved={txApproveStatus.success}
						onCallback={(type, selectedTokensList) => {
							set_txMigrateStatus({none: false, pending: type === 'pending', error: type === 'error', success: type === 'success'});
							if (type === 'error') {
								setTimeout(() => set_txMigrateStatus((s) => s.error ? {none: true, pending: false, error: false, success: false} : s), 2500);
							}
							if (type === 'success') {
								setTimeout(() => {
									set_txMigrateStatus({none: true, pending: false, error: false, success: false});
									resetUTokenBalances(selectedTokensList);
								}, 2500);
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default YVempire;
