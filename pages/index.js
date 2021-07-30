/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday July 4th 2021
**	@Filename:				index.js
******************************************************************************/

import	React, {useState, useEffect, useCallback}	from	'react';
import	{ethers}									from	'ethers';
import	{CheckIcon, XIcon}							from	'@heroicons/react/solid';
import	useWeb3										from	'contexts/useWeb3';
import	useDebounce									from	'hook/useDebounce';
import	{approveToken, swapTokens}					from	'utils/actions';
import	InputToken									from	'components/InputToken';
import	InputTokenDisabled							from	'components/InputTokenDisabled';
import	ModalVaultList								from	'components/ModalVaultList';
import	{USD_VAULTS, BTC_VAULTS, fetchCryptoPrice}	from	'utils/API';
import	{bigNumber}									from	'utils';

function	SectionFromVault({vaults, fromVault, set_fromVault, fromAmount, set_fromAmount, slippage, set_slippage, fromCounterValue, balanceOf}) {
	return (
		<section aria-label={'FROM_VAULT'}>
			<label className={'font-medium text-sm text-gray-800'}>{'From Vault'}</label>
			<div className={'flex flex-col md:flex-row items-start justify-center md:space-x-4 w-full'}>
				<div className={'w-full md:w-2/6'}>
					<ModalVaultList
						vaults={vaults}
						value={fromVault}
						set_value={set_fromVault} />
				</div>
				<div className={'w-full md:w-4/6'}>
					<InputToken
						balanceOf={balanceOf}
						decimals={fromVault.decimals}
						fromCounterValue={fromCounterValue}
						value={fromAmount}
						set_value={set_fromAmount}
						slippage={slippage}
						set_slippage={set_slippage} />
				</div>
			</div>
			<div className={'flex flex-row items-center justify-end w-full'}>
				<label
					onClick={() => set_fromAmount(ethers.utils.formatUnits(balanceOf, fromVault.decimals))}
					className={'font-normal text-xs text-gray-600 hidden md:flex flex-row items-center pl-1 mt-1 mb-1 cursor-pointer'}>
					{`Balance: ${Number(ethers.utils.formatUnits(balanceOf, fromVault.decimals))} ${fromVault.symbol}`}
				</label>
				<label
					onClick={() => set_fromAmount(ethers.utils.formatUnits(balanceOf, fromVault.decimals))}
					className={'font-normal text-xs text-gray-600 flex flex-row items-center pl-1 mt-1 mb-1 md:hidden cursor-pointer'}>
					{`Balance: ${Number(ethers.utils.formatUnits(balanceOf, fromVault.decimals)).toFixed(8)} ${fromVault.symbol}`}
				</label>
			</div>
		</section>
	);
}

function	SectionToVault({vaults, toVault, set_toVault, expectedReceiveAmount, toCounterValue, balanceOf, slippage, isFetchingExpectedReceiveAmount}) {
	return (
		<section aria-label={'TO_VAULT'}>
			<label className={'font-medium text-sm text-gray-800'}>{'To Vault'}</label>
			<div className={'flex flex-col md:flex-row items-start justify-center md:space-x-4 w-full'}>
				<div className={'w-full md:w-2/6'}>
					<ModalVaultList
						vaults={vaults}
						value={toVault}
						set_value={set_toVault} />
				</div>
				<div className={'w-full md:w-4/6'}>
					<InputTokenDisabled
						value={expectedReceiveAmount}
						toCounterValue={toCounterValue}
						slippage={slippage}
						isFetchingExpectedReceiveAmount={isFetchingExpectedReceiveAmount} />
				</div>
			</div>
			<div className={'flex flex-row items-center justify-end w-full'}>
				<label className={'font-normal text-xs text-gray-600 hidden md:flex flex-row items-center pl-1 mt-1 mb-1'}>
					{`Balance: ${Number(ethers.utils.formatUnits(balanceOf, toVault.decimals))} ${toVault.symbol}`}
				</label>
				<label className={'font-normal text-xs text-gray-600 flex flex-row items-center pl-1 mt-1 mb-1 md:hidden'}>
					{`Balance: ${Number(ethers.utils.formatUnits(balanceOf, toVault.decimals)).toFixed(8)} ${toVault.symbol}`}
				</label>
			</div>
		</section>
	);
}

