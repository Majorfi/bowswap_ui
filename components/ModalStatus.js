/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Saturday July 31st 2021
**	@Filename:				ModalStatus.js
******************************************************************************/

import	React, {Fragment}	from	'react';
import	{Transition}		from	'@headlessui/react';

function ModalStatus({title, icon, color, open, set_open}) {
	return (
		<Transition
			show={open}
			as={Fragment}
			appear={true}
			unmount={false}
			enter={'ease-out duration-200'}
			enterFrom={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}
			enterTo={'opacity-100 translate-y-0 sm:scale-100'}
			leave={'ease-in duration-200'}
			leaveFrom={'opacity-100 translate-y-0 sm:scale-100'}
			leaveTo={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}>
			<div as={'div'} className={'absolute z-50 inset-0 overflow-hidden'}>
				<div className={'flex w-full h-full bg-white p-4 pt-0 rounded-lg overflow-hidden z-10'}>
					<div className={`inline-block rounded-lg w-full f-full z-20 ${color}`}>
						<div className={'px-6 pt-14 pb-6 relative h-full flex flex-col items-center justify-between'}>
							<div className={'flex flex-col justify-center items-center'}>
								<div className={'flex flex-row items-center justify-center w-full mb-16'}>
									<h3 as={'h3'} className={'text-ylarge font-bold text-white'}>
										{title}
									</h3>
								</div>
								<div className={'pt-3.5'}>
									{icon}
								</div>
							</div>
							<div>
								<button
									onClick={() => set_open(false)}
									className={'w-80 h-10 flex items-center justify-center space-x-2 px-6 py-3 text-ybase font-medium rounded-lg focus:outline-none overflow-hidden transition-opacity border text-white border-white cursor-pointer bg-white bg-opacity-0 hover:bg-opacity-30'}>
									<span>{'OK'}</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	);
}

export default ModalStatus;