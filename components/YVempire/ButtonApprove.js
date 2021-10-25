import	React, {useState}			from	'react';
import	{ethers}					from	'ethers';
import	useWeb3						from	'contexts/useWeb3';
import	{asyncForEach}				from	'utils';
import	{approveToken}				from	'utils/actions';

function	ButtonApprove({pairs, selectedTokens, balancesOf, allowances, approved, disabled, onStep, onStepComplete, onCallback}) {
	const	{provider} = useWeb3();
	const	[transactionProcessing, set_transactionProcessing] = useState(false);

	async function	performApprove(event) {
		if (!Object.values(selectedTokens).some(Boolean) || transactionProcessing) {
			return;
		}
		const	actualSelectedTokens = Object.entries(selectedTokens).filter(([, value]) => value === true).map(([key]) => key);
		const	selectedPairs = pairs.filter((p) => actualSelectedTokens.includes(p.uToken.address));
		let		isBroken = false;
		let		message = undefined;
		event.preventDefault();
		event.stopPropagation();
		if (disabled || transactionProcessing) {
			return;
		}
		set_transactionProcessing(true);
		onCallback('pending');
		await asyncForEach(selectedPairs, async (pair) => {
			if (isBroken) {
				return;
			}
			const	balanceOf = balancesOf[pair.uToken.address];
			const	allowance = allowances[pair.uToken.address];
			if (ethers.BigNumber.from(allowance || 0).gte(balanceOf)) {
				return; //already approved
			}
			const	approval = balanceOf.add(balanceOf.mul(3).div(100)); //balance + 3% because of mutable aToken balance;
			try {
				onStep(`APPROVING ${pair.uToken.name}...`);
				const	toVaultContract = new ethers.Contract(pair.yvToken.address, ['function depositLimit() view returns (uint256)'], provider);
				const	depositLimit = await toVaultContract.depositLimit();

				if (depositLimit.lt(approval)) {
					isBroken = true;
					set_transactionProcessing(false);
					message = 'Not enough limit in Vault. Please complain to Facu.';
					return;
				}

				await approveToken({
					provider: provider,
					contractAddress: pair.uToken.address,
					amount: approval,
					from: process.env.VYEMPIRE_SWAPPER
				}, ({error}) => {
					if (error) {
						isBroken = true;
						return;
					}
					onStepComplete({[pair.uToken.address]: approval}, pair.uToken.address);
				});	
			} catch (error) {
				isBroken = true;
				return;
			}
		});
		if (isBroken) {
			set_transactionProcessing(false);
			return onCallback('error', message);
		}
		set_transactionProcessing(false);
		onCallback('success');
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
				!Object.values(selectedTokens).some(Boolean) || transactionProcessing ? 'text-ygray-400 bg-white border-ygray-400 cursor-not-allowed' :
					'bg-yblue border-yblue hover:bg-yblue-hover hover:border-yblue-hover text-white cursor-pointer'
			}`}>
			<span>{'Approve selected'}</span>
		</button>
	);
}

export default ButtonApprove;