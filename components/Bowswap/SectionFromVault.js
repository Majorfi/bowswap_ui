import	React, {useState, useEffect}	from	'react';
import	{ethers}						from	'ethers';
import	InputToken						from	'components/Bowswap/InputToken';
import	ModalVaultList					from	'components/Bowswap/ModalVaultList';

function	SectionFromVault({
	vaults, fromVault, set_fromVault,
	fromAmount, set_fromAmount,
	slippage, set_slippage,
	donation, set_donation,
	fromCounterValue, balanceOf, disabled,
	yearnVaultData
}) {
	const	[isInit, set_isInit] = useState(false);

	function	updateInputValue(newValue) {
		let		_value = newValue.replaceAll('..', '.').replaceAll(/[^0-9.]/g, '');
		const	[dec, frac] = _value.split('.');
		if (frac) _value = `${dec}.${frac.slice(0, 12)}`;

		if (_value === '.') {
			set_fromAmount('0.');
		} else if (_value.length > 0 && _value[0] === '-') {
			set_fromAmount('');
		} else if (_value.length >= 2 && _value[0] === '0' && _value[1] !== '.') {
			set_fromAmount(_value.slice(1) || '');
		} else {
			set_fromAmount(_value || '');
		}
	}

	useEffect(() => {
		if (!isInit && (fromAmount !== '' && fromAmount !== '0.0' && Number(fromAmount) !== 0)) {
			updateInputValue(fromAmount);
			set_isInit(true);
		}
		else if (!isInit && balanceOf !== '0') {
			set_fromAmount(ethers.utils.formatUnits(balanceOf, fromVault.decimals));
			set_isInit(true);
		}
	}, [isInit, balanceOf, fromAmount]);

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
						set_input={(v) => {
							updateInputValue(ethers.utils.formatUnits(v, fromVault.decimals));
						}} />
				</div>
				<div className={'w-full md:w-7/11'}>
					<InputToken
						disabled={disabled}
						balanceOf={balanceOf}
						decimals={fromVault.decimals}
						fromCounterValue={fromCounterValue}
						value={fromAmount}
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