import	React, {useState, useEffect}				from	'react';
import	{ethers}									from	'ethers';
import	useWeb3										from	'contexts/useWeb3';
import	useAccount									from	'contexts/useAccount';
import	{approveToken, metapoolSwapTokens,
	swapTokens, metapoolSwapTokensWithSignature,
	swapTokensWithSignature, signTransaction}		from	'utils/actions';
import	V2_PATHS									from	'utils/currentPaths';

function	ButtonSwap({
	fromVault, toVault,
	fromAmount, expectedReceiveAmount,
	slippage, donation,
	signature, shouldIncreaseGasLimit,
	approved, disabled, onCallback
}) {
	const	{provider} = useWeb3();
	const	[transactionProcessing, set_transactionProcessing] = useState(false);

	const	[DEBUG_TX, set_DEBUG_TX] = useState(-1);

	useEffect(() => {
		window.swap = () => set_DEBUG_TX(n => n + 1);
	}, [typeof(window) !== 'undefined']);

	useEffect(() => {
		if (DEBUG_TX >= 0)
			performSwap(true);
	}, [DEBUG_TX]);

	function	performV2Swap() {
		try {
			swapTokens({
				provider: provider,
				contractAddress: process.env.BOWSWAP_SWAPPER_ADDR,
				from: fromVault.address,
				to: toVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				minAmountOut: ethers.utils.parseUnits((expectedReceiveAmount - (expectedReceiveAmount * slippage / 100)).toFixed(18), fromVault.decimals),
				instructions: V2_PATHS.find(path => path[0] === fromVault.address && path[1] === toVault.address)?.[2],
				donation: donation * 100,
				shouldIncreaseGasLimit
			}, ({error}) => {
				if (error) {
					let message = undefined;
					if (error?.data?.message?.includes('revert out too low')) {
						message = 'SLIPPAGE TOO HIGH. TO PROCEED, PLEASE INCREASE THE SLIPPAGE TOLERANCE';
					}
					set_transactionProcessing(false);
					return onCallback('error', message);
				}
				set_transactionProcessing(false);
				onCallback('success');
			});
		} catch (error) {
			let message = undefined;
			if (error?.data?.message?.includes('revert out too low')) {
				message = 'SLIPPAGE TOO HIGH. TO PROCEED, PLEASE INCREASE THE SLIPPAGE TOLERANCE';
			}
			set_transactionProcessing(false);
			return onCallback('error', message);
		}
	}
	function	performV1Swap() {
		const	v2PathExists = V2_PATHS.find(path => path[0] === fromVault.address && path[1] === toVault.address);

		try {
			metapoolSwapTokens({
				provider: provider,
				contractAddress: process.env.BOWSWAP_SWAPPER_ADDR,
				from: fromVault.address,
				to: toVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				minAmountOut: ethers.utils.parseUnits((expectedReceiveAmount - (expectedReceiveAmount * slippage / 100)).toFixed(18), fromVault.decimals),
				donation: donation * 100,
				shouldIncreaseGasLimit
			}, ({error}) => {
				if (error) {
					if (error?.message?.includes('User denied transaction signature')) {
						set_transactionProcessing(false);
						return onCallback('error', 'User denied transaction signature');
					} else if (v2PathExists) {
						console.log('FALLBACK_WITH_V2');
						return performV2Swap();
					} else {
						let message = undefined;
						if (error?.data?.message?.includes('revert out too low')) {
							message = 'SLIPPAGE TOO HIGH. TO PROCEED, PLEASE INCREASE THE SLIPPAGE TOLERANCE';
						}
						set_transactionProcessing(false);
						return onCallback('error', message);
					}
				}
				set_transactionProcessing(false);
				onCallback('success');
			});
		} catch (error) {
			if (error?.message?.includes('User denied transaction signature')) {
				set_transactionProcessing(false);
				return onCallback('error', 'User denied transaction signature');
			} else if (v2PathExists) {
				console.log('FALLBACK_WITH_V2');
				return performV2Swap();
			} else {
				let message = undefined;
				if (error?.data?.message?.includes('revert out too low')) {
					message = 'SLIPPAGE TOO HIGH. TO PROCEED, PLEASE INCREASE THE SLIPPAGE TOLERANCE';
				}
				set_transactionProcessing(false);
				return onCallback('error', message);
			}
		}
	}

	function	performV2SwapWithSignature() {
		swapTokensWithSignature({
			provider: provider,
			contractAddress: process.env.BOWSWAP_SWAPPER_ADDR,
			from: fromVault.address,
			to: toVault.address,
			amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
			minAmountOut: ethers.utils.parseUnits((expectedReceiveAmount - (expectedReceiveAmount * slippage / 100)).toFixed(18), fromVault.decimals),
			instructions: V2_PATHS.find(path => path[0] === fromVault.address && path[1] === toVault.address)?.[2],
			signature,
			donation: donation * 100,
			shouldIncreaseGasLimit
		}, ({error}) => {
			if (error) {
				if (error?.message?.includes('User denied transaction signature')) {
					set_transactionProcessing(false);
					return onCallback('error', 'User denied transaction signature');
				} else {
					let message = undefined;
					if (error?.data?.message?.includes('revert out too low')) {
						message = 'SLIPPAGE TOO HIGH. TO PROCEED, PLEASE INCREASE THE SLIPPAGE TOLERANCE';
					} else if (error?.data?.message?.includes('execution reverted')) {
						message = 'INVALID SIGNATURE, FALLBACK TO DEFAULT FLOW';
					} else {
						message = 'INVALID SIGNATURE, FALLBACK TO DEFAULT FLOW';
					}
					set_transactionProcessing(false);
					return onCallback('error', message);
				}
			}
			set_transactionProcessing(false);
			onCallback('success');
		});
	}
	function	performV1SwapWithSignature() {
		const	v2PathExists = V2_PATHS.find(path => path[0] === fromVault.address && path[1] === toVault.address);

		try {
			metapoolSwapTokensWithSignature({
				provider: provider,
				contractAddress: process.env.BOWSWAP_SWAPPER_ADDR,
				from: fromVault.address,
				to: toVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				minAmountOut: ethers.utils.parseUnits((expectedReceiveAmount - (expectedReceiveAmount * slippage / 100)).toFixed(18), fromVault.decimals),
				signature,
				donation: donation * 100,
				shouldIncreaseGasLimit
			}, ({error}) => {
				if (error) {
					if (error?.message?.includes('User denied transaction signature')) {
						set_transactionProcessing(false);
						return onCallback('error', 'User denied transaction signature');
					} else if (v2PathExists) {
						console.log('FALLBACK_WITH_V2');
						return performV2SwapWithSignature();
					} else {
						let message = undefined;
						if (error?.data?.message?.includes('revert out too low')) {
							message = 'SLIPPAGE TOO HIGH. TO PROCEED, PLEASE INCREASE THE SLIPPAGE TOLERANCE';
						} else if (error?.message?.includes('execution reverted')) {
							message = 'INVALID SIGNATURE, FALLBACK TO DEFAULT FLOW';
						} else {
							message = 'INVALID SIGNATURE, FALLBACK TO DEFAULT FLOW';
						}
						set_transactionProcessing(false);
						return onCallback('error', message);
					}
				}
				set_transactionProcessing(false);
				onCallback('success');
			});
		} catch (error) {
			if (error?.message?.includes('User denied transaction signature')) {
				set_transactionProcessing(false);
				return onCallback('error', 'User denied transaction signature');
			} else if (v2PathExists) {
				console.log('FALLBACK_WITH_V2');
				return performV2Swap();
			} else {
				let message = undefined;
				if (error?.message?.includes('revert out too low')) {
					message = 'SLIPPAGE TOO HIGH. TO PROCEED, PLEASE INCREASE THE SLIPPAGE TOLERANCE';
				}
				set_transactionProcessing(false);
				return onCallback('error', message);
			}
		}
	}

	function	performSwap(forced = false) {
		if (!forced && (disabled || transactionProcessing || !approved)) {
			return;
		}
		set_transactionProcessing(true);
		onCallback('pending');
		if (toVault.scope === 'v2') {
			if (signature) {
				return performV2SwapWithSignature();
			}
			performV2Swap();
		} else {
			if (signature) {
				return performV1SwapWithSignature();
			}
			performV1Swap();
		}
	}

	return (
		<button
			onClick={() => performSwap(false)}
			className={`w-full h-11 flex items-center justify-center space-x-2 px-6 py-3 text-ybase font-medium rounded-lg focus:outline-none overflow-hidden transition-colors border ${
				disabled || transactionProcessing || !approved ? 'text-ygray-400 bg-white border-ygray-400 cursor-not-allowed' :
					'bg-yblue hover:bg-yblue-hover border-yblue hover:border-yblue-hover text-white cursor-pointer'
			}`}>
			<span>{'Swap'}</span>
		</button>
	);
}

