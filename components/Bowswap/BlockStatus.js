import	React, {Fragment}	from	'react';
import	{Transition}		from	'@headlessui/react';
import	Arrow				from	'components/Icons/Arrow';

function BlockStatus({title, icon, color, open}) {
	return (
		<div className={'relative w-full'}>
			<div className={'w-full h-16 flex justify-center items-center'}>
				<Arrow className={'w-8 h-8 text-ygray-400 transform rotate-90'} />
			</div>
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
				<div className={`absolute inset-0 w-full ${color} text-yerror font-medium text-white rounded-lg h-16 flex justify-center items-center font-sans`}>
					{icon}
					{title}
				</div>
			</Transition>
		</div>
	);
}

export default BlockStatus;