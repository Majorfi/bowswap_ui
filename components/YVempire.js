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
import	BlockStatus											from	'components/BlockStatus';
import	Success												from	'components/Icons/Success';
import	Error												from	'components/Icons/Error';
import	Pending												from	'components/Icons/Pending';
import	Arrow												from	'components/Icons/Arrow';
import	{fetchYearnVaults}									from	'utils/API';
import	{asyncForEach, formatAmount}						from	'utils';
import	{approveToken, migrateTokens, migrateBachTokens}	from	'utils/actions';
import	AAVE_V1		from 'utils/AaveV1';
import	AAVE_V2		from 'utils/AaveV2';
import	COMPOUND	from 'utils/Compound';

const	PAIRS = [...COMPOUND, ...AAVE_V1, ...AAVE_V2];

function	ButtonApprove({tokenAddress, balanceOf, approved, disabled, onCallback}) {
	const	{provider} = useWeb3();
	const	[transactionProcessing, set_transactionProcessing] = useState(false);

	function	performApprove(event) {
		event.preventDefault();
		event.stopPropagation();
		if (disabled || transactionProcessing) {
			return;
		}
		set_transactionProcessing(true);
		onCallback('pending');
		try {
			approveToken({
				provider: provider,
				contractAddress: tokenAddress,
				amount: balanceOf.add(balanceOf.mul(3).div(100)), //balance + 3% because of mutable aToken balance
				from: process.env.VYEMPIRE_SWAPPER
			}, ({error}) => {
				if (error) {
					set_transactionProcessing(false);
					return onCallback('error');
				}
				set_transactionProcessing(false);
				onCallback('success');
			});	
		} catch (error) {
			set_transactionProcessing(false);
			onCallback('error');
		}
	}

	if (approved) {
		return (
			<button onClick={performApprove}>
				<div className={'rounded-lg w-8 h-8 flex justify-center items-center border transition-color border-blue-400 bg-white cursor-not-allowed'}>
					<svg aria-hidden={'true'} focusable={'false'} className={'w-4 h-4 text-blue-400'} role={'img'} xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 512 512'}><path fill={'currentColor'} d={'M480 128c0 8.188-3.125 16.38-9.375 22.62l-256 256C208.4 412.9 200.2 416 192 416s-16.38-3.125-22.62-9.375l-128-128C35.13 272.4 32 264.2 32 256c0-18.28 14.95-32 32-32c8.188 0 16.38 3.125 22.62 9.375L192 338.8l233.4-233.4C431.6 99.13 439.8 96 448 96C465.1 96 480 109.7 480 128z'}></path></svg>
				</div>
			</button>
		);
	}

	return (
		<button onClick={performApprove}>
			<div
				className={`rounded-lg bg-white w-8 h-8 flex justify-center items-center border transition-color ${
					disabled ? 'border-gray-400 bg-white cursor-not-allowed' :
						transactionProcessing ? 'border-pending bg-pending' : 'border-blue-400 bg-blue-400 hover:bg-blue-300'
				}`}>
				{
					transactionProcessing ?
						<Pending className={'w-4 h-4 text-white'}/>
						:
						<svg
							aria-hidden={'true'}					
							className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-white'}`} role={'img'} xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 512 512'}><path fill={'currentColor'} d={'M480 128c0 8.188-3.125 16.38-9.375 22.62l-256 256C208.4 412.9 200.2 416 192 416s-16.38-3.125-22.62-9.375l-128-128C35.13 272.4 32 264.2 32 256c0-18.28 14.95-32 32-32c8.188 0 16.38 3.125 22.62 9.375L192 338.8l233.4-233.4C431.6 99.13 439.8 96 448 96C465.1 96 480 109.7 480 128z'}></path></svg>
				}
			</div>
		</button>
	);
}

