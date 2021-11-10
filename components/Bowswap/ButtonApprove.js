import	React, {useState, useEffect}				from	'react';
import	{ethers}									from	'ethers';
import	useWeb3										from	'contexts/useWeb3';
import	{approveToken, signTransaction}				from	'utils/actions';

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

export default ButtonApprove;