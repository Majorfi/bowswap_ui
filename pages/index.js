/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday July 4th 2021
**	@Filename:				index.js
******************************************************************************/

import	React, {useState, useEffect, useCallback, Fragment}		from	'react';
import	Image													from	'next/image';
import	{ethers}												from	'ethers';
import	Popup													from	'reactjs-popup';
import	{ArrowCircleRightIcon, CheckIcon, RefreshIcon, XIcon}	from	'@heroicons/react/solid';
import	useWeb3													from	'contexts/useWeb3';
import	{approveToken, depositToken}							from	'utils/actions';
import	{toAddress}												from	'utils';
import	{Transition}											from	'@headlessui/react';
import	{SelectorIcon}											from	'@heroicons/react/solid';
import	{Dialog}												from	'@headlessui/react';
import	{List}													from	'react-virtualized';

function VaultList({vaults, value, set_value}) {
	const [open, set_open] = useState(false);
	const [filter, set_filter] = useState('');
	const [filteredVaultList, set_filteredVaultList] = useState(vaults);

	useEffect(() => {
		if (filter === '') {
			set_filteredVaultList(vaults);
		} else {
			set_filteredVaultList((vaults).filter(e => (
				(e.name).toLowerCase().includes(filter.toLowerCase()) ||
				(e.symbol).toLowerCase().includes(filter.toLowerCase()) ||
				toAddress(e.address).includes(toAddress(filter))
			)));
		}
	}, [filter, vaults]);

	return (
		<div className={'w-full'}>
			<div className={'relative'}>
				<button
					onClick={() => set_open(true)}
					className={'relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg border border-gray-200 focus:outline-none cursor-pointer h-15'}>
					<div className={'flex flex-row items-center'}>
						<Image
							src={value.icon}
							alt={value?.displayName || value?.name}
							objectFit={'contain'}
							loading={'eager'}
							width={48}
							height={48} />
						<span className={'block truncate ml-4'}>
							{value?.symbol}
						</span>
					</div>
					<span className={'absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'}>
						<SelectorIcon className={'w-5 h-5 text-gray-400'} aria-hidden={'true'} />
					</span>
				</button>
			</div>
			<Transition.Root show={open} as={Fragment}>
				<Dialog as={'div'} static className={'fixed z-10 inset-0 overflow-hidden'} open={open} onClose={set_open}>
					<div className={'flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center md:block sm:p-0 sm:flex'}>
						<Transition.Child
							as={Fragment}
							enter={'ease-out duration-300'}
							enterFrom={'opacity-0'}
							enterTo={'opacity-100'}
							leave={'ease-in duration-200'}
							leaveFrom={'opacity-100'}
							leaveTo={'opacity-0'}>
							<Dialog.Overlay className={'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'} />
						</Transition.Child>
						<span className={'hidden sm:inline-block sm:align-middle sm:h-screen'} aria-hidden={'true'}>
					&#8203;
						</span>
						<Transition.Child
							as={Fragment}
							enter={'ease-out duration-300'}
							enterFrom={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}
							enterTo={'opacity-100 translate-y-0 sm:scale-100'}
							leave={'ease-in duration-200'}
							leaveFrom={'opacity-100 translate-y-0 sm:scale-100'}
							leaveTo={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}>
							<div className={'inline-block bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all max-w-lg p-6 sm:mb-12 md:mt-24 lg:mt-24'}>
								<div>
									<div className={'p-2 relative'}>
										<div className={'absolute top-1 right-1'}>
											<XIcon
												onClick={() => set_open(false)}
												className={'w-5 h-5 text-gray-300 hover:text-gray-500 cursor-pointer'} />
										</div>
										<Dialog.Title as={'h3'} className={'text-lg font-medium text-gray-900 mb-6'}>
											{'Select from vault'}
										</Dialog.Title>
										<div className={'mb-1'}>
											<input
												type={'text'}
												name={'vaultName'}
												id={'vaultName'}
												value={filter}
												onChange={(e) => set_filter(e.target.value)}
												placeholder={'Filter or address'}
												className={'block w-full border-gray-300 rounded-md bg-gray-100 text-lg'} />
										</div>
										<div className={'mt-2 h-96 overflow-scroll'}>
											<div className={'list'}>
												<List
													width={464}
													height={384}
													className={'focus:outline-none'}
													rowHeight={74}
													rowRenderer={({index, key, style}) => {
														return (
															<div
																onClick={() => {
																	set_value(filteredVaultList[index]);
																	set_open(false);
																}}
																key={key}
																style={style}
																className={'flex flex-row hover:bg-gray-100 cursor-pointer items-center rounded-lg px-4 focus:outline-none'}>
																<Image
																	src={filteredVaultList[index]?.icon || ''}
																	alt={filteredVaultList[index]?.displayName || filteredVaultList[index]?.name}
																	objectFit={'contain'}
																	loading={'eager'}
																	width={48}
																	height={48} />
																<span className={'content block truncate ml-4'}>
																	{filteredVaultList[index]?.symbol}
																</span>
															</div>
														);
													}}
													rowCount={filteredVaultList.length} />
											</div>
										</div>
									</div>
								</div>
							</div>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition.Root>
		</div>
	);
}

