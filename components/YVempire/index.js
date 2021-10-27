import	React, {useState, useEffect}		from	'react';
import	{ethers}							from	'ethers';
import	useWeb3								from	'contexts/useWeb3';
import	useAccount							from	'contexts/useAccount';
import	BlockStatus							from	'components/YVempire/BlockStatus';
import	ButtonMigrate						from	'components/YVempire/ButtonMigrate';
import	ButtonApprove						from	'components/YVempire/ButtonApprove';
import	TableHead							from	'components/YVempire/TableHead';
import	TableBody							from	'components/YVempire/TableBody';
import	Success								from	'components/Icons/Success';
import	Error								from	'components/Icons/Error';
import	Pending								from	'components/Icons/Pending';

function	YVempire() {
	const	{address} = useWeb3();
	const	{balancesOf, allowances, set_balancesOf, set_allowances, yearnVaultData, yVempireData} = useAccount();
	const	[, set_nonce] = useState(0);
	const	[selectedTokens, set_selectedTokens] = useState([]);

	const	[txApproveStatus, set_txApproveStatus] = useState({none: true, pending: false, success: false, error: false, step: ''});
	const	[txMigrateStatus, set_txMigrateStatus] = useState({none: true, pending: false, success: false, error: false});

	/**************************************************************************
	**	Reset the state of this componant on address change
	**
	**	@TRIGGER : any time the address changes.
	**************************************************************************/
	useEffect(() => {
		set_selectedTokens([]);
		set_txApproveStatus({none: true, pending: false, success: false, error: false, step: ''});
		set_txMigrateStatus({none: true, pending: false, success: false, error: false});
		set_nonce(n => n + 1);
	}, [address]);

	async function resetUTokenBalances(selectedTokensList) {
		const	migrated = {};
		selectedTokensList.forEach(each => migrated[each] = ethers.BigNumber.from(0));
		set_balancesOf(b => ({...b, ...migrated}));
		set_txApproveStatus({none: true, pending: false, success: false, error: false, step: ''});
		set_txMigrateStatus({none: true, pending: false, success: false, error: false});
		set_selectedTokens([]);
		set_nonce(n => n + 1);
	}

	function	renderMiddlePart() {
		const	getArgs = () => {
			if (txApproveStatus.pending)
				return {open: true, title: txApproveStatus.step || 'PENDING...', color: 'bg-pending', icon: <Pending width={24} height={24} className={'mr-4'} />};
			if (txMigrateStatus.pending)
				return {open: true, title: 'PENDING...', color: 'bg-pending', icon: <Pending width={24} height={24} className={'mr-4'} />};
			if (txApproveStatus.success && !txApproveStatus.hide)
				return {open: true, title: 'APPROVE COMPLETED', color: 'bg-success', icon: <Success width={24} height={24} className={'mr-4'} />};
			if (txMigrateStatus.success)
				return {open: true, title: 'MIGRATION COMPLETED', color: 'bg-success', icon: <Success width={24} height={24} className={'mr-4'} />};
			if (txApproveStatus.error && txApproveStatus.message)
				return {open: true, title: txApproveStatus.message.toUpperCase(), color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
			if (txMigrateStatus.error)
				return {open: true, title: 'MIGRATION FAILED', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
			if (txApproveStatus.error)
				return {open: true, title: 'APPROVE TRANSACTION FAILURE', color: 'bg-error', icon: <Error width={28} height={24} className={'mr-4'} />};
			return {open: false, title: '', color: 'bg-yblue', icon: <div/>};
		};
		return (
			<BlockStatus {...getArgs()} />
		);
	}

	return (
		<div className={'bg-white rounded-xl shadow-base px-4 pt-4 w-full relative'}>
			<div className={'relative withBeforeGradient'}>
				<div className={'overflow-scroll relative vampireList pb-4'} style={{minHeight: 384, maxHeight: 384}}>
					<TableHead from={'Defi'} to={'Yearn'} />
					<TableBody 
						elements={yVempireData}
						balancesOf={balancesOf}
						selectedTokens={selectedTokens}
						onSelectToken={(selectedAddress) => {
							const	_selectedTokens = selectedTokens;
							_selectedTokens[selectedAddress] = !_selectedTokens[selectedAddress];
							if (_selectedTokens[selectedAddress]) {
								set_txApproveStatus({none: true, pending: false, success: false, error: false, step: ''});
							}
							if (txApproveStatus.success) {
								const	someSelected = Object.values(selectedTokens).some(e => e === true);
								if (!someSelected) {
									set_txApproveStatus({none: true, pending: false, success: false, error: false, step: ''});
								}
							}

							set_selectedTokens(_selectedTokens);
						}}
						yearnVaultData={yearnVaultData}
						isApproved={txApproveStatus.success}
						set_nonce={set_nonce} />
				</div>
				<div className={'absolute inset-0 z-50 pointer-events-none'}>
					{renderMiddlePart()}
				</div>
			</div>

			<div className={'w-full py-4 bg-white flex justify-center items-end'}>
				<div className={'flex flex-row justify-center w-full space-x-4'}>
					<ButtonApprove
						pairs={yVempireData}
						selectedTokens={selectedTokens}
						balancesOf={balancesOf}
						allowances={allowances}
						approved={txApproveStatus.success}
						onStepComplete={approval => set_allowances(b => ({...b, ...approval}))}
						onStep={step => set_txApproveStatus(status => ({...status, step}))}
						onCallback={(type, message) => {
							set_txApproveStatus({none: false, pending: type === 'pending', error: type === 'error', success: type === 'success', message});
							if (type === 'error') {
								setTimeout(() => set_txApproveStatus((s) => s.error ? {none: true, pending: false, error: false, success: false} : s), 2500);
							}
							if (type === 'success') {
								setTimeout(() => set_txApproveStatus({none: false, pending: false, error: false, success: true, hide: true}), 2500);
							}
						}}
					/>
					<ButtonMigrate
						pairs={yVempireData}
						selectedTokens={selectedTokens}
						approved={txApproveStatus.success}
						onCallback={(type, selectedTokensList) => {
							set_txMigrateStatus({none: false, pending: type === 'pending', error: type === 'error', success: type === 'success'});
							if (type === 'error') {
								setTimeout(() => set_txMigrateStatus((s) => s.error ? {none: true, pending: false, error: false, success: false} : s), 2500);
							}
							if (type === 'success') {
								resetUTokenBalances(selectedTokensList);
								set_txApproveStatus({none: true, pending: false, success: false, error: false, step: ''});
								setTimeout(() => {
									set_txMigrateStatus({none: true, pending: false, error: false, success: false});
								}, 2500);
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default YVempire;
