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
import	useAccount										from	'contexts/useAccount';
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
			<div className={'flex flex-col md:flex-row items-start justify-center space-y-2 md:space-y-0 md:space-x-4 w-full'}>
				<div className={'w-full md:w-4/11'}>
					<ModalVaultList
						vaults={vaults}
						value={fromVault}
						set_value={set_fromVault} />
				</div>
				<div className={'w-full md:w-7/11'}>
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
		</section>
	);
}

function	SectionToVault({vaults, toVault, set_toVault, expectedReceiveAmount, toCounterValue, balanceOf, slippage, isFetchingExpectedReceiveAmount}) {
	return (
		<section aria-label={'TO_VAULT'}>
			<label className={'font-medium text-sm text-gray-800'}>{'To Vault'}</label>
			<div className={'flex flex-col md:flex-row items-start justify-center space-y-2 md:space-y-0 md:space-x-4 w-full'}>
				<div className={'w-full md:w-4/11'}>
					<ModalVaultList
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

function	SectionAction({fromVault, toVault, fromAmount, expectedReceiveAmount, slippage, onSuccess, disabled}) {
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
		if (disabled) {
			return;
		}
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
		if (disabled) {
			return;
		}
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
				className={`w-full h-11 flex items-center justify-center space-x-2 px-6 py-3 text-ybase font-medium rounded-lg focus:outline-none overflow-hidden transition-colors border ${
					disabled ? 'text-ygray-400 bg-white border-ygray-400 cursor-not-allowed' :
						txApproveStatus.pending ? 'text-gray-500 bg-gray-100 border-gray-100 cursor-not-allowed' :
							txApproveStatus.success ? 'bg-white border-blue-400 text-blue-400 cursor-not-allowed' :
								txApproveStatus.error ? 'bg-red-500 border-red-500 text-white cursor-not-allowed' :
									'bg-blue-400 border-blue-400 hover:bg-blue-500 hover:border-blue-500 text-white cursor-pointer'
				}`}>
				{txApproveStatus.none === true ? <span>{'Approve'}</span> : null}
				{txApproveStatus.pending === true ? (
					<svg className={'animate-spin h-5 w-5'} xmlns={'http://www.w3.org/2000/svg'} fill={'none'} viewBox={'0 0 24 24'}>
						<circle className={'opacity-25'} cx={'12'} cy={'12'} r={'10'} stroke={'currentColor'} strokeWidth={'4'}></circle>
						<path className={'opacity-75'} fill={'currentColor'} d={'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'}></path>
					</svg>
				) : null}
				{txApproveStatus.success === true ?
					<div className={'flex flex-row items-center justify-center'}>
						<span>{'Approved'}</span>
						<svg className={'ml-2'} width={'16'} height={'16'} viewBox={'0 0 16 16'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
							<path fillRule={'evenodd'} clipRule={'evenodd'} d={'M13.7602 3.48787C14.043 3.72358 14.0813 4.14396 13.8456 4.42681L7.17889 12.4268C6.96078 12.6885 6.58042 12.7437 6.29694 12.5547L2.29694 9.88805C1.99058 9.68382 1.9078 9.2699 2.11204 8.96355C2.31627 8.6572 2.73019 8.57442 3.03654 8.77865L6.53809 11.113L12.8213 3.57323C13.057 3.29038 13.4773 3.25216 13.7602 3.48787Z'} fill={'#00A3FF'}/>
						</svg>
					</div>
					: null}
				{txApproveStatus.error === true ? <XIcon className={'w-5 h-5'} /> : null}
			</button>

			<button
				onClick={performSwap}
				className={`w-full h-11 flex items-center justify-center space-x-2 px-6 py-3 text-ybase font-medium rounded-lg focus:outline-none overflow-hidden transition-colors border ${
					disabled ? 'text-ygray-400 bg-white border-ygray-400 cursor-not-allowed' :
						txStep === 'Approve' ? 'text-gray-500 bg-white border-gray-100 cursor-not-allowed' :
							txSwapStatus.pending ? 'text-gray-500 bg-gray-100 border-gray-100 cursor-not-allowed' :
								txSwapStatus.success ? 'bg-green-500 border-green-500 text-white cursor-not-allowed' :
									txSwapStatus.error ? 'bg-red-500 border-red-500 text-white cursor-not-allowed' :
										'bg-blue-400 border-blue-400 hover:bg-blue-500 hover:border-blue-500 text-white cursor-pointer'
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
	const	{provider} = useWeb3();
	const	{balancesOf, updateBalanceOf} = useAccount();

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
				<div className={'w-full max-w-2xl'}>
					<div className={'bg-white rounded-xl shadow-md p-4 w-full relative space-y-0 md:space-y-4'}>
						<SectionFromVault
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
							{Number(fromAmount) > Number(ethers.utils.formatUnits(balancesOf[fromVault.address]?.toString() || '0', fromVault.decimals)) ?
								<div className={'w-full bg-error text-yerror font-medium text-white rounded-lg h-16 flex justify-center items-center'}>
									<svg className={'mr-4'} width={'28'} height={'24'} viewBox={'0 0 28 24'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
										<path d={'M27.5616 18.9767L17.0397 1.67442C16.4551 0.669767 15.286 0 14 0C12.714 0 11.5449 0.669767 10.9603 1.67442L0.438413 18.9767C-0.146138 19.9814 -0.146138 21.3209 0.438413 22.3256C1.13987 23.3302 2.19207 24 3.47808 24H24.5219C25.8079 24 26.977 23.3302 27.5616 22.3256C28.1461 21.2093 28.1461 19.9814 27.5616 18.9767ZM25.5741 21.2093C25.4572 21.4326 25.2234 21.7674 24.5219 21.7674H3.47808C2.89353 21.7674 2.5428 21.3209 2.42589 21.2093C2.30898 21.0977 2.07516 20.5395 2.42589 20.093L12.9478 2.7907C13.2985 2.23256 13.7662 2.23256 14 2.23256C14.2338 2.23256 14.7015 2.23256 15.0522 2.7907L25.5741 20.093C25.8079 20.5395 25.5741 20.986 25.5741 21.2093Z'} fill={'white'}/>
										<path d={'M14.0001 6.13953C13.2986 6.13953 12.831 6.58605 12.831 7.25581V13.9535C12.831 14.6233 13.2986 15.0698 14.0001 15.0698C14.7015 15.0698 15.1692 14.6233 15.1692 13.9535V7.25581C15.1692 6.58605 14.7015 6.13953 14.0001 6.13953Z'} fill={'white'}/>
										<path d={'M14.0001 19.5349C14.6457 19.5349 15.1692 19.0351 15.1692 18.4186C15.1692 17.8021 14.6457 17.3023 14.0001 17.3023C13.3544 17.3023 12.831 17.8021 12.831 18.4186C12.831 19.0351 13.3544 19.5349 14.0001 19.5349Z'} fill={'white'}/>
									</svg>
									{'EXCEEDED BALANCE LIMIT !'}
								</div> :
								<div className={'w-full h-16 flex justify-center items-center'}>
									<svg width={'30'} height={'50'} viewBox={'0 0 30 50'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
										<path d={'M13.5858 49.4142C14.3668 50.1953 15.6332 50.1953 16.4142 49.4142L29.1421 36.6863C29.9232 35.9052 29.9232 34.6389 29.1421 33.8579C28.3611 33.0768 27.0948 33.0768 26.3137 33.8579L15 45.1716L3.68629 33.8579C2.90524 33.0768 1.63891 33.0768 0.857864 33.8579C0.0768147 34.6389 0.0768146 35.9052 0.857863 36.6863L13.5858 49.4142ZM13 26L13 48L17 48L17 26L13 26Z'} fill={'#888888'}/><circle cx={'15'} cy={'26'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'26'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'26'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'26'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'14'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'14'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'14'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'14'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'2'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'2'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'2'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'2'} r={'2'} fill={'#888888'}/>
									</svg>
								</div>
							}
						</div>

						<SectionToVault
							vaults={toVaultsList}
							toVault={toVault}
							set_toVault={set_toVault}
							expectedReceiveAmount={expectedReceiveAmount}
							toCounterValue={toCounterValue}
							slippage={slippage}
							balanceOf={balancesOf[toVault.address]?.toString() || '0'}
							isFetchingExpectedReceiveAmount={isFetchingExpectedReceiveAmount} />

						<SectionAction
							disabled={Number(fromAmount) > Number(ethers.utils.formatUnits(balancesOf[fromVault.address]?.toString() || '0', fromVault.decimals))}
							fromVault={fromVault}
							toVault={toVault}
							fromAmount={fromAmount}
							expectedReceiveAmount={expectedReceiveAmount}
							slippage={slippage}
							onSuccess={() => {
								updateBalanceOf(fromVault.address);
								updateBalanceOf(toVault.address);
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
