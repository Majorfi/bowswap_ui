import	React			from	'react';
import	{useRouter}		from	'next/router';
import	useAccount		from	'contexts/useAccount';

export default function Tabs() {
	const	router = useRouter();
	const	[amount, set_amount] = React.useState(0);

	const	{yVempireNotificationCounter, yVempireData, balancesOf} = useAccount();

	React.useEffect(() => {
		set_amount(0);
		Object.entries(yVempireNotificationCounter).forEach(([key, value]) => {
			const pair = yVempireData.find(e => (e?.uToken?.address).toLowerCase() === key.toLowerCase());
			if (Number(pair.uToken.apy) <= Number(pair.yvToken.apy)) {
				if (value >= 100) {
					set_amount(a => a + 1);
				}
			}
		});
	}, [yVempireNotificationCounter, balancesOf, yVempireData]);

	return (
		<div className={'flex items-center justify-between bg-white rounded-xl shadow-base p-1 w-full relative space-x-2'}>
			<div
				onClick={() => router.push('/swap')}
				className={`${router.pathname === '/swap' || router.pathname === '/between-vaults' ? 'bg-ygray-50 text-opacity-100 font-bold' : 'bg-white text-opacity-50 font-normal cursor-pointer hover:bg-ygray-50 hover:bg-opacity-70'} transition-all text-yblue w-full text-ybase rounded-lg focus:outline-none py-4 flex justify-center items-center tracking-wide`}>
				{'Between Yearn Vaults'}
			</div>
			<div
				onClick={() => router.push('/migrate')}
				className={`${router.pathname === '/migrate' ? 'bg-ygray-50 text-opacity-100 font-bold' : 'bg-white text-opacity-50 font-normal cursor-pointer hover:bg-ygray-50 hover:bg-opacity-50 hover:text-opacity-70'} transition-all text-yblue w-full text-ybase rounded-lg focus:outline-none py-4 flex justify-center items-center tracking-wide relative`}>
				<p className={'hidden md:inline'}>{'From DeFi to Yearn Vault'}</p>
				<p className={'inline md:hidden'}>{'From DeFi'}</p>
				{router.pathname !== '/migrate' && amount > 0 ? <span className={'flex h-6 w-6 absolute -top-3 -right-3 z-50'}>
					<span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-yblue opacity-75'}></span>
					<span className={'relative inline-flex rounded-full h-6 w-6 bg-yblue justify-center items-center'}>
						<p className={'text-white text-sm font-semibold font-sans'}>{amount}</p>
					</span>
				</span> : null}
			</div>
		</div>
	);
}