function	ButtonMigrate({tokenAddress, tokenService, approved, onCallback}) {
	const	{provider} = useWeb3();
	const	[transactionProcessing, set_transactionProcessing] = useState(false);

	function	performMigration() {
		if (transactionProcessing || !approved) {
			return;
		}
		set_transactionProcessing(false);
		onCallback('pending');
		try {
			migrateTokens({
				provider: provider,
				contractAddress: process.env.VYEMPIRE_SWAPPER,
				service: tokenService,
				coinAddress: tokenAddress,
			}, ({error}) => {
				if (error) {
					set_transactionProcessing(false);
					return onCallback('error');
				}
				set_transactionProcessing(false);
				onCallback('success');
			});
		} catch (error) {
			set_transactionProcessing(false);
			return onCallback('error');
		}
	}

	
	return (
		<button onClick={performMigration} className={`${transactionProcessing || !approved ? 'cursor-not-allowed' : ' cursor-pointer'}`}>
			<div className={`rounded-lg w-8 h-8 flex justify-center items-center border transition-color ${transactionProcessing || !approved ? 'bg-white border-ygray-400 cursor-not-allowed' : 'bg-blue-400 border-blue-400 hover:bg-blue-300 hover:border-blue-300 cursor-pointer'}`}>
				<svg aria-hidden={'true'} className={`w-4 h-4 ${transactionProcessing || !approved ? 'text-ygray-400' : 'text-white'}`} role={'img'} xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 512 512'}><path fill={'currentColor'} d={'M24 152h328.1l-.1318 80c0 9.547 5.666 18.19 14.41 22s18.95 2.078 25.93-4.406l112-104c10.22-9.5 10.22-25.69 0-35.19l-112-104c-6.979-6.484-17.18-8.221-25.93-4.408s-14.41 12.46-14.41 22L352.1 104H24C10.75 104 0 114.7 0 127.1S10.75 152 24 152zM488 360H159.9L160 279.1c0-9.547-5.666-18.19-14.41-22S126.7 255.9 119.7 262.4l-112 104c-10.22 9.5-10.22 25.69 0 35.19l112 104c6.979 6.484 17.18 8.219 25.93 4.406S160 497.5 160 488l-.1318-80H488c13.25 0 24-10.75 24-24S501.3 360 488 360z'}></path></svg>
			</div>
		</button>
	);
}

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
					'bg-blue-400 border-blue-400 hover:bg-blue-300 hover:border-blue-300 text-white cursor-pointer'
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
				className={'w-full h-11 flex items-center justify-center space-x-2 px-6 py-3 text-ybase font-medium rounded-lg focus:outline-none overflow-hidden transition-colors border bg-white border-blue-400 text-blue-400 cursor-not-allowed'}>
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
					'bg-blue-400 border-blue-400 hover:bg-blue-300 hover:border-blue-300 text-white cursor-pointer'
			}`}>
			<span>{'Approve selected'}</span>
		</button>
	);
}


function	Row({pair, balanceOf, allowance, retrieveATokenBalance, set_nonce, set_selectedTokens}) {
	const	[isChecked, set_isChecked] = useState(false);
	const	[txApproveStatus, set_txApproveStatus] = useState({none: true, pending: false, success: false, error: false});
	const	[txMigrateStatus, set_txMigrateStatus] = useState({none: true, pending: false, success: false, error: false});

	function	renderMiddlePart() {
		const	getArgs = () => {
			if (txApproveStatus.pending || txMigrateStatus.pending)
				return {open: true, title: 'PENDING...', color: 'bg-pending', icon: <Pending width={24} height={24} className={'mr-4'} />};
			if (txApproveStatus.success && !txApproveStatus.hide)
				return {open: true, title: 'APPROVE COMPLETED', color: 'bg-success', icon: <Success width={24} height={24} className={'mr-4'} />};
			if (txMigrateStatus.success)
				return {open: true, title: 'MIGRATION COMPLETED', color: 'bg-success', icon: <Success width={24} height={24} className={'mr-4'} />};
			if (txMigrateStatus.error)
				return {open: true, title: 'MIGRATION FAILED', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
			if (txApproveStatus.error)
				return {open: true, title: 'APPROVE TRANSACTION FAILURE', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
			return {open: false, title: '', color: 'bg-blue-400', icon: <div/>};
		};
		return (
			<BlockStatus {...getArgs()} />
		);
	}

	return (
		<tr className={'bg-white z-10 hover:bg-gray-50 cursor-pointer relative'}>
			<td
				className={'cursor-pointer'}
				onClick={() => {
					set_isChecked(!isChecked);
					set_nonce(n => n + 1);
					set_selectedTokens((s) => {
						s[pair.aToken.address] = !s[pair.aToken.address];
						return (s);
					});
				}}>
				<div className={'px-6 py-4 flex flex-row w-full items-center'}>
					<div className={'flex flex-row w-1/3 items-center'}>
						<input
							type={'checkbox'}
							className={'focus:ring-blue-400 h-4 w-4 text-blue-400 border-gray-300 rounded'}
							checked={isChecked}
							onChange={() => null} />

						<div className={'ml-4 w-14 h-14 rounded-full flex justify-center items-center relative'} style={{minWidth: 56}}>
							<Image
								src={pair.image}
								objectFit={'contain'}
								loading={'eager'}
								width={48}
								height={48} />
							<div className={'absolute top-0 right-0'}>
								<Image
									src={pair.service === 0 ? '/tokens/0xc00e94cb662c3520282e6f5717214004a7f26888.svg' : '/tokens/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.svg'}
									objectFit={'contain'}
									loading={'eager'}
									width={20}
									height={20} />
							</div>
						</div>
						<div className={'pl-4 text-left overflow-ellipsis'}>
							<div className={'text-lg font-medium whitespace-nowrap'}>{pair.aToken.name}</div>
							<div className={'text-sm font-medium text-gray-400 overflow-ellipsis'}>{`${Number(pair.aToken.apy).toFixed(2)}%`}</div>
						</div>
					</div>

					<div className={'w-1/3 flex items-start'}>
						<div className={'w-1/2 flex flex-col justify-center items-center'}>
							<Arrow className={'w-8 h-8 transform -rotate-90 text-gray-300'} />
							<p className={'text-gray-400 text-xs whitespace-nowrap mt-2'}>{`${formatAmount(ethers.utils.formatUnits(balanceOf || 0, pair.service === 0 ? 8 : pair.decimals), 4)} ${pair.aToken.name}`}</p>
						</div>
					</div>

					<div className={'flex flex-row w-1/3 items-center'}>
						<div className={'w-14 h-14 rounded-full flex justify-center items-center relative'} style={{minWidth: 56}}>
							<Image
								src={pair.image}
								objectFit={'contain'}
								loading={'eager'}
								width={48}
								height={48} />
							<div className={'absolute top-0 right-0'}>
								<Image
									src={'/tokens/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e.svg'}
									objectFit={'contain'}
									loading={'eager'}
									width={20}
									height={20} />
							</div>
						</div>
						<div className={'pl-4 text-left overflow-ellipsis'}>
							<div className={'text-lg font-medium whitespace-nowrap'}>{pair.yvToken.name}</div>
							<div className={'text-sm font-medium text-gray-400 overflow-ellipsis'}>{`${Number(pair.yvToken.apy).toFixed(2)}%`}</div>
						</div>
					</div>

				</div>
			</td>

			<td className={'text-left'}>
				<div className={'px-6 py-4 flex flex-row w-full justify-end space-x-2'}>
					<ButtonApprove
						tokenAddress={pair.aToken.address}
						approved={txApproveStatus.success || ethers.BigNumber.from(allowance).gte(balanceOf)}
						balanceOf={balanceOf}
						disabled={false}
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
						tokenAddress={pair.aToken.address}
						tokenService={pair.service}
						approved={txApproveStatus.success || ethers.BigNumber.from(allowance).gte(balanceOf)}
						onCallback={(type) => {
							set_txMigrateStatus({none: false, pending: type === 'pending', error: type === 'error', success: type === 'success'});
							if (type === 'error') {
								setTimeout(() => set_txMigrateStatus((s) => s.error ? {none: true, pending: false, error: false, success: false} : s), 2500);
							}
							if (type === 'success') {
								setTimeout(() => {
									set_txMigrateStatus({none: true, pending: false, error: false, success: false});
									retrieveATokenBalance(pair.aToken.address);
								}, 2500);
							}
						}}
					/>
				</div>
				{renderMiddlePart()}
			</td>
		</tr>
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

	async function retrieveATokenBalance(aTokenAddress) {
		const	aTokenContract = new ethers.Contract(aTokenAddress, ['function balanceOf(address) view returns (uint256)'], provider);
		const	balance = await aTokenContract.balanceOf(address);

		set_balancesOf(b => ({...b, [aTokenAddress]: balance}));
		set_nonce(n => n + 1);
	}
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
			return {open: false, title: '', color: 'bg-blue-400', icon: <div/>};
		};
		return (
			<BlockStatus {...getArgs()} />
		);
	}

	const	elements = pairs.filter(p => !(balancesOf[p.aToken.address] || ethers.BigNumber.from(0)).isZero());
	return (
		<div className={'max-w-full whitespace-nowrap rounded-xl overflow-hidden shadow-base'}>
			<div className={'overflow-hidden'}>
				<table className={'w-full table-fixed whitespace-normal'}>
					<colgroup>
						<col style={{width: 500}} />
						<col style={{width: 100}} />
					</colgroup>
					<thead className={'bg-white z-20'}>
						<tr>
							<th className={'p-6 bg-white headingShadow border-b'}>
								<div className={'flex w-full justify-start items-center'}>
									<div className={'flex w-1/3'}>
										<h5 className={'text-base font-semibold text-gray-800 pl-10'}>{'AAVE'}</h5>
									</div>
									<div className={'flex w-1/3'} />
									<div className={'flex w-1/3'}>
										<h5 className={'text-base font-semibold text-gray-800'}>{'Yearn'}</h5>
									</div>
								</div>
							</th>
							<th className={'p-6 bg-white headingShadow border-b'}>
								<div className={'flex justify-end'}>
									<div>
										<h5 className={'text-base font-semibold text-gray-800'}>{'Actions'}</h5>
									</div>
								</div>
							</th>
						</tr>
					</thead>
				</table>
			</div>
			<div className={'overflow-auto relative'}>
				{elements.length > 0 ?
					<table className={'w-full table-fixed whitespace-normal'}>
						<colgroup>
							<col style={{width: 500}} />
							<col style={{width: 100}} />
						</colgroup>
						<thead>
							<tr>
								<td className={'text-left p-0 m-0 h-0'} />
								<td className={'text-left p-0 m-0 h-0'} />
							</tr>
						</thead>
						<tbody>
							{elements.map((pair) => (
								<Row
									key={`${pair.underlyingAddress}-${pair.aToken.address}-${pair.yvToken.address}`}
									pair={pair}
									balanceOf={balancesOf[pair.aToken.address]}
									allowance={allowances[pair.aToken.address]}
									selectedTokens={selectedTokens}
									set_selectedTokens={set_selectedTokens}
									set_nonce={set_nonce}
									retrieveATokenBalance={retrieveATokenBalance} />
							))}
						</tbody> 
					</table>

					: (
						<div className={'h-64 py-12 bg-white w-full flex flex-col justify-center items-center'}>
							<svg xmlns={'http://www.w3.org/2000/svg'} x={'0px'} y={'0px'} viewBox={'0 0 274.001 274.001'} xmlSpace={'preserve'} className={'w-64 h-64 text-gray-200'} ><g><path fill={'currentcolor'} d={'M150.905,175.061c-28.218,7.6-21.313-5.932-18.589-26.34l0,0 c-10.142,14.938-24.158,6.084-20.715-7.271c-5.529,10.365-16.657,21.303-28.558,13.391c-12.46-8.039-7.688-85-83.043-114.833 c11.459,7.41,32.063,33.354,2.302,60.66c36.499,1.346,22.635,36.253,13.426,38.675c22.66,2.598,33.872,14.784,27.071,44.2 c18.725-10.427,52.082-8.753,41.083,37.198c8.803-21.631,50.63-27.257,45.071,6.77c15.223-19.209,48.701-14.457,56.256,6.482 c-0.384-19.43,25.111-35.564,41.476-23.154c-1.149-20.68,24.084-39.162,47.316-37.398 C234.244,141.285,181.952,166.709,150.905,175.061z'}/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
							<p className={'text-gray-300 text-sm font-medium'}>{'Nothing to see here'}</p>
						</div>
					)}
				<div className={'absolute inset-0 z-50 pointer-events-none'}>
					{renderMiddlePart()}
				</div>
			</div>

			<div className={'w-full p-6 bg-white border-t border-gray-50 flex justify-center items-center'}>
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
