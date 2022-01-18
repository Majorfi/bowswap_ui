import	React, {useState, useEffect}	from	'react';
import	usePaths						from	'contexts/usePaths';
import	InputToken						from	'components/Bowswap/InputToken';
import	ModalVaultList					from	'components/Bowswap/ModalVaultList';
import	{parseAmount}					from	'utils';

function	SectionFromVault({
	fromAmount, set_fromAmount,
	options, set_options,
	balanceOf, disabled
}) {
	const	{fromVault, set_fromVault, allFromVaults} = usePaths();
	const	[isInit, set_isInit] = useState(false);

	useEffect(() => {
		if (!isInit && (fromAmount !== '' && fromAmount !== '0.0' && Number(fromAmount) !== 0)) {
			set_fromAmount(parseAmount(fromAmount || '0'));
			set_isInit(true);
		} else if (!isInit && balanceOf !== '0') {
			set_isInit(true);
		}
	}, [isInit, balanceOf]);

	return (
		<section aria-label={'FROM_VAULT'}>
			<label className={'font-medium text-ybase text-ygray-900 pl-0.5'}>{'From Vault'}</label>
			<div className={'flex flex-col md:flex-row items-start justify-center space-y-2 md:space-y-0 md:space-x-4 w-full'}>
				<div className={'w-full md:w-4/11'}>
					<ModalVaultList
						label={'Select from vault'}
						disabled={disabled}
						vaults={allFromVaults}
						value={fromVault}
						set_value={set_fromVault}
						set_input={(v) => set_fromAmount(parseAmount((v || '0')))} />
				</div>
				<div className={'w-full md:w-7/11'}>
					<InputToken
						disabled={disabled}
						balanceOf={balanceOf}
						value={fromAmount}
						set_value={set_fromAmount}
						options={options}
						set_options={set_options} />
				</div>
			</div>
		</section>
	);
}

export default SectionFromVault;