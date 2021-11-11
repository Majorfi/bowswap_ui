import	React						from	'react';
import	InputTokenDisabled			from	'components/Bowswap/InputTokenDisabled';
import	ModalVaultList				from	'components/Bowswap/ModalVaultList';

function	SectionToVault({
	vaults, toVault, set_toVault,
	expectedReceiveAmount, toCounterValue, balanceOf,
	slippage, isFetchingExpectedReceiveAmount, disabled,
	yearnVaultData
}) {
	return (
		<section aria-label={'TO_VAULT'}>
			<label className={'font-medium text-ybase text-ygray-900 pl-0.5'}>{'To Vault'}</label>
			<div className={'flex flex-col md:flex-row items-start justify-center space-y-2 md:space-y-0 md:space-x-4 w-full'}>
				<div className={'w-full md:w-4/11'}>
					<ModalVaultList
						label={'Select to vault'}
						disabled={disabled}
						vaults={vaults}
						yearnVaultData={yearnVaultData}
						value={toVault}
						set_value={set_toVault}
						set_input={() => null} />
				</div>
				<div className={'w-full md:w-7/11'}>
					<InputTokenDisabled
						value={expectedReceiveAmount}
						toCounterValue={toCounterValue}
						slippage={slippage}
						balanceOf={balanceOf}
						decimals={toVault.decimals}
						isFetchingExpectedReceiveAmount={isFetchingExpectedReceiveAmount} />
				</div>
			</div>
		</section>
	);
}

export default SectionToVault;