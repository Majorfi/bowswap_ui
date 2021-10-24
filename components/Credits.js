import	React	from	'react';

function	Credits() {
	return (
		<nav className={'w-full h-16 p-6 justify-center flex flex-row absolute bottom-0 z-20'}>
			<div className={'items-center justify-center flex flex-row w-full'}>
				<div className={'flex flex-row items-center justify-center space-x-6 divide-x-2 divide-gray-200'}>
					<div className={'flex flex-row justify-center space-x-2'}>
						<a href={'https://github.com/pandadefi/bowswap'} target={'_blank'} className={'text-ygray-500 text-xs hover:underline cursor-pointer'} rel={'noreferrer'}>{'Github'}</a>
					</div>
				</div>
			</div>
		</nav>
	);
}

export default Credits;
