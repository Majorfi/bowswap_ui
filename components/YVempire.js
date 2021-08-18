/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Wednesday August 18th 2021
**	@Filename:				yVempire.js
******************************************************************************/

import	React, {useState, useEffect, useCallback}			from	'react';
import	Image												from	'next/image';
import	{ethers}											from	'ethers';
import	useWeb3												from	'contexts/useWeb3';
import	useAccount											from	'contexts/useAccount';
import	BlockStatus											from	'components/YVempireBlockStatus';
import	Success												from	'components/Icons/Success';
import	Error												from	'components/Icons/Error';
import	Pending												from	'components/Icons/Pending';
import	Arrow												from	'components/Icons/Arrow';
import	{fetchYearnVaults}									from	'utils/API';
import	{asyncForEach, formatAmount}						from	'utils';
import	{approveToken, migrateBachTokens}					from	'utils/actions';
import	AAVE_V1		from 'utils/AaveV1';
import	AAVE_V2		from 'utils/AaveV2';
import	COMPOUND	from 'utils/Compound';

const	PAIRS = [...COMPOUND, ...AAVE_V1, ...AAVE_V2];

function	ButtonMigrateAll({pairs, selectedTokens, approved, disabled, onCallback}) {
	const	{provider} = useWeb3();
	const	[transactionProcessing, set_transactionProcessing] = useState(false);

	async function	performMigration() {
		if (disabled || transactionProcessing || !approved) {
			return;
		}
		const	actualSelectedTokens = Object.entries(selectedTokens).filter(([, value]) => value === true).map(([key]) => key);
		const	selectedPairs = pairs.filter((p) => actualSelectedTokens.includes(p.aToken.address));
		const	batch = selectedPairs.map(p => [p.service, p.aToken.address]);
		set_transactionProcessing(false);
		onCallback('pending');
		try {
			migrateBachTokens({
				provider: provider,
				contractAddress: process.env.VYEMPIRE_SWAPPER,
				batch: batch
			}, ({error}) => {
				if (error) {
					set_transactionProcessing(false);
					return onCallback('error');
				}
				set_transactionProcessing(false);
				onCallback('success', actualSelectedTokens);
			});
		} catch (error) {
			set_transactionProcessing(false);
			return onCallback('error');
		}
	}

	return (
		<button
			onClick={performMigration}
			className={`w-full h-11 flex items-center justify-center space-x-2 px-6 py-3 text-ybase font-medium rounded-lg focus:outline-none overflow-hidden transition-colors border ${
				disabled || transactionProcessing || !approved ? 'text-ygray-400 bg-white border-ygray-400 cursor-not-allowed' :
					'bg-yblue border-yblue hover:bg-yblue-hover hover:border-yblue-hover text-white cursor-pointer'
			}`}>
			<span>{'Migrate selected'}</span>
		</button>
	);
}