function	SectionAction({fromVault, toVault, fromAmount, expectedReceiveAmount, slippage, onSuccess}) {
	const	{provider} = useWeb3();
	const	[txStep, set_txStep] = useState('Approve');
	const	[txApproveStatus, set_txApproveStatus] = useState({none: true, pending: false, success: false, error: false});
	const	[txSwapStatus, set_txSwapStatus] = useState({none: true, pending: false, success: false, error: false});

	useEffect(() => {
		if (txApproveStatus.error) {
			setTimeout(() => set_txApproveStatus({none: true, pending: false, success: false, error: false}), 2000);
		}
	}, [txApproveStatus]);

	useEffect(() => {
		if (txSwapStatus.error) {
			setTimeout(() => set_txSwapStatus({none: true, pending: false, success: false, error: false}), 2000);
		}
	}, [txSwapStatus]);

	function	performSwap() {
		set_txSwapStatus({none: false, pending: true, success: false, error: false});
		swapTokens({
			provider: provider,
			contractAddress: process.env.METAPOOL_SWAPPER_ADDRESS,
			from: fromVault.address,
			to: toVault.address,
			amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
			minAmountOut: ethers.utils.parseUnits((expectedReceiveAmount - (expectedReceiveAmount * slippage / 100)).toString(), fromVault.decimals)
		}, ({error}) => {
			if (error) {
				return set_txSwapStatus({none: false, pending: false, success: false, error: true});
			}
			set_txSwapStatus({none: false, pending: false, success: true, error: false});
			setTimeout(() => set_txSwapStatus({none: true, pending: false, success: false, error: false}), 1500);
			onSuccess();
		});
	}

	function	performApprove() {
		set_txApproveStatus({none: false, pending: true, success: false, error: false});
		approveToken({
			provider: provider,
			contractAddress: fromVault.address,
			amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
			from: process.env.METAPOOL_SWAPPER_ADDRESS
		}, ({error, data}) => {
			if (error) {
				return set_txApproveStatus({none: false, pending: false, success: false, error: true});
			}
			set_txStep('Swap');
			set_txApproveStatus({none: false, pending: false, success: true, error: false});
			performSwap(data);
		});
	}

	return (
		<div className={'flex flex-row justify-center pt-8 w-full space-x-4'}>
			<button
				onClick={performApprove}
				className={`w-full h-11 flex items-center justify-center space-x-2 px-6 py-2 text-lg rounded-lg focus:outline-none overflow-hidden transition-colors border-2 ${
					txApproveStatus.pending ? 'text-gray-500 bg-gray-100 border-gray-100 cursor-not-allowed' :
						txApproveStatus.success ? 'bg-green-500 border-green-500 text-white cursor-not-allowed' :
							txApproveStatus.error ? 'bg-red-500 border-red-500 text-white cursor-not-allowed' :
								'bg-sky-400 border-sky-400 hover:bg-sky-500 hover:border-sky-500 text-white cursor-pointer'
				}`}>
				{txApproveStatus.none === true ? (
					<span>{'Approve'}</span>
				) : null}
				{txApproveStatus.pending === true ? (
					<svg className={'animate-spin h-5 w-5'} xmlns={'http://www.w3.org/2000/svg'} fill={'none'} viewBox={'0 0 24 24'}>
						<circle className={'opacity-25'} cx={'12'} cy={'12'} r={'10'} stroke={'currentColor'} strokeWidth={'4'}></circle>
						<path className={'opacity-75'} fill={'currentColor'} d={'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'}></path>
					</svg>
				) : null}
				{txApproveStatus.success === true ? <CheckIcon className={'w-5 h-5'} /> : null}
				{txApproveStatus.error === true ? <XIcon className={'w-5 h-5'} /> : null}
			</button>

			<button
				onClick={performSwap}
				className={`w-full h-11 flex items-center justify-center space-x-2 px-6 py-2 text-lg rounded-lg focus:outline-none overflow-hidden transition-colors border-2 ${
					txStep === 'Approve' ? 'text-gray-500 bg-white border-gray-100 cursor-not-allowed' :
						txSwapStatus.pending ? 'text-gray-500 bg-gray-100 border-gray-100 cursor-not-allowed' :
							txSwapStatus.success ? 'bg-green-500 border-green-500 text-white cursor-not-allowed' :
								txSwapStatus.error ? 'bg-red-500 border-red-500 text-white cursor-not-allowed' :
									'bg-sky-400 border-sky-400 hover:bg-sky-500 hover:border-sky-500 text-white cursor-pointer'
				}`}>
				{txSwapStatus.none === true ? (
					<span>{'Swap'}</span>
				) : null}
				{txSwapStatus.pending === true ? (
					<svg className={'animate-spin h-5 w-5'} xmlns={'http://www.w3.org/2000/svg'} fill={'none'} viewBox={'0 0 24 24'}>
						<circle className={'opacity-25'} cx={'12'} cy={'12'} r={'10'} stroke={'currentColor'} strokeWidth={'4'}></circle>
						<path className={'opacity-75'} fill={'currentColor'} d={'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'}></path>
					</svg>
				) : null}
				{txSwapStatus.success === true ? <CheckIcon className={'w-5 h-5'} /> : null}
				{txSwapStatus.error === true ? <XIcon className={'w-5 h-5'} /> : null}
			</button>
		</div>
	);
}

