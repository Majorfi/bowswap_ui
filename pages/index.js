/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday July 4th 2021
**	@Filename:				index.js
******************************************************************************/

import	React, {useState, useEffect, useCallback}	from	'react';
import	{ethers}									from	'ethers';
import	useWeb3										from	'contexts/useWeb3';
import	useAccount									from	'contexts/useAccount';
import	useDebounce									from	'hook/useDebounce';
import	{approveToken, swapTokens}					from	'utils/actions';
import	InputToken									from	'components/InputToken';
import	InputTokenDisabled							from	'components/InputTokenDisabled';
import	ModalVaultList								from	'components/ModalVaultList';
import	BlockStatus									from	'components/BlockStatus';
import	Success										from	'components/Icons/Success';
import	Error										from	'components/Icons/Error';
import	Pending										from	'components/Icons/Pending';
import	{USD_VAULTS, BTC_VAULTS, fetchCryptoPrice}	from	'utils/API';
import	{bigNumber}									from	'utils';

function	SectionFromVault({vaults, fromVault, set_fromVault, fromAmount, set_fromAmount, slippage, set_slippage, fromCounterValue, balanceOf, disabled}) {
	return (
		<section aria-label={'FROM_VAULT'}>
			<label className={'font-medium text-sm text-gray-800'}>{'From Vault'}</label>
			<div className={'flex flex-col md:flex-row items-start justify-center space-y-2 md:space-y-0 md:space-x-4 w-full'}>
				<div className={'w-full md:w-4/11'}>
					<ModalVaultList
						disabled={disabled}
						vaults={vaults}
						value={fromVault}
						set_value={set_fromVault} />
				</div>
				<div className={'w-full md:w-7/11'}>
					<InputToken
						disabled={disabled}
						balanceOf={balanceOf}
						decimals={fromVault.decimals}
						fromCounterValue={fromCounterValue}
						value={fromAmount}
						set_value={set_fromAmount}
						slippage={slippage}
						set_slippage={set_slippage} />
				</div>
			</div>
		</section>
	);
}

function	SectionToVault({vaults, toVault, set_toVault, expectedReceiveAmount, toCounterValue, balanceOf, slippage, isFetchingExpectedReceiveAmount, disabled}) {
	return (
		<section aria-label={'TO_VAULT'}>
			<label className={'font-medium text-sm text-gray-800'}>{'To Vault'}</label>
			<div className={'flex flex-col md:flex-row items-start justify-center space-y-2 md:space-y-0 md:space-x-4 w-full'}>
				<div className={'w-full md:w-4/11'}>
					<ModalVaultList
						disabled={disabled}
						vaults={vaults}
						value={toVault}
						set_value={set_toVault} />
				</div>
				<div className={'w-full md:w-7/11'}>
					<InputTokenDisabled
						value={expectedReceiveAmount}
						toCounterValue={toCounterValue}
						slippage={slippage}
						balanceOf={balanceOf}
						decimals={toVault.decimals}
						isFetchingExpectedReceiveAmount={isFetchingExpectedReceiveAmount} />
				</div>
			</div>
		</section>
	);
}

