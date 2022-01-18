import	React					from	'react';
import	usePaths				from	'contexts/usePaths';
import	BlockStatus				from	'components/Bowswap/BlockStatus';
import	Success					from	'components/Icons/Success';
import	Error					from	'components/Icons/Error';
import	Pending					from	'components/Icons/Pending';

const	getArgs = ({fromDisplayName, fromAddress, toDisplayName, txApproveStatus, txSwapStatus, options, fromAmount, balancesOf}) => {
	const	fromIsEUR = ((fromDisplayName || '').toLowerCase()).includes('eur');
	const	fromIsBTC = ((fromDisplayName || '').toLowerCase()).includes('btc');
	const	fromIsETH = ((fromDisplayName || '').toLowerCase()).includes('eth');
	const	fromIsAAVE = ((fromDisplayName || '').toLowerCase()).includes('aave');
	const	fromIsLINK = ((fromDisplayName || '').toLowerCase()).includes('link');
	const	fromIsTRI = (((fromDisplayName || '').toLowerCase()).includes('tri') || ((fromDisplayName || '').toLowerCase()).includes('3crypto'));
	const	fromIsUSD = (!fromIsEUR && !fromIsBTC && !fromIsETH && !fromIsAAVE && !fromIsLINK && !fromIsTRI);
	const	toIsEUR = ((toDisplayName || '').toLowerCase()).includes('eur');
	const	toIsBTC = ((toDisplayName || '').toLowerCase()).includes('btc');
	const	toIsETH = ((toDisplayName || '').toLowerCase()).includes('eth');
	const	toIsAAVE = ((toDisplayName || '').toLowerCase()).includes('aave');
	const	toIsLINK = ((toDisplayName || '').toLowerCase()).includes('link');
	const	toIsTRI = (((toDisplayName || '').toLowerCase()).includes('tri') || ((toDisplayName || '').toLowerCase()).includes('3crypto'));
	const	toIsUSD = (!toIsEUR && !toIsBTC && !toIsETH && !toIsAAVE && !toIsLINK && !toIsTRI);

	if (txApproveStatus.pending || txSwapStatus.pending)
		return {open: true, title: 'PENDING...', color: 'bg-pending', icon: <Pending width={24} height={24} className={'mr-4'} />};
	if (txApproveStatus.success && !txApproveStatus.hide)
		return {open: true, title: 'APPROVE COMPLETED', color: 'bg-success', icon: <Success width={24} height={24} className={'mr-4'} />};
	if (txSwapStatus.success)
		return {open: true, title: 'SWAP COMPLETED', color: 'bg-success', icon: <Success width={24} height={24} className={'mr-4'} />};
	if (txSwapStatus.error && txSwapStatus.message)
		return {open: true, title: txSwapStatus.message, color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
	if (txSwapStatus.error)
		return {open: true, title: 'SWAP FAILED', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
	if (txApproveStatus.error && txApproveStatus.message)
		return {open: true, title: txApproveStatus.message, color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
	if (txApproveStatus.error)
		return {open: true, title: 'APPROVE TRANSACTION FAILURE', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
	if (Number(fromAmount) > Number(balancesOf[fromAddress]))
		return {open: true, title: 'EXCEEDED BALANCE LIMIT !', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};

	if (Number(options.slippage) >= 3)
		return {open: true, title: 'HEAVY SLIPPAGE, USE IT AT YOUR OWN RISK', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
	if (Number(options.slippage) === 0)
		return {open: true, title: 'NO SLIPPAGE, USE IT AT YOUR OWN RISK', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};

	if ((fromIsBTC || toIsETH || fromIsAAVE || fromIsLINK || fromIsTRI) && toIsUSD)
		return {open: true, title: 'You are moving from a volatile crypto asset to a USD pegged asset', color: 'bg-pending', icon: <Error width={28} height={24} className={'mr-4'} />};
	if ((fromIsBTC || toIsETH || fromIsAAVE || fromIsLINK || fromIsTRI) && toIsEUR)
		return {open: true, title: 'You are moving from a volatile crypto asset to a EUR pegged asset', color: 'bg-pending', icon: <Error width={28} height={24} className={'mr-4'} />};

	if (fromIsUSD && (toIsBTC || toIsETH || toIsAAVE || toIsLINK || toIsTRI))
		return {open: true, title: 'You are moving from a USD pegged asset to a more volatile crypto asset', color: 'bg-pending', icon: <Error width={28} height={24} className={'mr-4'} />};
	if (fromIsEUR && (toIsBTC || toIsETH || toIsAAVE || toIsLINK || toIsTRI))
		return {open: true, title: 'You are moving from a EUR pegged asset to a more volatile crypto asset', color: 'bg-pending', icon: <Error width={28} height={24} className={'mr-4'} />};
	return {open: false, title: '', color: 'bg-yblue', icon: <div/>};
};

const SectionBlockStatus = React.memo(
	function SectionBlockStatus({txApproveStatus, txSwapStatus, options, fromAmount, balancesOf}) {
		const	{fromVault, toVault} = usePaths();
		const	[args, set_args] = React.useState(getArgs({
			fromDisplayName: fromVault?.display_name,
			fromAddress: fromVault?.address,
			toDisplayName: toVault?.display_name,
			txApproveStatus, txSwapStatus, options, fromAmount, balancesOf
		}));

		React.useEffect(() => {
			set_args(getArgs({
				fromDisplayName: fromVault?.display_name,
				fromAddress: fromVault?.address,
				toDisplayName: toVault?.display_name,
				txApproveStatus, txSwapStatus, options, fromAmount, balancesOf
			}));
		}, [txApproveStatus, txSwapStatus, options, fromAmount, balancesOf, fromVault, toVault]);

		return (
			<BlockStatus {...args} />
		);
	}
);

export default SectionBlockStatus;