function	InputDeposit({value, set_value, balanceOf, exactBalanceOf, decimals}) {
	const [txStatus, set_txStatus] = useState({none: true, pending: false, success: false, error: false});

	useEffect(() => {
		if (txStatus.error) {
			set_txStatus({none: true, pending: false, success: false, error: false});
		}
	}, [value, txStatus.error]);

	return (
		<div className={'w-full'}>
			<div className={'relative w-full text-left bg-white rounded-lg border cursor-default focus:outline-none flex flex-row justify-between border-gray-200 text-gray-800 h-15'}>
				<input
					value={value}
					onChange={(e) => {
						if (e.target.value.length > 0 && e.target.value[0] === '-') {
							set_value('0');
						} else if (Number(e.target.value) > Number(ethers.utils.formatUnits(balanceOf, decimals))) {
							set_value(ethers.utils.formatUnits(balanceOf, decimals) || '0');
						} else if (e.target.value.length >= 2 && e.target.value[0] === '0' && e.target.value[1] !== '.') {
							set_value(e.target.value.slice(1) || '0');
						} else {
							set_value(e.target.value || '0');
						}
						set_txStatus({none: true, pending: false, success: false, error: false});
					}}
					placeholder={''}
					style={{background: 'transparent'}}
					className={'block truncate py-4 w-full text-lg'}
					type={'number'}
					min={0} />

				<div className={'flex border-l border-gray-200'}>
					<button
						onClick={() => set_value(ethers.utils.formatUnits(balanceOf, decimals))}
						className={'items-center space-x-2 px-4 py-2 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-600 focus:outline-none'}>
						<span>{'max'}</span>
					</button>
				</div>

			</div>
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
	const	[amount, set_amount] = useState('1554.547');
	const	[expectedReceiveAmount] = useState('546.547');

	const	[txStep, set_txStep] = useState('Approve');
	const	[txStatus, set_txStatus] = useState({none: true, pending: false, success: false, error: false});

	const	[layout, set_layout] = useState(1); //TEMP: DESIGN ADJUSTMENT

	function	performDeposit(_amount) {
		set_txStatus({none: false, pending: true, success: false, error: false});
		depositToken({
			provider: provider,
			contractAddress: fromVault.address,
			amount: _amount
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
			amount: ethers.utils.parseUnits(amount, fromVault.decimals),
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

	function	renderLayout1() {
		return (
			<section className={'mt-12 pt-16 w-full px-12 space-y-12 mb-64 z-10 relative'}>
				<div className={'flex justify-center items-center'}>
					<div className={'w-full max-w-2xl'}>
						<div className={'bg-white rounded-xl shadow-md p-6 w-full relative overflow-hidden space-y-6'}>
							<div className={'absolute top-2 right-2'}>
								<RefreshIcon
									onClick={() => set_layout(2)}
									className={'w-4 h-4 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer'} />
							</div>

							<div>
								<div className={'flex flex-row items-center justify-center space-x-4 w-full'}>
									<div className={'w-full'}>
										<label className={'font-medium text-sm text-gray-800'}>{'From Vault'}</label>
										<VaultList
											vaults={vaults}
											value={fromVault}
											set_value={set_fromVault} />
									</div>
									<div className={''}>
										<label className={'font-medium text-sm text-gray-800'}>&nbsp;</label>
										<ArrowCircleRightIcon className={'w-8 h-8 text-gray-100'} />
									</div>
									<div className={'w-full'}>
										<label className={'font-medium text-sm text-gray-800'}>{'To Vault'}</label>
										<VaultList
											vaults={vaults}
											value={toVault}
											set_value={set_toVault} />
									</div>
								</div>
							</div>

							<div>
								<InputDeposit
									balanceOf={balanceOf}
									decimals={fromVault.decimals}
									value={amount}
									set_value={set_amount} />

								<label className={'font-normal text-xs text-gray-600 flex flex-row items-center pl-1 mt-1'}>
									<p className={'inline cursor-pointer'} onClick={() => set_amount(ethers.utils.formatUnits(balanceOf, fromVault.decimals))}>{`Balance: ${ethers.utils.formatUnits(balanceOf, fromVault.decimals)} ${fromVault.symbol}`}</p>
								</label>
							</div>


							<div className={'mt-6 pt-6 border-t border-dashed border-gray-200'}>
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
														<p className={`font-bold text-base text-red-600 cursor-help ${amount === 0 || amount === '0' ? 'opacity-0' : ''}`}>{`-${Number(amount).toFixed(4)}`}</p>
													}>
													<div className={'bg-white border border-gray-200 text-gray-800 px-2 py-1 rounded-md mb-1'}>
														<p className={'text-xs'}>{`-${amount} ${fromVault.symbol}`}</p>
													</div>
												</Popup>
											</div>
											<div className={'border-t border-gray-200 mt-1 pt-1'}>
												<p className={'inline font-medium text-sm text-gray-500'}>{`~$${(fromCounterValue * Number(amount)).toFixed(2)}`}</p>&nbsp;
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
							</div>

						</div>
					</div>
				</div>

			</section>
		);
	}

	function	renderLayout2() {
		return (
			<section className={'mt-12 pt-16 w-full px-12 space-y-12 mb-64 z-10 relative'}>
				<div className={'flex justify-center items-center'}>
					<div className={'w-full max-w-2xl'}>
						<div className={'bg-white rounded-xl shadow-md p-6 w-full relative overflow-hidden space-y-6'}>
							<div className={'absolute top-2 right-2'}>
								<RefreshIcon
									onClick={() => set_layout(1)}
									className={'w-4 h-4 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer'} />
							</div>

							<div>
								<div className={'flex flex-row items-start justify-center space-x-4 w-full'}>
									<div className={'w-2/5'}>
										<label className={'font-medium text-sm text-gray-800'}>{'From Vault'}</label>
										<VaultList
											vaults={vaults}
											value={fromVault}
											set_value={set_fromVault} />
									</div>
									<div className={'w-3/5'}>
										{/* <label className={'font-medium text-sm'}>&nbsp;</label> */}
										<label className={'font-normal text-xs text-gray-600 flex flex-row items-center pl-1 mt-1 mb-1'}>
											<p className={'inline cursor-pointer'} onClick={() => set_amount(ethers.utils.formatUnits(balanceOf, fromVault.decimals))}>{`Balance: ${ethers.utils.formatUnits(balanceOf, fromVault.decimals)} ${fromVault.symbol}`}</p>
										</label>
										<InputDeposit
											balanceOf={balanceOf}
											decimals={fromVault.decimals}
											value={amount}
											set_value={set_amount} />
									</div>
								</div>
							</div>

							<div className={'w-full'}>
								<label className={'font-medium text-sm text-gray-800'}>{'To Vault'}</label>
								<VaultList
									vaults={vaults}
									value={toVault}
									set_value={set_toVault} />
							</div>

							<div className={'mt-6 pt-6 border-t border-dashed border-gray-200'}>
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
														<p className={`font-bold text-base text-red-600 cursor-help ${amount === 0 || amount === '0' ? 'opacity-0' : ''}`}>{`-${Number(amount).toFixed(4)}`}</p>
													}>
													<div className={'bg-white border border-gray-200 text-gray-800 px-2 py-1 rounded-md mb-1'}>
														<p className={'text-xs'}>{`-${amount} ${fromVault.symbol}`}</p>
													</div>
												</Popup>
											</div>
											<div className={'border-t border-gray-200 mt-1 pt-1'}>
												<p className={'inline font-medium text-sm text-gray-500'}>{`~$${(fromCounterValue * Number(amount)).toFixed(2)}`}</p>&nbsp;
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
							</div>

						</div>
					</div>
				</div>

			</section>
		);
	}

	if (layout === 1) {
		return renderLayout1();
	}
	return renderLayout2();
}

export default Index;
