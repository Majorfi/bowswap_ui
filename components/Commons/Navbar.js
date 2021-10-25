import	React, {useState}		from	'react';
import	Image					from	'next/image';
import	useWeb3					from	'contexts/useWeb3';
import	ModalLogin				from	'components/Commons/ModalLogin';
import Link from 'next/link';

function	Navbar({hasSecret, shouldInitialPopup}) {
	const	{active, address, ens, deactivate, onDesactivate} = useWeb3();
	const	[modalLoginOpen, set_modalLoginOpen] = useState(false);
	const	[initialPopup, set_initialPopup] = useState(false);

	React.useEffect(() => {
		if (initialPopup || !shouldInitialPopup)
			return;

		if (!address) {
			set_modalLoginOpen(true);
		}
		set_initialPopup(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

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

	function	renderWalletButton() {
		if (!active) {
			return (
				<button
					onClick={() => set_modalLoginOpen(true)}
					className={'ml-8 inline-flex px-6 py-3 items-center leading-4 rounded-lg text-ybase cursor-pointer whitespace-nowrap bg-transparent text-yblue border border-solid border-yblue hover:bg-connect-hover  transition-colors'}>
					{'Connect wallet'}
				</button>
			);
		}
		return (
			<p
				onClick={() => {deactivate(); onDesactivate();}}
				suppressHydrationWarning
				className={'ml-8 inline-flex px-6 py-3 items-center leading-4 rounded-lg text-sm cursor-pointer whitespace-nowrap bg-white text-gray-800 border border-solid border-gray-100 hover:bg-white hover:text-gray-900 transition-colors shadow-sm'}>
				<svg className={'mr-2'} width={'16'} height={'16'} viewBox={'0 0 16 16'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
					<path d={'M12.6667 0H3.33333C1.46667 0 0 1.46667 0 3.33333V12.6667C0 14.5333 1.46667 16 3.33333 16H12.6667C14.5333 16 16 14.5333 16 12.6667V3.33333C16 1.46667 14.5333 0 12.6667 0ZM4.66667 5C5.2 5 5.66667 5.46667 5.66667 6C5.66667 6.53333 5.2 7 4.66667 7C4.13333 7 3.66667 6.53333 3.66667 6C3.66667 5.46667 4.13333 5 4.66667 5ZM12.0667 10.4C10.9333 11.4667 9.46667 12.0667 8 12.0667C6.53333 12.0667 5 11.4667 3.93333 10.4C3.8 10.2667 3.73333 10.1333 3.73333 9.93333C3.73333 9.53333 4 9.26667 4.4 9.26667C4.6 9.26667 4.73333 9.33333 4.86667 9.46667C5.73333 10.3333 6.86667 10.8 8 10.8C9.13333 10.8 10.2667 10.3333 11.1333 9.46667C11.2667 9.33333 11.4 9.26667 11.6 9.26667C12 9.26667 12.2667 9.53333 12.2667 9.93333C12.2667 10.1333 12.2 10.2667 12.0667 10.4ZM11.3333 7C10.8 7 10.3333 6.53333 10.3333 6C10.3333 5.46667 10.8 5 11.3333 5C11.8667 5 12.3333 5.46667 12.3333 6C12.3333 6.53333 11.8667 7 11.3333 7Z'} fill={stringToColour(ens || `${address.slice(0, 4)}...${address.slice(-4)}`)}/>
				</svg>
				{ens || `${address.slice(0, 4)}...${address.slice(-4)}`}
			</p>
		);
	}

	return (
		<nav className={'w-full h-16 p-6 justify-center flex flex-row'}>
			<div className={'max-w-2xl items-center justify-between flex flex-row w-full'}>
				<Link href={active ? '/swap' : '/'}>
					<div className={'flex flex-row items-center space-x-3 cursor-pointer'}>
						<Image src={hasSecret ? '/yCrossbowswap.png' : '/yBowswap.png'} width={42} height={42} quality={100} loading={'eager'} />
						<p className={`inline ${hasSecret ? 'text-white' : 'text-yblue'} font-extrabold text-xl`}>{hasSecret ? 'Crossbowswap' : 'Bowswap'}</p>
					</div>
				</Link>
				<div>
					{renderWalletButton()}
				</div>
			</div>
			<ModalLogin open={modalLoginOpen} set_open={set_modalLoginOpen} />
		</nav>
	);
}

export default Navbar;