function	ButtonSwap({fromVault, toVault, fromAmount, expectedReceiveAmount, slippage, approved, disabled, onCallback}) {
	const	{provider} = useWeb3();
	const	[transactionProcessing, set_transactionProcessing] = useState(false);

	function	performSwap() {
		if (disabled || transactionProcessing || !approved) {
			return;
		}
		set_transactionProcessing(false);
		onCallback('pending');
		try {
			swapTokens({
				provider: provider,
				contractAddress: process.env.METAPOOL_SWAPPER_ADDRESS,
				from: fromVault.address,
				to: toVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				minAmountOut: ethers.utils.parseUnits((expectedReceiveAmount - (expectedReceiveAmount * slippage / 100)).toString(), fromVault.decimals)
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
		<button
			onClick={performSwap}
			className={`w-full h-11 flex items-center justify-center space-x-2 px-6 py-3 text-ybase font-medium rounded-lg focus:outline-none overflow-hidden transition-colors border ${
				disabled || transactionProcessing || !approved ? 'text-ygray-400 bg-white border-ygray-400 cursor-not-allowed' :
					'bg-blue-400 border-blue-400 hover:bg-blue-300 hover:border-blue-300 text-white cursor-pointer'
			}`}>
			<span>{'Swap'}</span>
		</button>
	);
}

function	ButtonApprove({fromVault, fromAmount, approved, disabled, onCallback}) {
	const	{provider} = useWeb3();
	const	[transactionProcessing, set_transactionProcessing] = useState(false);

	function	performApprove() {
		if (disabled || transactionProcessing) {
			return;
		}
		set_transactionProcessing(true);
		onCallback('pending');
		try {
			approveToken({
				provider: provider,
				contractAddress: fromVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				from: process.env.METAPOOL_SWAPPER_ADDRESS
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
				disabled || transactionProcessing || (!fromAmount || Number(fromAmount) === 0) ? 'text-ygray-400 bg-white border-ygray-400 cursor-not-allowed' :
					'bg-blue-400 border-blue-400 hover:bg-blue-300 hover:border-blue-300 text-white cursor-pointer'
			}`}>
			<span>{'Approve'}</span>
		</button>
	);
}


function	Index() {
	const	{provider} = useWeb3();
	const	{balancesOf, updateBalanceOf} = useAccount();
	const	[nonce, set_nonce] = useState(0);

	const	[fromVault, set_fromVault] = useState(USD_VAULTS[0]);
	const	[fromCounterValue, set_fromCounterValue] = useState(0);
	const	[fromAmount, set_fromAmount] = useState('');

	const	[toVaultsList, set_toVaultsList] = useState(USD_VAULTS.slice(1));
	const	[toVault, set_toVault] = useState(USD_VAULTS[1]);
	const	[toCounterValue, set_toCounterValue] = useState(0);
	const	[expectedReceiveAmount, set_expectedReceiveAmount] = useState('');

	const	[slippage, set_slippage] = useState(0.10);
	const	[isFetchingExpectedReceiveAmount, set_isFetchingExpectedReceiveAmount] = useState(false);

	const	debouncedFetchExpectedAmount = useDebounce(fromAmount, 500);

	const	[txApproveStatus, set_txApproveStatus] = useState({none: true, pending: false, success: false, error: false});
	const	[txSwapStatus, set_txSwapStatus] = useState({none: true, pending: false, success: false, error: false});

	function	resetStates() {
		set_fromAmount('');
		set_toCounterValue(0);
		set_expectedReceiveAmount('');
		set_slippage(0.10);
		set_txApproveStatus({none: true, pending: false, success: false, error: false});
	}


	const	fetchCRVVirtualPrice = useCallback(async () => {
		if (!provider)
			return;
		const	prices = await fetchCryptoPrice(['bitcoin'], 'usd');

		if (fromVault) {
			const	poolContract = new ethers.Contract(fromVault.poolAddress, ['function get_virtual_price() public view returns (uint256)'], provider);
			const	vaultContract = new ethers.Contract(fromVault.address, ['function pricePerShare() public view returns (uint256)'], provider);
			const	virtualPrice = await poolContract.get_virtual_price();
			const	pricePerShare = await vaultContract.pricePerShare();
			const	scaledBalanceOf = bigNumber.from(ethers.constants.WeiPerEther).mul(pricePerShare).div(bigNumber.from(10).pow(18)).mul(virtualPrice).div(bigNumber.from(10).pow(18));
			if (fromVault.scope === 'btc') {
				set_fromCounterValue(prices.bitcoin.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
			} else {
				set_fromCounterValue(ethers.utils.formatUnits(scaledBalanceOf, 18));
			}
		}
		if (toVault) {
			const	poolContract = new ethers.Contract(toVault.poolAddress, ['function get_virtual_price() public view returns (uint256)'], provider);
			const	vaultContract = new ethers.Contract(toVault.address, ['function pricePerShare() public view returns (uint256)'], provider);
			const	virtualPrice = await poolContract.get_virtual_price();
			const	pricePerShare = await vaultContract.pricePerShare();
			const	scaledBalanceOf = bigNumber.from(ethers.constants.WeiPerEther).mul(pricePerShare).div(bigNumber.from(10).pow(18)).mul(virtualPrice).div(bigNumber.from(10).pow(18));
			if (toVault.scope === 'btc') {
				set_toCounterValue(prices.bitcoin.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
			} else {
				set_toCounterValue(ethers.utils.formatUnits(scaledBalanceOf, 18));
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider, nonce]);

	const	fetchEstimateOut = useCallback(async (from, to, amount) => {
		const	fromToken = new ethers.Contract(process.env.METAPOOL_SWAPPER_ADDRESS, ['function estimate_out(address from, address to, uint256 amount) public view returns (uint256)'], provider);
		const	estimate_out = await fromToken.estimate_out(from, to, amount);
		set_expectedReceiveAmount(ethers.utils.formatUnits(estimate_out, toVault.decimals));
		set_isFetchingExpectedReceiveAmount(false);
	}, [provider, toVault.decimals]);

	useEffect(() => {
		if (fromVault.scope === 'btc') {
			const	vaultList = BTC_VAULTS.filter(e => e.address !== fromVault.address);
			set_toVaultsList(vaultList);
			if (fromVault.scope !== toVault.scope || fromVault.address === toVault.address)
				set_toVault(vaultList[0]);
			set_nonce(n => n + 1);
		}
		if (fromVault.scope === 'usd') {
			const	vaultList = USD_VAULTS.filter(e => e.address !== fromVault.address);
			set_toVaultsList(vaultList);
			if (fromVault.scope !== toVault.scope || fromVault.address === toVault.address)
				set_toVault(vaultList[0]);
			set_nonce(n => n + 1);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromVault.address]);

	useEffect(() => fetchCRVVirtualPrice(), [fetchCRVVirtualPrice]);

	useEffect(() => {
		if (debouncedFetchExpectedAmount) {
			if (Number(fromAmount) !== 0) {
				set_isFetchingExpectedReceiveAmount(true);
				fetchEstimateOut(fromVault.address, toVault.address, ethers.utils.parseUnits(fromAmount, fromVault.decimals));
				set_nonce(n => n + 1);
			} else {
				set_expectedReceiveAmount('0');
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedFetchExpectedAmount, fromVault.address, toVault.address, fromVault.decimals]);


	function	renderMiddlePart() {
		const	getArgs = () => {
			if (txApproveStatus.pending || txSwapStatus.pending)
				return {open: true, title: 'PENDING...', color: 'bg-pending', icon: <Pending width={24} height={24} className={'mr-4'} />};
			if (txApproveStatus.success && !txApproveStatus.hide)
				return {open: true, title: 'APPROVE COMPLETED', color: 'bg-success', icon: <Success width={24} height={24} className={'mr-4'} />};
			if (txSwapStatus.success)
				return {open: true, title: 'SWAP COMPLETED', color: 'bg-success', icon: <Success width={24} height={24} className={'mr-4'} />};
			if (txSwapStatus.error)
				return {open: true, title: 'SWAP FAILED', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
			if (txApproveStatus.error)
				return {open: true, title: 'APPROVE TRANSACTION FAILURE', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
			if (Number(fromAmount) > Number(ethers.utils.formatUnits(balancesOf[fromVault.address]?.toString() || '0', fromVault.decimals)))
				return {open: true, title: 'EXCEEDED BALANCE LIMIT !', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
			return {open: false, title: '', color: 'bg-blue-400', icon: <div/>};
		};
		return (
			<BlockStatus {...getArgs()} />
		);
	}

	return (
		<section className={'mt-14 pt-14 w-full md:px-12 px-4 space-y-12 mb-64 z-10 relative'}>
			<div className={'flex justify-center items-center'}>
				<div className={'w-full max-w-2xl'}>
					<div className={'bg-white rounded-xl shadow-md p-4 w-full relative space-y-0 md:space-y-4'}>
						<SectionFromVault
							disabled={!txApproveStatus.none || (!txSwapStatus.none && !txSwapStatus.success)}
							vaults={[...USD_VAULTS, ...BTC_VAULTS]}
							fromVault={fromVault}
							set_fromVault={set_fromVault}
							fromAmount={fromAmount}
							set_fromAmount={set_fromAmount}
							fromCounterValue={fromCounterValue}
							balanceOf={balancesOf[fromVault.address]?.toString() || '0'}
							slippage={slippage}
							set_slippage={set_slippage} />

						<div className={'flex w-full justify-center pt-4'}>
							{renderMiddlePart()}
						</div>

						<SectionToVault
							disabled={!txApproveStatus.none || (!txSwapStatus.none && !txSwapStatus.success)}
							vaults={toVaultsList}
							toVault={toVault}
							set_toVault={set_toVault}
							expectedReceiveAmount={expectedReceiveAmount}
							toCounterValue={toCounterValue}
							slippage={slippage}
							balanceOf={balancesOf[toVault.address]?.toString() || '0'}
							isFetchingExpectedReceiveAmount={isFetchingExpectedReceiveAmount} />

						<div className={'flex flex-row justify-center pt-8 w-full space-x-4'}>
							<ButtonApprove
								disabled={Number(fromAmount) > Number(ethers.utils.formatUnits(balancesOf[fromVault.address]?.toString() || '0', fromVault.decimals))}
								approved={txApproveStatus.success}
								fromVault={fromVault}
								fromAmount={fromAmount}
								onCallback={(type) => {
									set_txApproveStatus({none: false, pending: type === 'pending', error: type === 'error', success: type === 'success'});
									if (type === 'error') {
										setTimeout(() => set_txApproveStatus((s) => s.error ? {none: true, pending: false, error: false, success: false} : s), 2500);
									}
									if (type === 'success') {
										setTimeout(() => set_txApproveStatus({none: false, pending: false, error: false, success: true, hide: true}), 2500);
									}
								}} />
							<ButtonSwap
								disabled={Number(fromAmount) > Number(ethers.utils.formatUnits(balancesOf[fromVault.address]?.toString() || '0', fromVault.decimals))}
								approved={txApproveStatus.success}
								fromVault={fromVault}
								toVault={toVault}
								fromAmount={fromAmount}
								expectedReceiveAmount={expectedReceiveAmount}
								slippage={slippage}
								onCallback={(type) => {
									set_txSwapStatus({none: false, pending: type === 'pending', error: type === 'error', success: type === 'success'});
									if (type === 'error') {
										setTimeout(() => set_txSwapStatus((s) => s.error ? {none: true, pending: false, error: false, success: false} : s), 2500);
									}
									if (type === 'success') {
										setTimeout(() => set_txSwapStatus({none: true, pending: false, error: false, success: false}), 2500);
										updateBalanceOf();
										resetStates();
									}
								}}
							/>
						</div>
					</div>
				</div>
			</div>

		</section>
	);
}

export default Index;
