/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday July 29th 2021
**	@Filename:				ModalVaultList.js
******************************************************************************/

import	React, {useState, useEffect, Fragment}	from	'react';
import	Image									from	'next/image';
import	{List}									from	'react-virtualized';
import	{Dialog, Transition}					from	'@headlessui/react';
import	{XIcon, SelectorIcon}					from	'@heroicons/react/solid';
import	{toAddress}								from	'utils';

function ModalVaultList({vaults, value, set_value}) {
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
				<Dialog as={'div'} static className={'fixed z-30 inset-0 overflow-hidden'} open={open} onClose={set_open}>
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

export default ModalVaultList;