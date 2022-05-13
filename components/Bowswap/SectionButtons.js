import	React, {useState}				from	'react';
import	{ethers}						from	'ethers';
import	useAccount						from	'contexts/useAccount';
import	ButtonSwap						from	'components/Bowswap/ButtonSwap';
import	ButtonApprove					from	'components/Bowswap/ButtonApprove';

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

	const	isAllowed = (
		fromAmount !== '' && 
		Number(fromAmount) > 0 &&
		ethers.BigNumber.from(allowances?.[fromVault.address] || 0)
			?.gte(ethers.utils.parseUnits(Number(fromAmount || '0').toFixed(fromVault.decimals || 18), fromVault.decimals || 18))
	);

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
						// updateBalanceOf([fromVault.address]);
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