import	React, {useState}		from	'react';
import	Image					from	'next/image';
import	Link					from	'next/link';
import	useWeb3					from	'contexts/useWeb3';
import	ModalLogin				from	'components/Commons/ModalLogin';
import	ModalMEV				from	'components/Commons/ModalMEV';
import	useClientEffect			from	'hook/useClientEffect';

function	Navbar({hasSecret, shouldInitialPopup}) {
	const	{active, provider, address, ens, deactivate, onDesactivate, chainID, onSwitchChain} = useWeb3();
	const	[modalLoginOpen, set_modalLoginOpen] = useState(false);
	const	[modalMEVOpen, set_modalMEVOpen] = useState(false);
	const	[initialPopup, set_initialPopup] = useState(false);

	useClientEffect(() => {
		if (initialPopup || !shouldInitialPopup)
			return;

		if (active && !address) {
			set_modalLoginOpen(true);
		}
		set_initialPopup(true);
	}, [active, address]);

	const stringToColour = function(str) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		let color = '#';
		for (let i = 0; i < 3; i++) {
			let value = (hash >> (i * 8)) & 0xFF;
			color += ('00' + value.toString(16)).substr(-2);
		}
		return color;
	};

	function	switchChain(newChainID) {
		if (newChainID === chainID) {
			return;
		}
		if (!provider || !active) {
			console.error('Not initialized');
			return;
		}
		if (Number(newChainID) === 1) {
			provider.send('wallet_switchEthereumChain', [{chainId: '0x1'}]).catch((error) => console.error(error));
		} else if (Number(newChainID) === 250) {
			const fantomChainData = {
				chainId: '0xFA',
				blockExplorerUrls: ['https://ftmscan.com'],
				chainName: 'Fantom Opera',
				rpcUrls: ['https://rpc.ftm.tools'],
				nativeCurrency: {
					name: 'Fantom',
					symbol: 'FTM',
					decimals: 18
				}
			};
			provider.send('wallet_addEthereumChain', [fantomChainData, address]).catch((error) => console.error(error));
		}
	}

	function	addMevChain() {
		set_modalMEVOpen(true);
		// if (provider) {
		// 	//NOT SUPPORTED BY METAMASK
		// 	provider.send('wallet_addEthereumChain', [
		// 		{
		// 			'chainId': '0x1',
		// 			'blockExplorerUrls': ['https://etherscan.io/'],
		// 			'chainName': 'Flashbots Protect RPC',
		// 			'rpcUrls': ['https://rpc.flashbots.net'],
		// 			'nativeCurrency': {
		// 				'name': 'Ethereum',
		// 				'symbol': 'ETH',
		// 				'decimals': 18
		// 			}
		// 		},
		// 		address
		// 	]).catch((error) => console.error(error));
		// }
	}

	function	renderWalletButton() {
		if ((address && active) || (address && !provider)) 
			return (
				<p
					onClick={() => {
						deactivate();
						onDesactivate();
					}}
					suppressHydrationWarning
					className={'ml-2 inline-flex px-3 py-2 items-center leading-4 rounded-lg text-sm cursor-pointer whitespace-nowrap bg-white text-gray-800 border border-solid border-gray-100 hover:bg-white hover:text-gray-900 transition-colors h-10'}>
					<svg className={'mr-2'} width={'16'} height={'16'} viewBox={'0 0 16 16'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
						<path d={'M12.6667 0H3.33333C1.46667 0 0 1.46667 0 3.33333V12.6667C0 14.5333 1.46667 16 3.33333 16H12.6667C14.5333 16 16 14.5333 16 12.6667V3.33333C16 1.46667 14.5333 0 12.6667 0ZM4.66667 5C5.2 5 5.66667 5.46667 5.66667 6C5.66667 6.53333 5.2 7 4.66667 7C4.13333 7 3.66667 6.53333 3.66667 6C3.66667 5.46667 4.13333 5 4.66667 5ZM12.0667 10.4C10.9333 11.4667 9.46667 12.0667 8 12.0667C6.53333 12.0667 5 11.4667 3.93333 10.4C3.8 10.2667 3.73333 10.1333 3.73333 9.93333C3.73333 9.53333 4 9.26667 4.4 9.26667C4.6 9.26667 4.73333 9.33333 4.86667 9.46667C5.73333 10.3333 6.86667 10.8 8 10.8C9.13333 10.8 10.2667 10.3333 11.1333 9.46667C11.2667 9.33333 11.4 9.26667 11.6 9.26667C12 9.26667 12.2667 9.53333 12.2667 9.93333C12.2667 10.1333 12.2 10.2667 12.0667 10.4ZM11.3333 7C10.8 7 10.3333 6.53333 10.3333 6C10.3333 5.46667 10.8 5 11.3333 5C11.8667 5 12.3333 5.46667 12.3333 6C12.3333 6.53333 11.8667 7 11.3333 7Z'} fill={stringToColour(ens || `${address.slice(0, 4)}...${address.slice(-4)}`)}/>
					</svg>
					{ens || `${address.slice(0, 4)}...${address.slice(-4)}`}
				</p>
			);
		if (address) {
			return (
				<p
					onClick={() => onSwitchChain(true)}
					suppressHydrationWarning
					className={'ml-2 inline-flex px-3 py-2 items-center leading-4 rounded-lg text-sm cursor-pointer whitespace-nowrap bg-white text-gray-800 border border-solid border-gray-100 hover:bg-white hover:text-gray-900 transition-colors h-10 relative'}>
					<svg className={'mr-2'} width={'16'} height={'16'} viewBox={'0 0 16 16'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
						<path d={'M12.6667 0H3.33333C1.46667 0 0 1.46667 0 3.33333V12.6667C0 14.5333 1.46667 16 3.33333 16H12.6667C14.5333 16 16 14.5333 16 12.6667V3.33333C16 1.46667 14.5333 0 12.6667 0ZM4.66667 5C5.2 5 5.66667 5.46667 5.66667 6C5.66667 6.53333 5.2 7 4.66667 7C4.13333 7 3.66667 6.53333 3.66667 6C3.66667 5.46667 4.13333 5 4.66667 5ZM12.0667 10.4C10.9333 11.4667 9.46667 12.0667 8 12.0667C6.53333 12.0667 5 11.4667 3.93333 10.4C3.8 10.2667 3.73333 10.1333 3.73333 9.93333C3.73333 9.53333 4 9.26667 4.4 9.26667C4.6 9.26667 4.73333 9.33333 4.86667 9.46667C5.73333 10.3333 6.86667 10.8 8 10.8C9.13333 10.8 10.2667 10.3333 11.1333 9.46667C11.2667 9.33333 11.4 9.26667 11.6 9.26667C12 9.26667 12.2667 9.53333 12.2667 9.93333C12.2667 10.1333 12.2 10.2667 12.0667 10.4ZM11.3333 7C10.8 7 10.3333 6.53333 10.3333 6C10.3333 5.46667 10.8 5 11.3333 5C11.8667 5 12.3333 5.46667 12.3333 6C12.3333 6.53333 11.8667 7 11.3333 7Z'} fill={stringToColour(ens || `${address.slice(0, 4)}...${address.slice(-4)}`)}/>
					</svg>
					{ens || `${address.slice(0, 4)}...${address.slice(-4)}`}
					<span className={'flex h-3 w-3 absolute -top-1 -right-1 z-50'}>
						<span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75'}></span>
						<span className={'relative inline-flex rounded-full h-3 w-3 bg-error justify-center items-center'}>
						</span>
					</span>
				</p>
			);
		}
		return (
			<button
				onClick={() => set_modalLoginOpen(true)}
				className={'ml-2 inline-flex px-3 py-2 items-center leading-4 rounded-lg text-ybase cursor-pointer whitespace-nowrap bg-transparent text-yblue border border-solid border-yblue hover:bg-connect-hover transition-colors h-10'}>
				{'Connect wallet'}
			</button>
		);
	}

	function	renderMEVProtection() {
		return (
			<p
				onClick={addMevChain}
				suppressHydrationWarning
				className={`ml-8 inline-flex px-3 py-2 items-center leading-4 rounded-lg text-ybase cursor-pointer whitespace-nowrap bg-transparent text-yblue border border-solid border-yblue hover:bg-connect-hover transition-colors h-10 ${!provider || !active ? 'hidden' : ''}`}>
				<svg width={'16'} height={'20'} viewBox={'0 0 16 20'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'} className={'mr-2'}>
					<path fillRule={'evenodd'} clipRule={'evenodd'} d={'M7.56088 0.118676C7.83319 -0.0395586 8.16682 -0.0395586 8.43912 0.118676L15.5502 4.25091C15.8283 4.41246 16 4.71429 16 5.04132V10C16 10.0079 15.9999 10.0158 15.9997 10.0237C15.9512 11.9208 15.6151 13.8907 14.4458 15.6624C13.2716 17.4415 11.3314 18.91 8.28194 19.9531C8.09896 20.0156 7.90104 20.0156 7.71806 19.9531C4.66865 18.91 2.72839 17.4415 1.55421 15.6624C0.384871 13.8907 0.0487724 11.9208 0.000303321 10.0237C0.000101089 10.0158 0 10.0079 0 10V5.04132C0 4.71429 0.17175 4.41246 0.449769 4.25091L7.56088 0.118676ZM1.77778 5.57038V9.98797C1.82282 11.7046 2.12543 13.2781 3.02772 14.6452C3.89641 15.9614 5.38961 17.189 8 18.1298C10.6104 17.189 12.1036 15.9614 12.9723 14.6452C13.8746 13.2781 14.1772 11.7046 14.2222 9.98797V5.57038L8 1.95468L1.77778 5.57038Z'} fill={'#1E6EDF'}/>
				</svg>
				{'MEV protection'}
			</p>
		);

	}

	function	renderChain() {
		const options = [['Ethereum', 1], ['Fantom', 250]];
		return (
			<select
				value={chainID === 250 ? 'Fantom' : 'Ethereum'}
				className={'ml-2 inline-flex px-3 py-2 pr-8 items-center leading-4 rounded-lg text-sm cursor-pointer whitespace-nowrap bg-white text-gray-800 border border-solid border-gray-100 hover:bg-white hover:text-gray-900 transition-colors h-10 relative'}
				onChange={e => switchChain(e.target.value)}>
				{options.map(([name, id], index) => (
					<option className={'cursor-pointer'} key={index} value={id}>{name}</option>
				))}
			</select>
		);

	}

	return (
		<nav className={'w-full h-10 my-4 justify-center flex flex-row'}>
			<div className={'max-w-2xl items-center justify-between flex flex-row w-full'}>
				<Link href={active ? '/swap' : '/'}>
					<div className={'flex flex-row items-center space-x-3 cursor-pointer'}>
						<Image src={hasSecret ? '/yCrossbowswap.png' : '/yBowswap.png'} width={42} height={42} quality={100} loading={'eager'} />
						<p className={`inline ${hasSecret ? 'text-white' : 'text-yblue'} font-extrabold text-xl`}>{hasSecret ? 'Crossbowswap' : 'Bowswap'}</p>
					</div>
				</Link>
				<div className={'flex flex-row items-center'}>
					{renderMEVProtection()}
					{renderChain()}
					{renderWalletButton()}
				</div>
			</div>
			<ModalLogin open={modalLoginOpen} set_open={set_modalLoginOpen} />
			<ModalMEV open={modalMEVOpen} set_open={set_modalMEVOpen} />
		</nav>
	);
}

export default Navbar;
