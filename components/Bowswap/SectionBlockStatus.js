import	React					from	'react';
import	{ethers}				from	'ethers';
import	BlockStatus				from	'components/Bowswap/BlockStatus';
import	Success					from	'components/Icons/Success';
import	Error					from	'components/Icons/Error';
import	Pending					from	'components/Icons/Pending';

function	SectionBlockStatus({txApproveStatus, txSwapStatus, slippage, fromAmount, balancesOf, fromVault, toVault}) {
	const	getArgs = () => {
		const	fromIsEUR = (fromVault.display_name.toLowerCase()).includes('eur');
		const	fromIsBTC = (fromVault.display_name.toLowerCase()).includes('btc');
		const	fromIsETH = (fromVault.display_name.toLowerCase()).includes('eth');
		const	fromIsAAVE = (fromVault.display_name.toLowerCase()).includes('aave');
		const	fromIsLINK = (fromVault.display_name.toLowerCase()).includes('link');
		const	fromIsTRI = ((fromVault.display_name.toLowerCase()).includes('tri') || (fromVault.display_name.toLowerCase()).includes('3crypto'));
		const	fromIsUSD = (!fromIsEUR && !fromIsBTC && !fromIsETH && !fromIsAAVE && !fromIsLINK && !fromIsTRI);
		const	toIsEUR = ((toVault?.display_name || '').toLowerCase()).includes('eur');
		const	toIsBTC = ((toVault?.display_name || '').toLowerCase()).includes('btc');
		const	toIsETH = ((toVault?.display_name || '').toLowerCase()).includes('eth');
		const	toIsAAVE = ((toVault?.display_name || '').toLowerCase()).includes('aave');
		const	toIsLINK = ((toVault?.display_name || '').toLowerCase()).includes('link');
		const	toIsTRI = (((toVault?.display_name || '').toLowerCase()).includes('tri') || ((toVault?.display_name || '').toLowerCase()).includes('3crypto'));
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
		if (Number(fromAmount) > Number(ethers.utils.formatUnits(balancesOf[fromVault.address]?.toString() || '0', fromVault.decimals)))
			return {open: true, title: 'EXCEEDED BALANCE LIMIT !', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};

		if (Number(slippage) >= 3)
			return {open: true, title: 'HEAVY SLIPPAGE, USE IT AT YOUR OWN RISK', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
		if (Number(slippage) === 0)
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

	return (
		<BlockStatus {...getArgs()} />
	);
}

export default SectionBlockStatus;