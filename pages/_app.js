/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday June 13th 2021
**	@Filename:				_app.js
******************************************************************************/

import	React							from	'react';
import	Head							from	'next/head';
import	{Web3ReactProvider}				from	'@web3-react/core';
import	{ethers}						from	'ethers';
import	FullConfetti					from	'react-confetti';

import	useWeb3, {Web3ContextApp}		from	'contexts/useWeb3';
import	{AccountContextApp}				from	'contexts/useAccount';
import	Navbar							from	'components/Navbar';
import	useSecret						from	'hook/useSecret';

import	'style/Default.css';
import	'tailwindcss/tailwind.css';

const useSecretCode = () => {
	const secretCode = process.env.SECRET.split(',');
	const success = useSecret(secretCode);
	return success;
};

function	AppWrapper(props) {
	const	{active} = useWeb3();
	const	{Component, pageProps, router} = props;
	const	hasSecretCode = useSecretCode();

	return (
		<>
			<Head>
				<title>{active && hasSecretCode ? 'Crossbowswap' : 'Bowswap'}</title>
				<link rel={'icon'} href={'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏹</text></svg>'} />
				<meta httpEquiv={'X-UA-Compatible'} content={'IE=edge'} />
				<meta name={'viewport'} content={'width=device-width, initial-scale=1'} />
				<meta name={'description'} content={active && hasSecretCode ? 'Crossbowswap - Swap from one crv vault to an other. With extra step.' : 'Bowswap - Swap from one crv vault to an other'} />
				<meta name={'msapplication-TileColor'} content={'#9fcc2e'} />
				<meta name={'theme-color'} content={'#ffffff'} />
				<meta charSet={'utf-8'} />
				<link rel={'preconnect'} href={'https://fonts.googleapis.com'} />
				<link rel={'preconnect'} href={'https://fonts.gstatic.com'} crossOrigin={'true'} />
				<link href={'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'} rel={'stylesheet'} />
			</Head>
			<main id={'app'} className={'flex w-full h-full relative min-h-screen'}>
				<div className={'z-10 pointer-events-auto fixed top-0 w-full'}>
					<Navbar />
				</div>
				<div className={'w-full h-full relative max-w-screen-lg mx-auto z-30 mt-28'}>
					<Component
						key={router.route}
						element={props.element}
						router={props.router}
						hasSecret={active && hasSecretCode}
						{...pageProps} />
				</div>

				<div className={`fixed inset-0 z-20 transition-opacity ${active && hasSecretCode ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
					<div className={`fixed -inset-96 bg-test z-20 rounded-full ${active && hasSecretCode ? 'animate-scale-up-center' : ''}`} />
					<div className={'z-30 pointer-events-auto fixed top-0 w-full'}>
						<Navbar hasSecret={active && hasSecretCode} />
					</div>
					{active && hasSecretCode ?
						<div className={'z-50 pointer-events-none fixed inset-0'}>
							<FullConfetti
								recycle={false}
								numberOfPieces={600}
								width={typeof(window) !== 'undefined' && window.innerWidth || 1920}
								height={typeof(window) !== 'undefined' && window.innerHeight || 1080} />
						</div> : null}
				</div>
			</main>
		</>
	);
}

const getLibrary = (provider) => {
	return new ethers.providers.Web3Provider(provider);
};

function	MyApp(props) {
	const	{Component, pageProps} = props;
	
	return (
		<Web3ReactProvider getLibrary={getLibrary}>
			<Web3ContextApp>
				<AccountContextApp>
					<AppWrapper
						Component={Component}
						pageProps={pageProps}
						element={props.element}
						router={props.router} />
				</AccountContextApp>
			</Web3ContextApp>
		</Web3ReactProvider>
	);
}


export default MyApp;
