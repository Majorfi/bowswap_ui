/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Tuesday August 17th 2021
**	@Filename:				Tabs.js
******************************************************************************/

import	React			from	'react';
import	{useRouter}		from	'next/router';

export default function Tabs() {
	const router = useRouter();

	return (
		<div className={'flex items-center justify-between bg-white rounded-xl shadow-base p-1 w-full relative space-x-2'}>
			<div
				onClick={() => router.push('/')}
				className={`${router.pathname === '/' || router.pathname === '/between-vaults' ? 'bg-ygray-50 text-opacity-100 font-bold' : 'bg-white text-opacity-50 font-normal cursor-pointer hover:bg-ygray-50 hover:bg-opacity-70'} transition-all text-yblue w-full text-ybase rounded-lg focus:outline-none py-4 flex justify-center items-center tracking-wide`}>
				{'Between Yearn Vaults'}
			</div>
			<div
				onClick={() => router.push('/from-defi')}
				className={`${router.pathname === '/from-defi' ? 'bg-ygray-50 text-opacity-100 font-bold' : 'bg-white text-opacity-50 font-normal cursor-pointer hover:bg-ygray-50 hover:bg-opacity-50 hover:text-opacity-70'} transition-all text-yblue w-full text-ybase rounded-lg focus:outline-none py-4 flex justify-center items-center tracking-wide`}>
				{'From DeFi to Yearn Vault'}
			</div>
		</div>
	);
}
