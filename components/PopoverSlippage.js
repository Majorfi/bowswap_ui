/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday July 29th 2021
**	@Filename:				PopoverSlippage.js
******************************************************************************/

import	React, {Fragment, useRef, useEffect, useState}	from	'react';
import	{Popover, Transition}					from	'@headlessui/react';

function PopoverSlippage({slippage, set_slippage}) {
	const	[open, set_open] = useState(false);
	const	buttonRef = useRef(null);

	const handleClickOutside = (event) => {
		if (buttonRef.current && !buttonRef.current.contains(event.target)) {
			set_open(false);
			event.stopPropagation();
		}
	};
	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});
	return (
		<Popover>
			<div ref={buttonRef}>
				<div className={'ml-2 items-center h-5 bg-white group focus:outline-none px-2 rounded-lg cursor-pointer flex'} onClick={() => set_open(!open)}>
					<Popover.Button>
						<svg aria-hidden={'true'} focusable={'false'} className={'w-2 h-2 text-gray-300 group-hover:text-gray-500 transition-colors'} role={'img'} xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 512 512'}><path fill={'currentColor'} d={'M499.5 332c0-5.66-3.112-11.13-8.203-14.07l-46.61-26.91C446.8 279.6 448 267.1 448 256s-1.242-23.65-3.34-35.02l46.61-26.91c5.092-2.941 8.203-8.411 8.203-14.07c0-14.1-41.98-99.04-63.86-99.04c-2.832 0-5.688 .7266-8.246 2.203l-46.72 26.98C362.9 94.98 342.4 83.1 320 75.16V21.28c0-7.523-5.162-14.28-12.53-15.82C290.8 1.977 273.7 0 256 0s-34.85 1.977-51.48 5.461C197.2 7.004 192 13.76 192 21.28v53.88C169.6 83.1 149.1 94.98 131.4 110.1L84.63 83.16C82.08 81.68 79.22 80.95 76.39 80.95c-19.72 0-63.86 81.95-63.86 99.04c0 5.66 3.112 11.13 8.203 14.07l46.61 26.91C65.24 232.4 64 244 64 256s1.242 23.65 3.34 35.02l-46.61 26.91c-5.092 2.941-8.203 8.411-8.203 14.07c0 14.1 41.98 99.04 63.86 99.04c2.832 0 5.688-.7266 8.246-2.203l46.72-26.98C149.1 417 169.6 428.9 192 436.8v53.88c0 7.523 5.162 14.28 12.53 15.82C221.2 510 238.3 512 255.1 512s34.85-1.977 51.48-5.461C314.8 504.1 320 498.2 320 490.7v-53.88c22.42-7.938 42.93-19.82 60.65-34.97l46.72 26.98c2.557 1.477 5.416 2.203 8.246 2.203C455.3 431 499.5 349.1 499.5 332zM256 336c-44.11 0-80-35.89-80-80S211.9 176 256 176s80 35.89 80 80S300.1 336 256 336z'}></path></svg>
					</Popover.Button>
				</div>

				<Transition
					show={open}
					as={Fragment}
					enter={'transition ease-out duration-200'}
					enterFrom={'opacity-0 translate-y-1'}
					enterTo={'opacity-100 translate-y-0'}
					leave={'transition ease-in duration-150'}
					leaveFrom={'opacity-100 translate-y-0'}
					leaveTo={'opacity-0 translate-y-1'}>
					<Popover.Panel className={'absolute right-0 z-30 w-screen max-w-xs px-4 pt-2 sm:px-0'}>
						<div className={'overflow-hidden rounded-md shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-200'}>
							<div className={'relative bg-white p-4 max-h-96 overflow-scroll'}>
								<label className={'font-medium text-sm text-gray-800 flex flex-row items-center pb-4'}>
									<p className={'inline'}>{'Settings'}</p>
								</label>
								<div className={'flex flex-row items-center'}>
									<div className={'mr-2'}>
										<p className={'font-medium text-xs text-gray-600'}>{'Slippage'}</p>
									</div>
									<div className={'relative w-full text-left bg-white rounded-lg border cursor-default focus:outline-none flex flex-row justify-between border-gray-200 text-gray-800'}>
										<input
											value={Number(slippage).toString()}
											onChange={(e) => {
												set_slippage(e.target.value);
											}}
											style={{background: 'transparent'}}
											className={'block truncate py-3 text-sm'}
											min={0}
											max={100}
											step={0.01}
											type={'number'} />
										<div className={'absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'}>
											<span className={'text-gray-300'} id={'percent'}>
												{'%'}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Popover.Panel>
				</Transition>
			</div>
		</Popover>
	);
}


export default PopoverSlippage;