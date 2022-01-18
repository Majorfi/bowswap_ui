import	React, {useState, useEffect}				from	'react';
import	{ethers}									from	'ethers';
import	useWeb3										from	'contexts/useWeb3';
import	usePaths									from	'contexts/usePaths';
import	{metapoolSwapTokens, swapTokens,
	metapoolSwapTokensWithSignature,
	swapTokensWithSignature}						from	'utils/actions';

function	ButtonSwap({
	fromAmount, estimateOut,
	options,
	signature, shouldIncreaseGasLimit,
	approved, disabled, onCallback
}) {
	const	{provider, chainID} = useWeb3();
	const	{fromVault, toVault, currentPath} = usePaths();
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
				contractAddress: chainID === 250 ? process.env.BOWSWAP_SWAPPER_FTM_ADDR : process.env.BOWSWAP_SWAPPER_ADDR,
				from: fromVault.address,
				to: toVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				minAmountOut: ethers.utils.parseUnits((estimateOut - (estimateOut * options.slippage / 100)).toFixed(fromVault.decimals || 18), fromVault.decimals),
				instructions: currentPath.data[2],
				donation: options.donation * 100,
				shouldIncreaseGasLimit
			}, ({error}) => {
				if (error) {
					let message = undefined;
					if (error?.data?.message?.includes('out too low')) {
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
			if (error?.data?.message?.includes('out too low')) {
				message = 'SLIPPAGE TOO HIGH. TO PROCEED, PLEASE INCREASE THE SLIPPAGE TOLERANCE';
			}
			set_transactionProcessing(false);
			return onCallback('error', message);
		}
	}
	function	performV1Swap() {
		try {
			metapoolSwapTokens({
				provider: provider,
				contractAddress: chainID === 250 ? process.env.BOWSWAP_SWAPPER_FTM_ADDR : process.env.BOWSWAP_SWAPPER_ADDR,
				from: fromVault.address,
				to: toVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				minAmountOut: ethers.utils.parseUnits((estimateOut - (estimateOut * options.slippage / 100)).toFixed(fromVault.decimals || 18), fromVault.decimals),
				donation: options.donation * 100,
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
			contractAddress: chainID === 250 ? process.env.BOWSWAP_SWAPPER_FTM_ADDR : process.env.BOWSWAP_SWAPPER_ADDR,
			from: fromVault.address,
			to: toVault.address,
			amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
			minAmountOut: ethers.utils.parseUnits((estimateOut - (estimateOut * options.slippage / 100)).toFixed(fromVault.decimals || 18), fromVault.decimals),
			instructions: currentPath.data[2],
			signature,
			donation: options.donation * 100,
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
		try {
			metapoolSwapTokensWithSignature({
				provider: provider,
				contractAddress: chainID === 250 ? process.env.BOWSWAP_SWAPPER_FTM_ADDR : process.env.BOWSWAP_SWAPPER_ADDR,
				from: fromVault.address,
				to: toVault.address,
				amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
				minAmountOut: ethers.utils.parseUnits((estimateOut - (estimateOut * options.slippage / 100)).toFixed(fromVault.decimals || 18), fromVault.decimals),
				signature,
				donation: options.donation * 100,
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
		if (currentPath.type === 'standard' && signature) {
			performV2SwapWithSignature();
		} else if (currentPath.type === 'standard') {
			performV2Swap();
		} else if (signature) {
			performV1SwapWithSignature();
		} else {
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