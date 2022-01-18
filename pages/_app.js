import	React, {useState, useEffect}	from	'react';
import	Head							from	'next/head';
import	{DefaultSeo}					from	'next-seo';
import	{Web3ReactProvider}				from	'@web3-react/core';
import	{ethers}						from	'ethers';
import	useWeb3, {Web3ContextApp}		from	'contexts/useWeb3';
import	{YearnContextApp}				from	'contexts/useYearn';
import	{PricesContextApp}				from	'contexts/usePrices';
import	Credits							from	'components/Credits';
import	FAQ								from	'components/FAQ';
import	Navbar							from	'components/Commons/Navbar';
import	ModalPong						from	'components/Commons/ModalPong';
import	Tabs							from	'components/Commons/Tabs';
import	useSecret						from	'hook/useSecret';

import	'style/Default.css';
import	'tailwindcss/tailwind.css';

const	useSecretCode = () => {
	const secretCode = process.env.SECRET.split(',');
	const success = useSecret(secretCode);
	return success;
};

function	WithLayout({children, hasSecret}) {
	const	[triggerPong, set_triggerPong] = useState(false);

	return (
		<section className={'w-full md:px-12 px-4 space-y-12 mb-64 z-10 relative'}>
			<div className={'flex flex-col w-full justify-center items-center'}>
				<div className={'w-full max-w-2xl mb-2'}>
					<Tabs />
				</div>
				<div className={'w-full max-w-2xl'}>
					{children}
				</div>
				<div className={'w-full max-w-2xl'}>
					<FAQ />
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

function	AppSEO() {
	return (
		<>
			<Head>
				<link rel={'icon'} href={'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏹</text></svg>'} />
				<meta httpEquiv={'X-UA-Compatible'} content={'IE=edge'} />
				<meta name={'viewport'} content={'width=device-width, initial-scale=1'} />
				<meta name={'msapplication-TileColor'} content={'#9fcc2e'} />
				<meta name={'theme-color'} content={'#ffffff'} />
				<meta charSet={'utf-8'} />
				<link rel={'preconnect'} href={'https://fonts.googleapis.com'} />
				<link rel={'preconnect'} href={'https://fonts.gstatic.com'} crossOrigin={'true'} />
				<link href={'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'} rel={'stylesheet'} />
			</Head>
			<DefaultSeo
				title={'Bowswap'}
				defaultTitle={'Increase Your Yield with Yearn'}
				description={'Increase Your Yield with Yearn'}
				openGraph={{
					type: 'website',
					locale: 'en_US',
					url: 'https://bowswap.finance',
					site_name: 'Bowswap',
					title: 'Bowswap',
					description: 'Increase Your Yield with Yearn',
					images: [
						{
							url: 'https://bowswap.finance/og-bowswap.png',
							width: 1200,
							height: 675,
							alt: 'Bowswap Finance',
						}
					]
				}}
				twitter={{
					handle: '@iearnfinance',
					site: '@iearnfinance',
					cardType: 'summary_large_image',
				}} />
		</>
	);
}
function	AppWrapper(props) {
	const	{active, address} = useWeb3();
	const	{Component, pageProps, router} = props;
	const	hasSecretCode = useSecretCode();

	useEffect(() => {
		if (active && router.asPath === '/')
			router.push('/swap');
	}, [active, address]);

	const getLayout = Component.getLayout || ((page) => page);
	return (
		<>
			<AppSEO />

			{router.asPath === '/' ?
				<main id={'app'} className={'flex w-full h-full relative min-h-screen'} style={{background: '#F2F3F5', overflow: 'hidden'}}>
					<div className={'w-full h-full'}>
						<div className={'w-full h-full relative mx-auto mt-0 lg:mt-32'}>
							<Component
								key={router.route}
								element={props.element}
								router={props.router}
								{...pageProps} />
						</div>
						<Credits />
					</div>
				</main>
				:
				<main id={'app'} className={'flex flex-col w-full h-full relative min-h-screen'}>
					<div className={'z-10 pointer-events-auto w-full'}>
						<Navbar shouldInitialPopup/>
					</div>
					<div className={'w-full h-full relative max-w-screen-lg mx-auto z-30'}>
						<WithLayout hasSecret={active && hasSecretCode}>
							{getLayout(
								<Component
									key={router.route}
									element={props.element}
									router={props.router}
									hasSecret={active && hasSecretCode}
									{...pageProps} />
							)}
						</WithLayout>
					</div>

					<div className={`fixed inset-0 z-20 transition-opacity ${active && hasSecretCode ? 'pointer-events-auto opacity-100 visible' : 'pointer-events-none opacity-0 hidden'}`}>
						<div className={`fixed -inset-96 bg-test z-20 rounded-full ${active && hasSecretCode ? 'animate-scale-up-center' : ''}`} />
						<div className={'z-30 pointer-events-auto w-full absolute top-0'}>
							<Navbar hasSecret={active && hasSecretCode} shouldInitialPopup={false} />
						</div>
					</div>
				</main>
			}
		</>
	);
}

const getLibrary = (provider) => {
	return new ethers.providers.Web3Provider(provider, 'any');
};

function	MyApp(props) {
	const	{Component, pageProps} = props;
	
	return (
		<Web3ReactProvider getLibrary={getLibrary}>
			<Web3ContextApp>
				<YearnContextApp>
					<PricesContextApp>
						<AppWrapper
							Component={Component}
							pageProps={pageProps}
							element={props.element}
							router={props.router} />
					</PricesContextApp>
				</YearnContextApp>
			</Web3ContextApp>
		</Web3ReactProvider>
	);
}


export default MyApp;
