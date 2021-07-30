/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday July 4th 2021
**	@Filename:				Navbar.js
******************************************************************************/

import	React, {useState}		from	'react';
import	useWeb3					from	'contexts/useWeb3';
import	ModalLogin				from	'components/ModalLogin';

function	Navbar() {
	const	{active, address, ens, deactivate, onDesactivate} = useWeb3();
	const	[ModalLoginOpen, set_ModalLoginOpen] = useState(false);

	function	renderWalletButton() {
		if (!active) {
			return (
				<button onClick={() => set_ModalLoginOpen(true)} className={'ml-8 inline-flex px-4 py-2 items-center leading-4 rounded-md text-sm cursor-pointer font-medium whitespace-nowrap bg-white text-gray-800 border border-solid border-white hover:bg-white hover:text-gray-900 transition-colors'}>
					{'Connect wallet'}
				</button>
			);
		}
		return (
			<p onClick={() => {deactivate(); onDesactivate();}} suppressHydrationWarning className={'ml-8 inline-flex px-4 py-2 items-center leading-4 rounded-md text-sm cursor-pointer font-medium whitespace-nowrap bg-white text-gray-800 border border-solid border-white hover:bg-white hover:text-gray-900 transition-colors'}>
				{ens || `${address.slice(0, 4)}...${address.slice(-4)}`}
			</p>
		);
	}

	return (
		<nav className={'w-full h-16 p-6 justify-center flex flex-row fixed top-0 z-20'}>
			<div className={'max-w-4xl items-center justify-between flex flex-row w-full'}>
				<div className={'flex flex-row items-center space-x-10'}>
					<p className={'text-gray-800 font-extrabold text-xl'}>{'crSWAP'}</p>
				</div>
				<div>
					{renderWalletButton()}
				</div>
			</div>
			<ModalLogin open={ModalLoginOpen} set_open={set_ModalLoginOpen} />
		</nav>
	);
}

export default Navbar;
