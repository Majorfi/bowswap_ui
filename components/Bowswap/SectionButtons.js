import	React, {useState}				from	'react';
import	usePaths						from	'contexts/usePaths';
import	useBowswap						from	'contexts/useBowswap';
import	ButtonSwap						from	'components/Bowswap/ButtonSwap';
import	ButtonApprove					from	'components/Bowswap/ButtonApprove';

function	SectionButtons({
	fromAmount,
	estimateOut,
	options,
	txApproveStatus, set_txApproveStatus,
	signature, set_signature,
	set_txSwapStatus, resetStates
}) {
	const	{fromVault, toVault} = usePaths();
	const	{balancesOf, vaultsBalancesOf, updateBalanceOf, allowances, updateAllowancesOf} = useBowswap();
	const	[canSign, set_canSign] = useState(true);

	const	isAllowed = (
		fromAmount !== '' && 
		Number(fromAmount) > 0 &&
		Number(allowances?.[fromVault.address] || '0') >= Number(fromAmount || '0')
	);

	return (
		<div className={'flex flex-row justify-center pt-8 w-full space-x-4'}>
			<ButtonApprove
				disabled={!fromVault || (Number(fromAmount) > Number(balancesOf?.[fromVault.address] || '0') || txApproveStatus.success || isAllowed)}
				approved={txApproveStatus.success || isAllowed}
				fromAmount={fromAmount}
				set_signature={set_signature}
				canSign={canSign}
				onCallback={(type, message) => {
					set_txApproveStatus({none: false, pending: type === 'pending', error: type === 'error', success: type === 'success', message});
					if (type === 'error') {
						setTimeout(() => set_txApproveStatus((s) => s.error ? {none: true, pending: false, error: false, success: false, message} : s), 2500);
					}
					if (type === 'success') {
						updateAllowancesOf([fromVault]);
						setTimeout(() => set_txApproveStatus({none: false, pending: false, error: false, success: true, hide: true, message: null}), 2500);
					}
				}} />
			<ButtonSwap
				disabled={!fromVault || Number(fromAmount) > Number(balancesOf?.[fromVault.address] || '0')}
				approved={txApproveStatus.success || isAllowed || signature}
				fromAmount={fromAmount}
				estimateOut={estimateOut}
				options={options}
				signature={signature}
				shouldIncreaseGasLimit={Number(vaultsBalancesOf?.[fromVault?.address] || '0') < Number(fromAmount)}
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
						updateBalanceOf([fromVault, toVault]);
						setTimeout(() => set_txSwapStatus({none: true, pending: false, error: false, success: false}), 2500);
						resetStates();
					}
				}}
			/>
		</div>
	);
}

export default SectionButtons;