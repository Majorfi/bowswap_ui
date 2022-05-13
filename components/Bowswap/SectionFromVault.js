import	React, {useState}				from	'react';
import	{ethers}						from	'ethers';
import	useAccount						from	'contexts/useAccount';
import	InputToken						from	'components/Bowswap/InputToken';
import	ModalVaultList					from	'components/Bowswap/ModalVaultList';

function parseAmount(amount) {
	let		_value = amount.replaceAll('..', '.').replaceAll(/[^0-9.]/g, '');
	const	[dec, frac] = _value.split('.');
	if (frac) _value = `${dec}.${frac.slice(0, 12)}`;

	if (_value === '.') {
		return ('0.');
	} else if (_value.length > 0 && _value[0] === '-') {
		return ('');
	} else if (_value.length >= 2 && _value[0] === '0' && _value[1] !== '.') {
		return (_value.slice(1) || '');
	} else {
		return (_value || '');
	}
}

function	SectionFromVault({
	vaults, fromVault, set_fromVault,
	fromAmount, set_fromAmount,
	slippage, set_slippage,
	donation, set_donation,
	fromCounterValue, disabled,
	yearnVaultData
}) {
	const	{balancesOf, balancesNonce, isLoaded} = useAccount();
	const	[currentFromAmount, set_currentFromAmount] = React.useState('');
	const	[isInit, set_isInit] = useState(false);
	const	[balanceOf, set_balanceOf] = React.useState(ethers.constants.Zero);
	
	React.useEffect(() => set_currentFromAmount(fromAmount), [fromAmount]);
	React.useEffect(() => {
		if (fromVault.address) {
			console.log(balancesOf[fromVault.address]?.toString() || '0');
			set_balanceOf(balancesOf[fromVault.address]?.toString() || '0');
		}
	}, [balancesOf, balancesNonce, fromVault?.address]);

	React.useEffect(() => {
		if (!isInit && (fromAmount !== '' && fromAmount !== '0.0' && Number(fromAmount) !== 0)) {
			set_fromAmount(parseAmount(fromAmount));
			set_isInit(true);
		} else if (!isInit && balanceOf !== '0') {
			set_isInit(true);
		}
	}, [isInit, fromAmount, balanceOf, isLoaded]);

	return (
		<section aria-label={'FROM_VAULT'}>
			<label className={'font-medium text-ybase text-ygray-900 pl-0.5'}>{'From Vault'}</label>
			<div className={'flex flex-col md:flex-row items-start justify-center space-y-2 md:space-y-0 md:space-x-4 w-full'}>
				<div className={'w-full md:w-4/11'}>
					<ModalVaultList
						isFrom
						label={'Select from vault'}
						disabled={disabled}
						vaults={vaults}
						yearnVaultData={yearnVaultData}
						value={fromVault}
						set_value={set_fromVault}
						set_input={(v) => set_fromAmount(parseAmount(ethers.utils.formatUnits((v || '0'), fromVault.decimals)))} />
				</div>
				<div className={'w-full md:w-7/11'}>
					<InputToken
						disabled={disabled}
						balanceOf={balanceOf}
						decimals={fromVault?.decimals || 18}
						fromCounterValue={fromCounterValue}
						value={currentFromAmount}
						set_value={set_fromAmount}
						slippage={slippage}
						set_slippage={set_slippage}
						donation={donation}
						set_donation={set_donation} />
				</div>
			</div>
		</section>
	);
}

export default SectionFromVault;