function	ButtonApprove({fromVault, fromAmount, approved, disabled, set_signature, canSign, onCallback}) {
	const	{provider} = useWeb3();
	const	[transactionProcessing, set_transactionProcessing] = useState(false);
	const	[DEBUG_TX, set_DEBUG_TX] = useState(-1);

	useEffect(() => {
		window.approve = (nonce) => set_DEBUG_TX(nonce);
	}, [typeof(window) !== 'undefined']);

	useEffect(() => {
		if (DEBUG_TX >= 0)
			performApprove(true, DEBUG_TX);
	}, [DEBUG_TX]);

	function	approveTx() {
		try {
			approveToken({
				provider: provider,
				contractAddress: fromVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				from: process.env.BOWSWAP_SWAPPER_ADDR
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

	function	performApprove(forced = false, nonceOverwrite = undefined) {
		if (!forced && (disabled || transactionProcessing || (!fromAmount || Number(fromAmount) === 0))) {
			return;
		}
		set_transactionProcessing(true);
		onCallback('pending');
		if (!canSign) {
			return approveTx();
		}
		try {
			signTransaction({
				provider: provider,
				vaultAddress: fromVault.address,
				contractAddress: process.env.BOWSWAP_SWAPPER_ADDR,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				nonceOverwrite 
			}, ({error, data}) => {
				if (error) {
					if (error?.message?.includes('User denied message signature')) {
						set_transactionProcessing(false);
						return onCallback('error', 'User denied signature');
					}
					console.log('FALLBACK_WITH_APPROVE');
					return approveTx();
				}
				set_signature(data);
				set_transactionProcessing(false);
				onCallback('success');
			});
		} catch (error) {
			if (error?.message?.includes('User denied message signature')) {
				set_transactionProcessing(false);
				return onCallback('error', 'User denied signature');
			}
			console.log('FALLBACK_WITH_APPROVE');
			return approveTx();
		}
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
				disabled || transactionProcessing || (!fromAmount || Number(fromAmount) === 0) ? 'text-ygray-400 bg-white border-ygray-400 cursor-not-allowed' :
					'bg-yblue border-yblue hover:bg-yblue-hover hover:border-yblue-hover text-white cursor-pointer'
			}`}>
			<span>{'Approve'}</span>
		</button>
	);
}

function	SectionButtons({
	fromAmount, fromVault, balanceOfFromVault,
	expectedReceiveAmount, toVault,
	slippage, donation,
	txApproveStatus, set_txApproveStatus,
	signature, set_signature,
	set_txSwapStatus, resetStates
}) {
	const	[canSign, set_canSign] = useState(true);
	const	{balancesOf, updateBalanceOf, allowances} = useAccount();

	const	isAllowed = fromAmount !== '' && Number(fromAmount) > 0 && ethers.BigNumber.from(allowances?.[fromVault.address] || 0)?.gte(ethers.utils.parseUnits(fromAmount || '0', fromVault.decimals || 18));

	return (
		<div className={'flex flex-row justify-center pt-8 w-full space-x-4'}>
			<ButtonApprove
				disabled={(Number(fromAmount) > Number(ethers.utils.formatUnits(balancesOf[fromVault.address]?.toString() || '0', fromVault.decimals)) || txApproveStatus.success || isAllowed)}
				approved={txApproveStatus.success || isAllowed}
				fromVault={fromVault}
				fromAmount={fromAmount}
				set_signature={set_signature}
				canSign={canSign}
				onCallback={(type, message) => {
					set_txApproveStatus({none: false, pending: type === 'pending', error: type === 'error', success: type === 'success', message});
					if (type === 'error') {
						setTimeout(() => set_txApproveStatus((s) => s.error ? {none: true, pending: false, error: false, success: false, message} : s), 2500);
					}
					if (type === 'success') {
						updateBalanceOf([fromVault.address]);
						setTimeout(() => set_txApproveStatus({none: false, pending: false, error: false, success: true, hide: true, message: null}), 2500);
					}
				}} />
			<ButtonSwap
				disabled={Number(fromAmount) > Number(ethers.utils.formatUnits(balancesOf[fromVault.address]?.toString() || '0', fromVault.decimals))}
				approved={txApproveStatus.success || isAllowed || signature}
				fromVault={fromVault}
				toVault={toVault}
				fromAmount={fromAmount}
				expectedReceiveAmount={expectedReceiveAmount}
				slippage={slippage}
				donation={donation}
				signature={signature}
				shouldIncreaseGasLimit={Number(balanceOfFromVault) < Number(fromAmount)}
				onCallback={(type, message) => {
					set_txApproveStatus({none: false, pending: false, error: false, success: true, hide: true, message: null});

					set_txSwapStatus({none: false, pending: type === 'pending', error: type === 'error', success: type === 'success', message});
					if (type === 'error') {
						if (message === 'INVALID SIGNATURE, FALLBACK TO DEFAULT FLOW') {
							setTimeout(() => {
								set_canSign(false);
								set_signature(null);
								set_txApproveStatus({none: true, pending: false, error: false, success: false, message: undefined});
								set_txSwapStatus({none: true, pending: false, error: false, success: false});
							}, 2500);

						} else {
							setTimeout(() => set_txSwapStatus((s) => s.error ? {none: true, pending: false, error: false, success: false, message} : s), 2500);
						}
					}
					if (type === 'success') {
						updateBalanceOf([fromVault.address, toVault.address]);
						setTimeout(() => set_txSwapStatus({none: true, pending: false, error: false, success: false}), 2500);
						resetStates();
					}
				}}
			/>
		</div>
	);
}

export default SectionButtons;