function	Index() {
	const	{address, provider} = useWeb3();

	const	[fromVault, set_fromVault] = useState(USD_VAULTS[0]);
	const	[fromCounterValue, set_fromCounterValue] = useState(0);
	const	[fromAmount, set_fromAmount] = useState('0');
	const	[fromBalanceOf, set_fromBalanceOf] = useState('0');

	const	[toVaultsList, set_toVaultsList] = useState(USD_VAULTS.slice(1));
	const	[toVault, set_toVault] = useState(USD_VAULTS[1]);
	const	[toCounterValue, set_toCounterValue] = useState(0);
	const	[toBalanceOf, set_toBalanceOf] = useState('0');
	const	[expectedReceiveAmount, set_expectedReceiveAmount] = useState('0');

	const	[slippage, set_slippage] = useState(0.10);
	const	[isFetchingExpectedReceiveAmount, set_isFetchingExpectedReceiveAmount] = useState(false);

	const	debouncedFetchExpectedAmount = useDebounce(fromAmount, 500);

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
	}, [fromVault, provider, toVault]);

	const	fetchCRVFromBalance = useCallback(async () => {
		if (!provider)
			return;
		const	fromToken = new ethers.Contract(fromVault.address, ['function balanceOf(address) public view returns (uint256)'], provider);
		const	_balanceOf = await fromToken.balanceOf(address);
		set_fromBalanceOf(_balanceOf);
	}, [address, fromVault.address, provider]);

	const	fetchCRVToBalance = useCallback(async () => {
		if (!provider)
			return;
		const	toToken = new ethers.Contract(toVault.address, ['function balanceOf(address) public view returns (uint256)'], provider);
		const	_balanceOf = await toToken.balanceOf(address);
		set_toBalanceOf(_balanceOf);
	}, [address, toVault.address, provider]);

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
		}
		if (fromVault.scope === 'usd') {
			const	vaultList = USD_VAULTS.filter(e => e.address !== fromVault.address);
			set_toVaultsList(vaultList);
			if (fromVault.scope !== toVault.scope || fromVault.address === toVault.address)
				set_toVault(vaultList[0]);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromVault.address]);


	useEffect(() => fetchCRVVirtualPrice(), [fetchCRVVirtualPrice]);
	useEffect(() => fetchCRVFromBalance(), [fetchCRVFromBalance]);
	useEffect(() => fetchCRVToBalance(), [fetchCRVToBalance]);

	useEffect(() => {
		if (debouncedFetchExpectedAmount) {
			if (Number(fromAmount) !== 0) {
				set_isFetchingExpectedReceiveAmount(true);
				fetchEstimateOut(fromVault.address, toVault.address, ethers.utils.parseUnits(fromAmount, fromVault.decimals));
			} else {
				set_expectedReceiveAmount('0');
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedFetchExpectedAmount, fromVault.address, toVault.address, fromVault.decimals]);

	return (
		<section className={'mt-12 pt-16 w-full md:px-12 px-4 space-y-12 mb-64 z-10 relative'}>
			<div className={'flex justify-center items-center'}>
				<div className={'w-full max-w-4xl'}>
					<div className={'bg-white rounded-xl shadow-md p-6 pt-8 w-full relative space-y-0 md:space-y-4'}>
						<SectionFromVault
							vaults={[...USD_VAULTS, ...BTC_VAULTS]}
							fromVault={fromVault}
							set_fromVault={set_fromVault}
							fromAmount={fromAmount}
							set_fromAmount={set_fromAmount}
							fromCounterValue={fromCounterValue}
							balanceOf={fromBalanceOf}
							slippage={slippage}
							set_slippage={set_slippage} />

						<div className={'flex w-full justify-center pt-4'}>
							<svg aria-hidden={'true'} focusable={'false'} className={'w-8 h-8 text-gray-400'} role={'img'} xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 320 512'}><path fill={'currentColor'} d={'M281.6 392.3l-104 112.1c-9.498 10.24-25.69 10.24-35.19 0l-104-112.1c-6.484-6.992-8.219-17.18-4.404-25.94c3.811-8.758 12.45-14.42 21.1-14.42H128V32c0-17.69 14.33-32 32-32S192 14.31 192 32v319.9h72c9.547 0 18.19 5.66 22 14.42C289.8 375.1 288.1 385.3 281.6 392.3z'}></path></svg>
						</div>

						<SectionToVault
							vaults={toVaultsList}
							toVault={toVault}
							set_toVault={set_toVault}
							expectedReceiveAmount={expectedReceiveAmount}
							toCounterValue={toCounterValue}
							slippage={slippage}
							balanceOf={toBalanceOf}
							isFetchingExpectedReceiveAmount={isFetchingExpectedReceiveAmount} />

						<SectionAction
							fromVault={fromVault}
							toVault={toVault}
							fromAmount={fromAmount}
							expectedReceiveAmount={expectedReceiveAmount}
							slippage={slippage}
							onSuccess={() => {
								fetchCRVFromBalance();
								set_fromAmount('0');
							}}
						/>
					</div>
				</div>
			</div>

		</section>
	);
}

export default Index;
