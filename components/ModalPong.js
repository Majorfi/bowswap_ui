/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday July 4th 2021
**	@Filename:				ModalLogin.js
******************************************************************************/

import	React, {Fragment}		from	'react';
import	{Transition}			from	'@headlessui/react';
import	Pong					from	'components/Pong';

function	ModalLogin({open, set_open}) {

	React.useEffect(() => {
		if (open && typeof(document) !== 'undefined') {
			setTimeout(() => Pong.initialize(), 100);
		}
	}, [open, typeof(document) !== 'undefined']);

	return (
		<Transition.Root show={open} as={Fragment}>
			<div className={'fixed z-10 inset-0 overflow-y-auto'}>
				<div className={'flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'}>
					<Transition.Child
						as={Fragment}
						enter={'ease-out duration-300'} enterFrom={'opacity-0'} enterTo={'opacity-100'}
						leave={'ease-in duration-200'} leaveFrom={'opacity-100'} leaveTo={'opacity-0'}>
						<div className={'fixed inset-0 bg-opacity-50 bg-gray-900 transition-opacity'} onClick={() => set_open(false)} />
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
						<div className={'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle md:mb-96 relative'} style={{width: 700, height: 500}}>
							<canvas id={'pooong'}></canvas>
						</div>
					</Transition.Child>
				</div>
			</div>
		</Transition.Root>
	);
}


export default ModalLogin;