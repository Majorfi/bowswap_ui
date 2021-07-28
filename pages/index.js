/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday July 4th 2021
**	@Filename:				index.js
******************************************************************************/

import	React, {useState, useEffect, useCallback}	from	'react';
import	{ethers}									from	'ethers';
import	Popup										from	'reactjs-popup';
import	{ArrowCircleRightIcon, CheckIcon, XIcon}	from	'@heroicons/react/solid';
import	useWeb3										from	'contexts/useWeb3';
import	{approveToken, depositToken}				from	'utils/actions';
import	InputToken									from	'components/InputToken';
import	ModalVaultList								from	'components/ModalVaultList';

function	SectionFromVault({vaults, fromVault, set_fromVault, fromAmount, set_fromAmount, fromCounterValue, balanceOf}) {
	return (
		<section aria-label={'FROM_VAULT'}>
			<div className={'flex flex-col md:flex-row items-start justify-center md:space-x-4 w-full'}>
				<div className={'w-full md:w-2/5'}>
					<label className={'font-medium text-sm text-gray-800'}>{'From Vault'}</label>
					<ModalVaultList
						vaults={vaults}
						value={fromVault}
						set_value={set_fromVault} />
				</div>
				<div className={'w-full md:w-3/5'}>
					<label className={'font-normal text-xs text-gray-600 hidden md:flex flex-row items-center pl-1 mt-1 mb-1'}>
						<p
							className={'cursor-pointer inline'}
							onClick={() => set_fromAmount(ethers.utils.formatUnits(balanceOf, fromVault.decimals))}>
							{`Balance: ${Number(ethers.utils.formatUnits(balanceOf, fromVault.decimals))} ${fromVault.symbol}`}
						</p>
					</label>
					<InputToken
						balanceOf={balanceOf}
						decimals={fromVault.decimals}
						value={fromAmount}
						set_value={set_fromAmount} />
					<label className={'font-normal text-xs text-gray-600 flex flex-row items-center pl-1 mt-1 mb-1 md:hidden'}>
						<p
							className={'inline cursor-pointer'}
							onClick={() => set_fromAmount(ethers.utils.formatUnits(balanceOf, fromVault.decimals))}>
							{`Balance: ${Number(ethers.utils.formatUnits(balanceOf, fromVault.decimals)).toFixed(8)} - ($${(fromCounterValue * Number(fromAmount)).toFixed(2)})`}
						</p>
					</label>
				</div>
			</div>
		</section>
	);
}

function	SectionToVault({vaults, toVault, set_toVault, expectedReceiveAmount, toCounterValue}) {
	return (
		<section aria-label={'TO_VAULT'} className={'w-full'}>
			<label className={'font-medium text-sm text-gray-800'}>{'To Vault'}</label>
			<ModalVaultList
				vaults={vaults}
				value={toVault}
				set_value={set_toVault} />
			<div className={'relative w-full text-left bg-gray-50 rounded-lg border cursor-default focus:outline-none flex flex-row justify-between border-gray-200 text-gray-800 h-15 md:hidden'}>
				<input
					value={expectedReceiveAmount}
					disabled
					readOnly
					style={{background: 'transparent'}}
					className={'block truncate py-4 w-full text-lg'}
					type={'number'} />
			</div>
			<label className={'font-normal text-xs text-gray-600 flex flex-row items-center pl-1 mt-1 mb-1 md:hidden'}>
				<p>{`Value: $${(toCounterValue * Number(expectedReceiveAmount)).toFixed(2)}`}</p>
			</label>

		</section>
	);
}

