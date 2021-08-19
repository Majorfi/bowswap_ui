/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday July 4th 2021
**	@Filename:				index.js
******************************************************************************/

import	React, {useState}	from	'react';
import	ModalPong			from	'components/Commons/ModalPong';
import	Tabs				from	'components/Commons/Tabs';
import	YVempire			from	'components/YVempire';
import	Bowswap				from	'components/Bowswap';

function	Index({hasSecret}) {
	const	[currentTab, set_currentTab] = useState(0);
	const	[triggerPong, set_triggerPong] = useState(false);

	return (
		<section className={'w-full md:px-12 px-4 space-y-12 mb-64 z-10 relative'}>
			<div className={'flex flex-col w-full justify-center items-center'}>
				<div className={'w-full max-w-2xl mb-2'}>
					<Tabs currentTab={currentTab} set_currentTab={set_currentTab} />
				</div>
				<div className={'w-full max-w-2xl'}>
					{currentTab === 0 ? <Bowswap /> : <YVempire />}
				</div>
			</div>
			{hasSecret ? (
				<div className={'flex justify-center items-center'}>
					<div className={'w-full max-w-2xl'}>
						<div className={'mt-4 hidden lg:flex justify-center items-center flex-col self-center absolute w-full max-w-2xl'}>
							<div className={'flex justify-center items-center flex-col group cursor-pointer'} onClick={() => set_triggerPong(true)}>
								<p className={'text-white font-medium text-4xl cursor-pointer'}>{'🕹'}</p>
								<p className={'text-white font-medium text-sm group-hover:underline cursor-pointer pt-2'}>{'Play !'}</p>
							</div>
						</div>
					</div>
				</div>
			)
				: null}
			<ModalPong open={triggerPong} set_open={set_triggerPong} />
		</section>
	);
}

export default Index;
