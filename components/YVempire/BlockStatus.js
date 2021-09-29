/******************************************************************************
**	@Author:				Bowswap
**	@Date:					Saturday July 31st 2021
**	@Filename:				BlockStatus.js
******************************************************************************/

import	React, {Fragment}	from	'react';
import	{Transition}		from	'@headlessui/react';

function BlockStatus({title, icon, color, open}) {
	return (
		<Transition
			show={open}
			as={Fragment}
			appear={true}
			unmount={false}
			enter={'ease-in duration-200'}
			enterFrom={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}
			enterTo={'opacity-100 translate-y-0 sm:scale-100'}
			leave={'ease-in duration-200'}
			leaveFrom={'opacity-100 translate-y-0 sm:scale-100'}
			leaveTo={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}>
			<div className={`absolute inset-0 w-full ${color} text-yerror font-medium text-white flex justify-center items-center font-sans rounded-lg`}>
				{icon}
				{title}
			</div>
		</Transition>
	);
}

export default BlockStatus;