function	SectionReceipt({fromVault, toVault, fromAmount, fromCounterValue, toCounterValue, expectedReceiveAmount}) {
	return (
		<div className={'mt-6 pt-6 border-t border-dashed border-gray-200 hidden md:block'}>
			<div className={'bg-gray-50 rounded-lg p-6 space-y-6'}>
				<div className={'flex flex-row'}>
					<div className={'mr-4'}>
						<div className={'bg-blue-500 w-16 h-16 flex justify-center items-center rounded-lg'}>
							<svg aria-hidden={'true'} focusable={'false'} className={'text-white w-6 h-6'} role={'img'} xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 448 512'}><path fill={'currentColor'} d={'M444.4 98.21l-143.1 351.1C292.9 468.5 275.2 480 256 480c-28.84 0-48.02-23.1-48.02-47.1v-159.1H48c-22.94 0-42.67-16.22-47.09-38.75c-4.437-22.5 7.688-44.1 28.92-53.69l351.1-143.1c17.86-7.343 38.45-3.188 52.11 10.5C447.6 59.74 451.8 80.3 444.4 98.21z'}></path></svg>
						</div>
					</div>
					<div className={'py-0.5 w-full'}>
						<div className={'w-full flex justify-between items-center'}>
							<p className={'font-medium text-lg text-gray-600'}>{fromVault.symbol}</p>
							<Popup
								position={'top center'}
								on={['hover', 'focus']}
								arrow={false}
								trigger={
									<p className={`font-bold text-base text-red-600 cursor-help ${fromAmount === 0 || fromAmount === '0' ? 'opacity-0' : ''}`}>{`-${Number(fromAmount).toFixed(4)}`}</p>
								}>
								<div className={'bg-white border border-gray-200 text-gray-800 px-2 py-1 rounded-md mb-1'}>
									<p className={'text-xs'}>{`-${fromAmount} ${fromVault.symbol}`}</p>
								</div>
							</Popup>
						</div>
						<div className={'border-t border-gray-200 mt-1 pt-1'}>
							<p className={'inline font-medium text-sm text-gray-500'}>{`~$${(fromCounterValue * Number(fromAmount)).toFixed(2)}`}</p>&nbsp;
							<p className={'inline font-normal text-xs text-gray-500'}>{`($${(Number(fromCounterValue).toFixed(4))} per token)`}</p>
						</div>
					</div>
				</div>

				<div className={'flex flex-row'}>
					<div className={'mr-4'}>
						<div className={'bg-green-500 w-16 h-16 flex justify-center items-center rounded-lg transform rotate-90'}>
							<svg aria-hidden={'true'} focusable={'false'} className={'text-white w-6 h-6'} role={'img'} xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 448 512'}><path fill={'currentColor'} d={'M444.4 98.21l-143.1 351.1C292.9 468.5 275.2 480 256 480c-28.84 0-48.02-23.1-48.02-47.1v-159.1H48c-22.94 0-42.67-16.22-47.09-38.75c-4.437-22.5 7.688-44.1 28.92-53.69l351.1-143.1c17.86-7.343 38.45-3.188 52.11 10.5C447.6 59.74 451.8 80.3 444.4 98.21z'}></path></svg>
						</div>
					</div>
					<div className={'py-0.5 w-full'}>
						<div className={'w-full flex justify-between items-center'}>
							<p className={'font-medium text-lg text-gray-600'}>{toVault.symbol}</p>
							<Popup
								position={'top center'}
								on={['hover', 'focus']}
								arrow={false}
								trigger={
									<p className={'font-bold text-base text-green-600 cursor-help'}>{`+${Number(expectedReceiveAmount).toFixed(4)}`}</p>
								}>
								<div className={'bg-white border border-gray-200 text-gray-800 px-2 py-1 rounded-md mb-1'}>
									<p className={'text-xs'}>{`-${expectedReceiveAmount} ${toVault.symbol}`}</p>
								</div>
							</Popup>
						</div>
						<div className={'border-t border-gray-200 mt-1 pt-1'}>
							<p className={'inline font-medium text-sm text-gray-500'}>{`~$${(toCounterValue * Number(expectedReceiveAmount)).toFixed(2)}`}</p>&nbsp;
							<p className={'inline font-normal text-xs text-gray-500'}>{`($${(Number(toCounterValue).toFixed(4))} per token)`}</p>
						</div>
					</div>
				</div>
			</div>

		</div>
	);
}

function	SectionAction({fromVault, fromAmount}) {
	const	{provider} = useWeb3();
	const	[txStep, set_txStep] = useState('Approve');
	const	[txStatus, set_txStatus] = useState({none: true, pending: false, success: false, error: false});

	function	performDeposit(amount) {
		set_txStatus({none: false, pending: true, success: false, error: false});
		depositToken({
			provider: provider,
			contractAddress: fromVault.address,
			amount: amount
		}, ({error}) => {
			if (error) {
				return set_txStatus({none: false, pending: false, success: false, error: true});
			}
			set_txStatus({none: false, pending: false, success: true, error: false});
		});
	}

	function	performApprove() {
		set_txStatus({none: false, pending: true, success: false, error: false});
		approveToken({
			provider: provider,
			contractAddress: fromVault.tokenAddress,
			amount: ethers.utils.parseUnits(fromAmount, fromVault.decimals),
			from: fromVault.address
		}, ({error, data}) => {
			if (error) {
				return set_txStatus({none: false, pending: false, success: false, error: true});
			}
			set_txStep('Deposit');
			set_txStatus({none: false, pending: false, success: true, error: false});
			performDeposit(data);
		});
	}

	return (
		<div className={'flex flex-row justify-end mt-6'}>
			<button
				onClick={performApprove}
				className={`w-24 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium rounded-md focus:outline-none overflow-hidden ${
					txStatus.pending ? 'text-gray-500 bg-gray-100 cursor-not-allowed' :
						txStatus.success ? 'bg-green-500 text-white cursor-not-allowed' :
							txStatus.error ? 'bg-red-500 text-white cursor-not-allowed' :
								'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
				}`}>
				{txStatus.none === true ? (
					<span>{txStep}</span>
				) : null}
				{txStatus.pending === true ? (
					<svg className={'animate-spin h-5 w-5'} xmlns={'http://www.w3.org/2000/svg'} fill={'none'} viewBox={'0 0 24 24'}>
						<circle className={'opacity-25'} cx={'12'} cy={'12'} r={'10'} stroke={'currentColor'} strokeWidth={'4'}></circle>
						<path className={'opacity-75'} fill={'currentColor'} d={'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'}></path>
					</svg>
				) : null}
				{txStatus.success === true ? <CheckIcon className={'w-5 h-5'} /> : null}
				{txStatus.error === true ? <XIcon className={'w-5 h-5'} /> : null}
			</button>
		</div>
	);
}

