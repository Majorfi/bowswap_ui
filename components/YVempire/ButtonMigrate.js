/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday August 19th 2021
**	@Filename:				ButtonMigrate.js
******************************************************************************/

import	React, {useState}			from	'react';
import	useWeb3						from	'contexts/useWeb3';
import	{migrateBachTokens}			from	'utils/actions';

function	ButtonMigrate({pairs, selectedTokens, approved, disabled, onCallback}) {
	const	{provider} = useWeb3();
	const	[transactionProcessing, set_transactionProcessing] = useState(false);

	async function	performMigration() {
		if (disabled || transactionProcessing || !approved) {
			return;
		}
		const	actualSelectedTokens = Object.entries(selectedTokens).filter(([, value]) => value === true).map(([key]) => key);
		const	selectedPairs = pairs.filter((p) => actualSelectedTokens.includes(p.uToken.address));
		const	batch = selectedPairs.map(p => [p.service, p.uToken.address]);
		set_transactionProcessing(true);
		onCallback('pending');
		try {
			migrateBachTokens({
				provider: provider,
				contractAddress: process.env.VYEMPIRE_SWAPPER,
				batch: batch
			}, ({error}) => {
				if (error) {
					set_transactionProcessing(false);
					return onCallback('error');
				}
				set_transactionProcessing(false);
				onCallback('success', actualSelectedTokens);
			});
		} catch (error) {
			set_transactionProcessing(false);
			return onCallback('error');
		}
	}

	return (
		<button
			onClick={performMigration}
			className={`w-full h-11 flex items-center justify-center space-x-2 px-6 py-3 text-ybase font-medium rounded-lg focus:outline-none overflow-hidden transition-colors border ${
				disabled || transactionProcessing || !approved ? 'text-ygray-400 bg-white border-ygray-400 cursor-not-allowed' :
					'bg-yblue border-yblue hover:bg-yblue-hover hover:border-yblue-hover text-white cursor-pointer'
			}`}>
			<span>{'Migrate selected'}</span>
		</button>
	);
}

export default ButtonMigrate;