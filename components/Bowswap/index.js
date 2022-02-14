import	React, {useState, useEffect}					from	'react';
import	{ethers}										from	'ethers';
import	useWeb3											from	'contexts/useWeb3';
import	useBowswap										from	'contexts/useBowswap';
import	usePaths										from	'contexts/usePaths';
import	useLocalStorage									from	'hook/useLocalStorage';
import	SectionButtons									from	'components/Bowswap/SectionButtons';
import	SectionFromVault 								from	'components/Bowswap/SectionFromVault';
import	SectionToVault 									from	'components/Bowswap/SectionToVault';
import	SectionBlockStatus								from	'components/Bowswap/SectionBlockStatus';
import	{parseAmount, isObjectEmpty}					from	'utils';
import	performBatchedUpdates							from	'utils/performBatchedUpdates';

function	OverlayNoDeposits() {
	return (
		<div className={'absolute inset-0 bg-yblue p-4 flex flex-col items-center justify-center -top-4 rounded-xl'}>
			<div>
				<svg className={'w-24 h-24 rounded-full border-white border-4'} xmlns={'http://www.w3.org/2000/svg'} width={'32'} height={'32'} viewBox={'0 0 32 32'} fill={'none'}>
					<path fillRule={'evenodd'} clipRule={'evenodd'} d={'M32 16C32 13.9059 31.5834 11.8118 30.7821 9.87712C29.9808 7.9424 28.7946 6.16704 27.3136 4.6864C25.833 3.20544 24.0576 2.0192 22.1229 1.21792C20.1882 0.41664 18.0941 0 16 0C13.9059 0 11.8118 0.41664 9.87712 1.21792C7.9424 2.0192 6.16704 3.20544 4.6864 4.6864C3.20544 6.16704 2.0192 7.9424 1.21792 9.87712C0.41664 11.8118 0 13.9059 0 16C0 18.0941 0.41664 20.1882 1.21792 22.1229C2.0192 24.0576 3.20544 25.833 4.6864 27.3136C6.16704 28.7946 7.9424 29.9808 9.87712 30.7821C11.8118 31.5834 13.9059 32 16 32C18.0941 32 20.1882 31.5834 22.1229 30.7821C24.0576 29.9808 25.833 28.7946 27.3136 27.3136C28.7946 25.833 29.9808 24.0576 30.7821 22.1229C31.5834 20.1882 32 18.0941 32 16Z'} fill={'url(#paint0_linear)'}/>
					<path fillRule={'evenodd'} clipRule={'evenodd'} d={'M15.1731 8.77601H16.8269V23.2246H15.1731V8.77601Z'} fill={'white'}/>
					<path fillRule={'evenodd'} clipRule={'evenodd'} d={'M14.2346 15.5728V13.8461C12.9082 13.1936 11.9949 11.8285 11.9949 10.2502C11.9949 8.03904 13.7882 6.24576 16 6.24576C18.4835 6.24576 20.2768 8.03904 20.2768 10.2502C20.2768 10.8077 20.1623 11.3386 19.8874 11.9693L19.1811 9.67328L17.7655 10.1158L19.0208 14.8941L23.8944 13.1011L23.3021 11.7037L21.4845 12.3258C21.8135 11.6125 21.8781 11.088 21.8781 10.2502C21.8781 7.15392 19.368 4.64384 16 4.64384C12.9037 4.64384 10.3936 7.15392 10.3936 10.2502C10.3936 12.7296 12.0035 14.833 14.2346 15.5728Z'} fill={'white'}/>
					<path fillRule={'evenodd'} clipRule={'evenodd'} d={'M17.7654 16.4278V18.1546C19.0918 18.8074 20.0051 20.1722 20.0051 21.7504C20.0051 23.9616 18.2118 25.7549 16 25.7549C13.5165 25.7549 11.7232 23.9616 11.7232 21.7504C11.7232 21.193 11.8378 20.6621 12.1126 20.0314L12.8189 22.3274L14.2346 21.8848L12.9792 17.1066L8.10559 18.8998L8.69791 20.297L10.5155 19.6749C10.1866 20.3882 10.1219 20.9126 10.1219 21.7504C10.1219 24.8467 12.632 27.3568 16 27.3568C19.0963 27.3568 21.6064 24.8467 21.6064 21.7504C21.6064 19.271 19.9965 17.1677 17.7654 16.4278Z'} fill={'white'}/>
					<defs>
						<linearGradient id={'paint0_linear'} x1={'-16'} y1={'16'} x2={'16'} y2={'48'} gradientUnits={'userSpaceOnUse'}>
							<stop stopColor={'#0077FC'}/>
							<stop offset={'1'} stopColor={'#095EB5'}/>
						</linearGradient>
					</defs>
				</svg>
			</div>
			<div className={'mt-10'}>
				<a href={'https://yearn.finance'} target={'_blank'} className={'w-72 h-11 bg-white text-yblue flex items-center justify-center px-6 py-3 text-xl font-bold rounded-lg focus:outline-none uppercase shadow-md cursor-pointer hover:shadow-sm transition-shadow'} rel={'noreferrer'}>
					{'Earn with Yearn'}
				</a>
			</div>
		</div>
	);
}