function	Index({vaults}) {
	const	{address, provider} = useWeb3();
	const	[balanceOf, set_balanceOf] = useState('0');

	const	[fromVault, set_fromVault] = useState(vaults[0]);
	const	[toVault, set_toVault] = useState(vaults[1]);
	const	[fromCounterValue, set_fromCounterValue] = useState(0);
	const	[toCounterValue, set_toCounterValue] = useState(0);
	const	[fromAmount, set_fromAmount] = useState('1554.547');
	const	[expectedReceiveAmount] = useState('546.547');


	const	fetchCRVVirtualPrice = useCallback(async () => {
		if (!provider)
			return;

		if (fromVault) {
			const	fromPool = new ethers.Contract(fromVault.poolAddress, ['function get_virtual_price() public view returns (uint256)'], provider);
			const	virtualPrice = await fromPool.get_virtual_price();
			set_fromCounterValue(ethers.utils.formatEther(virtualPrice));
		}
		if (toVault) {
			const	toPool = new ethers.Contract(toVault.poolAddress, ['function get_virtual_price() public view returns (uint256)'], provider);
			const	virtualPrice = await toPool.get_virtual_price();
			set_toCounterValue(ethers.utils.formatEther(virtualPrice));
		}
	}, [fromVault, provider, toVault]);

	const	fetchCRVBalance = useCallback(async () => {
		if (!provider)
			return;
		const	token = '0x38e4adb44ef08f22f5b5b76a8f0c2d0dcbe7dca1' || fromVault.tokenAddress;
		const	fromToken = new ethers.Contract(token, ['function balanceOf(address) public view returns (uint256)'], provider);
		const	_balanceOf = await fromToken.balanceOf(address);
		set_balanceOf(_balanceOf);
	}, [address, fromVault.tokenAddress, provider]);

	useEffect(() => {
		fetchCRVVirtualPrice();
		fetchCRVBalance();
	}, [fetchCRVBalance, fetchCRVVirtualPrice]);


	function	renderXsReceipt() {
		return (
			<div className={'bg-white rounded-xl shadow-md p-6 w-full relative overflow-hidden space-y-2 block md:hidden mt-6'}>
			</div>
		);
	}

	return (
		<section className={'mt-12 pt-16 w-full md:px-12 px-4 space-y-12 mb-64 z-10 relative'}>
			<div className={'flex justify-center items-center'}>
				<div className={'w-full max-w-2xl'}>
					<div className={'bg-white rounded-xl shadow-md p-6 pt-8 w-full relative overflow-hidden space-y-0 md:space-y-6'}>
						<SectionFromVault
							vaults={vaults}
							fromVault={fromVault}
							set_fromVault={set_fromVault}
							fromAmount={fromAmount}
							set_fromAmount={set_fromAmount}
							fromCounterValue={fromCounterValue}
							balanceOf={balanceOf} />

						<div className={'flex md:hidden w-full justify-center pt-4'}>
							<ArrowCircleRightIcon className={'w-8 h-8 text-gray-100 transform rotate-90'} />
						</div>

						<SectionToVault
							vaults={vaults}
							toVault={toVault}
							set_toVault={set_toVault}
							expectedReceiveAmount={expectedReceiveAmount}
							toCounterValue={toCounterValue} />
						
						<SectionReceipt
							fromVault={fromVault}
							toVault={toVault}
							fromAmount={fromAmount}
							fromCounterValue={fromCounterValue}
							toCounterValue={toCounterValue}
							expectedReceiveAmount={expectedReceiveAmount} />

						<SectionAction
							fromVault={fromVault}
							fromAmount={fromAmount} />
					</div>

					{renderXsReceipt()}
				</div>
			</div>

		</section>
	);
}

export default Index;
