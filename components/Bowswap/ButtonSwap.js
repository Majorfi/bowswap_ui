import	React, {useState, useEffect}				from	'react';
import	{ethers}									from	'ethers';
import	useWeb3										from	'contexts/useWeb3';
import	SWAPS										from	'utils/swaps/ethereum/swaps';
import	{metapoolSwapTokens, swapTokens,
	metapoolSwapTokensWithSignature,
	swapTokensWithSignature}						from	'utils/actions';

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
				from: fromVault.address,
				to: toVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				minAmountOut: ethers.utils.parseUnits((expectedReceiveAmount - (expectedReceiveAmount * slippage / 100)).toFixed(fromVault.decimals || 18), fromVault.decimals),
				instructions: SWAPS.find(path => path[0] === fromVault.address && path[1] === toVault.address)?.[2],
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
		const	v2PathExists = SWAPS.find(path => path[0] === fromVault.address && path[1] === toVault.address);

		try {
			metapoolSwapTokens({
				provider: provider,
				from: fromVault.address,
				to: toVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				minAmountOut: ethers.utils.parseUnits((expectedReceiveAmount - (expectedReceiveAmount * slippage / 100)).toFixed(fromVault.decimals || 18), fromVault.decimals),
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
			minAmountOut: ethers.utils.parseUnits((expectedReceiveAmount - (expectedReceiveAmount * slippage / 100)).toFixed(fromVault.decimals || 18), fromVault.decimals),
			instructions: SWAPS.find(path => path[0] === fromVault.address && path[1] === toVault.address)?.[2],
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
		const	v2PathExists = SWAPS.find(path => path[0] === fromVault.address && path[1] === toVault.address);

		try {
			metapoolSwapTokensWithSignature({
				provider: provider,
				contractAddress: process.env.BOWSWAP_SWAPPER_ADDR,
				from: fromVault.address,
				to: toVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				minAmountOut: ethers.utils.parseUnits((expectedReceiveAmount - (expectedReceiveAmount * slippage / 100)).toFixed(fromVault.decimals || 18), fromVault.decimals),
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
				console.warn(error);
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

export default ButtonSwap;