function	ButtonApproveAll({pairs, selectedTokens, balancesOf, allowances, approved, disabled, onStep, onStepComplete, onCallback}) {
	const	{provider} = useWeb3();
	const	[transactionProcessing, set_transactionProcessing] = useState(false);

	async function	performApprove(event) {
		const	actualSelectedTokens = Object.entries(selectedTokens).filter(([, value]) => value === true).map(([key]) => key);
		const	selectedPairs = pairs.filter((p) => actualSelectedTokens.includes(p.aToken.address));
		let		isBroken = false;
		event.preventDefault();
		event.stopPropagation();
		if (disabled || transactionProcessing) {
			return;
		}
		set_transactionProcessing(true);
		onCallback('pending');
		await asyncForEach(selectedPairs, async (pair) => {
			if (isBroken) {
				return;
			}
			const	balanceOf = balancesOf[pair.aToken.address];
			const	allowance = allowances[pair.aToken.address];
			if (ethers.BigNumber.from(allowance).gte(balanceOf)) {
				//already approved
				return;
			}
			const	approval = balanceOf.add(balanceOf.mul(3).div(100)); //balance + 3% because of mutable aToken balance;
			try {
				onStep(`APPROVING ${pair.aToken.name}...`);
				await approveToken({
					provider: provider,
					contractAddress: pair.aToken.address,
					amount: approval,
					from: process.env.VYEMPIRE_SWAPPER
				}, ({error}) => {
					if (error) {
						isBroken = true;
						return;
					}
					onStepComplete(({[pair.aToken.address]: approval}));
				});	
			} catch (error) {
				isBroken = true;
				return;
			}
		});
		if (isBroken) {
			set_transactionProcessing(false);
			return onCallback('error');
		}
		set_transactionProcessing(false);
		onCallback('success');
	}

	if (approved) {
		return (
			<button
				className={'w-full h-11 flex items-center justify-center space-x-2 px-6 py-3 text-ybase font-medium rounded-lg focus:outline-none overflow-hidden transition-colors border bg-white border-yblue text-yblue cursor-not-allowed'}>
				<div className={'flex flex-row items-center justify-center'}>
					<span>{'Approved'}</span>
					<svg className={'ml-2'} width={'16'} height={'16'} viewBox={'0 0 16 16'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
						<path fillRule={'evenodd'} clipRule={'evenodd'} d={'M13.7602 3.48787C14.043 3.72358 14.0813 4.14396 13.8456 4.42681L7.17889 12.4268C6.96078 12.6885 6.58042 12.7437 6.29694 12.5547L2.29694 9.88805C1.99058 9.68382 1.9078 9.2699 2.11204 8.96355C2.31627 8.6572 2.73019 8.57442 3.03654 8.77865L6.53809 11.113L12.8213 3.57323C13.057 3.29038 13.4773 3.25216 13.7602 3.48787Z'} fill={'#00A3FF'}/>
					</svg>
				</div>
			</button>
		);
	}

	return (
		<button
			onClick={performApprove}
			className={`w-full h-11 flex items-center justify-center space-x-2 px-6 py-3 text-ybase font-medium rounded-lg focus:outline-none overflow-hidden transition-colors border ${
				!Object.values(selectedTokens).some(Boolean) || transactionProcessing ? 'text-ygray-400 bg-white border-ygray-400 cursor-not-allowed' :
					'bg-yblue border-yblue hover:bg-yblue-hover hover:border-yblue-hover text-white cursor-pointer'
			}`}>
			<span>{'Approve selected'}</span>
		</button>
	);
}


function	Row({pair, balanceOf, set_nonce, set_selectedTokens}) {
	const	[isChecked, set_isChecked] = useState(false);

	return (
		<tr className={'bg-white z-10 relative'}>
			<td>
				<div
					className={'w-full cursor-pointer'}
					onClick={() => {
						set_isChecked(!isChecked);
						set_nonce(n => n + 1);
						set_selectedTokens((s) => {
							s[pair.aToken.address] = !s[pair.aToken.address];
							return (s);
						});
					}}>
					<div className={'flex flex-row w-full items-center hover:bg-light-hover cursor-pointer rounded-lg pl-2 pr-6 py-2'}>
						<div className={'flex flex-row w-1/3 items-center'}>
							<input
								type={'checkbox'}
								className={'focus:ring-yblue text-yblue border-yblue border-2 rounded'}
								style={{width: 22, height: 22}}
								checked={isChecked}
								onChange={() => null} />

							<div className={'ml-4 w-9 h-9 rounded-full flex justify-center items-center relative'} style={{minWidth: 36}}>
								<Image
									src={pair.aToken.image}
									objectFit={'contain'}
									loading={'eager'}
									width={36}
									height={36} />
							</div>
							<div className={'pl-4 text-left overflow-ellipsis'}>
								<div className={'text-ybase font-medium whitespace-nowrap'}>{pair.aToken.name}</div>
								<div className={'text-ybase text-ygray-400 overflow-ellipsis mt-1'}>{`${Number(pair.aToken.apy).toFixed(2)}%`}</div>
							</div>
						</div>

						<div className={'w-2/3 flex items-center justify-end'}>
							<div className={'flex flex-row items-center mr-8'}>
								<p className={'text-ygray-400 text-ybase font-medium whitespace-nowrap mr-2'}>{`${formatAmount(ethers.utils.formatUnits(balanceOf || 0, pair.service === 0 ? 8 : pair.decimals), 4)}`}</p>
								<Arrow className={'w-8 h-8 text-ygray-400'} />
							</div>
							<div className={'flex flex-row justify-start items-center w-28'}>
								<div className={'w-9 h-9 rounded-full flex justify-center items-center relative'} style={{minWidth: 36}}>
									<Image
										src={pair.yvToken.image}
										objectFit={'contain'}
										loading={'eager'}
										width={36}
										height={36} />
								</div>
								<div className={'pl-4 text-left overflow-ellipsis'}>
									<div className={'text-ybase font-medium whitespace-nowrap'}>{pair.yvToken.name}</div>
									<div className={'text-ybase font-medium text-yblue overflow-ellipsis mt-1'}>{`${Number(pair.yvToken.apy).toFixed(2)}%`}</div>
								</div>
							</div>
						</div>
					</div>

				</div>
			</td>
		</tr>
	);

}

function	Head({from, to}) {
	return (
		<div className={`sticky top-0 z-20 ${to !== '' ? 'withAfterGradient' : ''}`}>
			<table className={'w-full table-fixed whitespace-normal'}>
				<colgroup>
					<col style={{width: 500}} />
				</colgroup>
				<thead className={`${to !== '' ? 'bg-white' : ''} z-20`}>
					<tr>
						<th className={'pb-0'}>
							<div className={'flex w-full justify-start items-center pb-2'}>
								<div className={'flex w-1/3 bg-white'}>
									<label className={'font-medium text-ybase text-ygray-900 pl-12'}>{from}</label>
								</div>
								<div className={'flex w-2/3 justify-end pr-6 z-50'}>
									<label className={'text-ybase font-medium text-ygray-900 w-28 text-left'}>{to}</label>
								</div>
							</div>
						</th>
					</tr>
				</thead>
			</table>
		</div>
	);
}

function	Body({elements, balancesOf, set_selectedTokens, set_nonce}) {
	return (
		<table className={'w-full table-fixed whitespace-normal mt-3'}>
			<colgroup>
				<col style={{width: 500}} />
			</colgroup>
			<thead>
				<tr>
					<td className={'text-left p-0 m-0 h-0'} />
				</tr>
			</thead>
			<tbody>
				{elements.map((pair) => (
					<Row
						key={`${pair.underlyingAddress}-${pair.aToken.address}-${pair.yvToken.address}`}
						pair={pair}
						balanceOf={balancesOf[pair.aToken.address]}
						set_selectedTokens={set_selectedTokens}
						set_nonce={set_nonce} />
				))}
			</tbody> 
		</table>
	);
}


function	YVempire() {
	const	{provider, address} = useWeb3();
	const	{balancesOf, allowances, set_balancesOf, set_allowances} = useAccount();
	const	[pairs, set_pairs] = useState(PAIRS);
	const	[, set_nonce] = useState(0);
	const	[selectedTokens, set_selectedTokens] = useState([]);

	const	[txApproveStatus, set_txApproveStatus] = useState({none: true, pending: false, success: false, error: false, step: ''});
	const	[txMigrateStatus, set_txMigrateStatus] = useState({none: true, pending: false, success: false, error: false});

	const	retrieveATokenBalances = useCallback(async (address) => {
		if (!provider) {
			return;
		}
		const	yearnVaults = await fetchYearnVaults();

		const	aLendingPoolContract = new ethers.Contract('0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', [{'inputs':[{'internalType':'address','name':'asset','type':'address'}],'name':'getReserveData','outputs':[{'components':[{'components':[{'internalType':'uint256','name':'data','type':'uint256'}],'internalType':'struct DataTypes.ReserveConfigurationMap','name':'configuration','type':'tuple'},{'internalType':'uint128','name':'liquidityIndex','type':'uint128'},{'internalType':'uint128','name':'variableBorrowIndex','type':'uint128'},{'internalType':'uint128','name':'currentLiquidityRate','type':'uint128'},{'internalType':'uint128','name':'currentVariableBorrowRate','type':'uint128'},{'internalType':'uint128','name':'currentStableBorrowRate','type':'uint128'},{'internalType':'uint40','name':'lastUpdateTimestamp','type':'uint40'},{'internalType':'address','name':'aTokenAddress','type':'address'},{'internalType':'address','name':'stableDebtTokenAddress','type':'address'},{'internalType':'address','name':'variableDebtTokenAddress','type':'address'},{'internalType':'address','name':'interestRateStrategyAddress','type':'address'},{'internalType':'uint8','name':'id','type':'uint8'}],'internalType':'struct DataTypes.ReserveData','name':'','type':'tuple'}],'stateMutability':'view','type':'function'}], provider);

		const	_pairs = pairs;
		await asyncForEach(_pairs, async (pair, index) => {
			const	fromTokenContract = new ethers.Contract(
				pair.aToken.address,
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
				_pairs[index].aToken.apy = supplyApy;
			} else {
				const	reserveData = await aLendingPoolContract.getReserveData(pair.underlyingAddress);
				_pairs[index].aToken.apy = ethers.utils.formatUnits(reserveData.currentLiquidityRate, 25);
			}
			set_pairs(p => {p[index] = _pairs[index]; return p;});
			set_nonce(n => n + 1);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider]);

	useEffect(() => {
		retrieveATokenBalances(address || '0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296');
	}, [address, retrieveATokenBalances]);

	async function resetATokenBalances(selectedTokensList) {
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

	const	elements = pairs.filter(p => !(balancesOf[p.aToken.address] || ethers.BigNumber.from(0)).isZero());
	const	compound = elements.filter(e => e.service === 0);
	const	aave = elements.filter(e => e.service === 1 || e.service === 2);
	return (
		<div className={'bg-white rounded-xl shadow-base px-4 pt-4 w-full relative'}>
			<div className={'relative withBeforeGradient'}>
				{elements.length > 0 ?
					<div className={'overflow-scroll relative vampireList pb-4'} style={{minHeight: 384, maxHeight: 384}}>
						{aave.length > 0 ?
							<>
								<Head from={'AAVE'} to={'Yearn'} />
								<Body 
									elements={aave}
									balancesOf={balancesOf}
									set_selectedTokens={set_selectedTokens}
									set_nonce={set_nonce} />
							</> : null}
						{compound.length > 0 ?
							<div className={'mt-6'}>
								<Head from={'Compound'} to={''} />
								<Body 
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
					<ButtonApproveAll
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
					<ButtonMigrateAll
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
									resetATokenBalances(selectedTokensList);
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