function	Bowswap() {
	const	{provider, chainID, disconnected} = useWeb3();
	const	{fromVault, toVault, currentPath} = usePaths();
	const	{balancesOf} = useBowswap();
	const	[fromAmount, set_fromAmount] = useLocalStorage('fromAmount', '');
	const	[estimateOut, set_estimateOut] = useState(0);
	const	[options, set_options] = useState({slippage: 0.05, donation: 0.3});
	const	[txApproveStatus, set_txApproveStatus] = useState({none: true, pending: false, success: false, error: false});
	const	[txSwapStatus, set_txSwapStatus] = useState({none: true, pending: false, success: false, error: false});
	const	[signature, set_signature] = useState(null);

	function	resetStates() {
		performBatchedUpdates(() => {
			set_signature(null);
			set_fromAmount('');
			set_estimateOut(0);
			set_options({slippage: 0.05, donation: 0.3});
			set_txApproveStatus({none: true, pending: false, success: false, error: false});
			set_txSwapStatus({none: true, pending: false, success: false, error: false});
		});
	}
	React.useEffect(() => {
		if (disconnected)
			resetStates();
	}, [disconnected]);

	/* 🏹 - Bowswap Finance ************************************************************************
	**	Update the estimateOut value after a call to the contract to estimate the amout of tokens
	**	that will be sent to the user.
	**	Triggered any time fromVault, toVault, fromAmount, donation or the path changes
	**********************************************************************************************/
	const	fetchEstimateOut = React.useCallback(async () => {
		const amount = ethers.utils.parseUnits(Number(fromAmount).toFixed(currentPath.fromDecimals), currentPath.fromDecimals);
		if (amount.isZero())
			return set_estimateOut(0);
		if (txApproveStatus.error)
			set_txApproveStatus({none: false, pending: false, success: false, error: false});

		const	contract = new ethers.Contract(
			chainID === 250 ? process.env.BOWSWAP_SWAPPER_FTM_ADDR : process.env.BOWSWAP_SWAPPER_ADDR,
			['function metapool_estimate_out(address, address, uint256, uint256) public view returns (uint256)', 'function estimate_out(address, address, uint256, tuple(uint8, address, uint128, uint128)[], uint256) public view returns (uint256)'],
			provider
		);
		if (currentPath.type === 'metapool') {
			try {
				const	metapool_estimate_out = await contract.metapool_estimate_out(
					currentPath?.data?.[0],
					currentPath?.data?.[1],
					amount,
					options.donation * 100
				);
				return set_estimateOut(ethers.utils.formatUnits(metapool_estimate_out, currentPath.toDecimals));
			} catch (e) {
				set_txApproveStatus({none: false, pending: false, success: false, error: true, message: 'Impossible to use this path right now'});
				return set_estimateOut(0);
			}
		} else {
			try {
				const	estimate_out = await contract.estimate_out(
					currentPath?.data?.[0],
					currentPath?.data?.[1],
					amount,
					currentPath?.data?.[2] || [],
					options.donation * 100
				);
				return set_estimateOut(ethers.utils.formatUnits(estimate_out, currentPath.toDecimals));
			} catch (e) {
				set_txApproveStatus({none: false, pending: false, success: false, error: true, message: 'Impossible to use this path right now'});
				return set_estimateOut(0);
			}
		}
	}, [currentPath, fromAmount, options.donation, provider]);
	useEffect(() => {
		set_estimateOut(null);
		fetchEstimateOut();
	} , [fetchEstimateOut]);


	/* 🏹 - Bowswap Finance ************************************************************************
	**	Any time the fromVault address is changed, we need to set the input amount to the current
	**	balance of the user
	**********************************************************************************************/
	useEffect(() => {
		set_fromAmount(parseAmount((balancesOf?.[fromVault?.address] || '0')));
	}, [fromVault, balancesOf]);

	return (
		<div className={'w-full max-w-2xl'}>
			<div className={'bg-white rounded-xl shadow-base p-4 w-full relative space-y-0 md:space-y-4'}>
				<SectionFromVault
					disabled={txApproveStatus.success || (!txSwapStatus.none && !txSwapStatus.success)}
					fromAmount={fromAmount}
					set_fromAmount={set_fromAmount}
					balanceOf={balancesOf[fromVault?.address] || '0'}
					options={options}
					set_options={set_options} />

				<div className={'flex w-full justify-center pt-4'}>
					<SectionBlockStatus
						txApproveStatus={txApproveStatus}
						txSwapStatus={txSwapStatus}
						options={options}
						fromAmount={fromAmount}
						balancesOf={balancesOf} />
				</div>

				<SectionToVault
					disabled={txApproveStatus.success || (!txSwapStatus.none && !txSwapStatus.success)}
					estimateOut={estimateOut}
					options={options}
					balanceOf={balancesOf?.[toVault?.address] || 0} />

				<SectionButtons
					fromAmount={fromAmount}
					estimateOut={estimateOut}
					options={options}
					txApproveStatus={txApproveStatus}
					set_txApproveStatus={set_txApproveStatus}
					signature={signature}
					set_signature={set_signature}
					set_txSwapStatus={set_txSwapStatus}
					resetStates={resetStates} />
				{isObjectEmpty(fromVault) && isObjectEmpty(toVault) ? <OverlayNoDeposits /> : null}
			</div>
		</div>
	);
}

export default Bowswap;