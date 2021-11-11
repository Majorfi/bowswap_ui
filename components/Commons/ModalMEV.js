import	React, {Fragment, useRef}		from	'react';
import	{Dialog, Transition}			from	'@headlessui/react';

function	ModalLogin({open, set_open}) {
	const	walletConnectRef = useRef();

	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog
				as={'div'}
				static
				className={'fixed z-10 inset-0 overflow-y-auto'}
				style={{zIndex: 9999999}}
				initialFocus={walletConnectRef}
				open={open}
				onClose={set_open}>
				<div className={'flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'}>
					<Transition.Child
						as={Fragment}
						enter={'ease-out duration-300'} enterFrom={'opacity-0'} enterTo={'opacity-100'}
						leave={'ease-in duration-200'} leaveFrom={'opacity-100'} leaveTo={'opacity-0'}>
						<Dialog.Overlay className={'fixed inset-0 bg-opacity-50 bg-gray-900 transition-opacity'} />
					</Transition.Child>

					<Transition.Child
						as={Fragment}
						enter={'ease-out duration-300'}
						enterFrom={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}
						enterTo={'opacity-100 translate-y-0 sm:scale-100'}
						leave={'ease-in duration-200'}
						leaveFrom={'opacity-100 translate-y-0 sm:scale-100'}
						leaveTo={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}>
						<div className={'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full md:max-w-2xl mt-18'}>
							<div className={'w-full p-6'}>
								<div className={'w-full flex flex-row items-center justify-between'}>
									<p className={'font-bold text-ygray-900 text-2xl'}>{'MEV Protection'}</p>
									<div className={'cursor-pointer'} onClick={() => set_open(false)}>
										<svg width={'24'} height={'24'} viewBox={'0 0 24 24'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
											<path d={'M6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289Z'} fill={'#333333'}/>
										</svg>
									</div>
								</div>
								<div className={'mt-6'}>
									<div className={'bg-ygray-100 rounded-lg p-4 relative overflow-hidden'}>
										<div className={'font-normal text-ygray-700 text-sm w-full flex flex-row'}>
											<div className={'w-1/4'}>{'Network Name: '}</div>
											<div className={'text-yblue text-base font-bold'}>{'Flashbots RPC'}</div>
										</div>
										<div className={'font-normal text-ygray-700 text-sm w-full flex flex-row'}>
											<div className={'w-1/4'}>{'RPC URL: '}</div>
											<div className={'text-yblue text-base font-bold'}>{'https://rpc.flashbots.net'}</div>
										</div>
										<div className={'font-normal text-ygray-700 text-sm w-full flex flex-row'}>
											<div className={'w-1/4'}>{'Chain ID: '}</div>
											<div className={'text-yblue text-base font-bold'}>{'1'}</div>
										</div>
										<div className={'font-normal text-ygray-700 text-sm w-full flex flex-row'}>
											<div className={'w-1/4'}>{'Currency Symbol: '}</div>
											<div className={'text-yblue text-base font-bold'}>{'ETH'}</div>
										</div>
										<div className={'absolute right-8 top-0'}>
											<svg width={'102'} height={'128'} viewBox={'0 0 16 20'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'} className={'opacity-20 p-2'}>
												<path fillRule={'evenodd'} clipRule={'evenodd'} d={'M7.56088 0.118676C7.83319 -0.0395586 8.16682 -0.0395586 8.43912 0.118676L15.5502 4.25091C15.8283 4.41246 16 4.71429 16 5.04132V10C16 10.0079 15.9999 10.0158 15.9997 10.0237C15.9512 11.9208 15.6151 13.8907 14.4458 15.6624C13.2716 17.4415 11.3314 18.91 8.28194 19.9531C8.09896 20.0156 7.90104 20.0156 7.71806 19.9531C4.66865 18.91 2.72839 17.4415 1.55421 15.6624C0.384871 13.8907 0.0487724 11.9208 0.000303321 10.0237C0.000101089 10.0158 0 10.0079 0 10V5.04132C0 4.71429 0.17175 4.41246 0.449769 4.25091L7.56088 0.118676ZM1.77778 5.57038V9.98797C1.82282 11.7046 2.12543 13.2781 3.02772 14.6452C3.89641 15.9614 5.38961 17.189 8 18.1298C10.6104 17.189 12.1036 15.9614 12.9723 14.6452C13.8746 13.2781 14.1772 11.7046 14.2222 9.98797V5.57038L8 1.95468L1.77778 5.57038Z'} fill={'#1E6EDF'}/>
											</svg>
										</div>
									</div>
								</div>
								<div className={'mt-6'}>
									<p className={'pb-2 font-normal text-ygray-700 text-sm'}>
										{'The Flashbots Protect RPC allows regular users to easily submit their transactions to the Flashbots Auction by using a custom RPC endpoint in their wallet. Everything should be the same for users, except transactions are sent to Flashbots, and then directly to miners, instead of the public mempool.'}
									</p>
									<p className={'pb-2 font-normal text-ygray-700 text-sm'}>
										<b>{'Frontrunning protection:'}</b>{' your transaction will not be seen by hungry sandwich bots in the public mempool.'}
									</p>
									<p className={'pb-2 font-normal text-ygray-700 text-sm'}>
										<b>{'No failed transactions:'}</b>{' your transaction will only be mined if it doesn\'t include any reverts, so you don\'t pay for failed transactions. Note: your transaction could be uncled, emitted to the mempool, and then included on-chain.'}
									</p>
									<p className={'font-normal text-ygray-700 text-sm'}>
										<b>{'Priority in blocks:'}</b>{' transactions sent via Flashbots are mined at the top of blocks, giving them priority.'}
									</p>
								</div>
							</div>
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
}


export default ModalLogin;