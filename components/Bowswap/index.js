import	React, {useState, useEffect, useCallback}		from	'react';
import	{ethers}										from	'ethers';
import	useWeb3											from	'contexts/useWeb3';
import	useAccount										from	'contexts/useAccount';
import	useLocalStorage									from	'hook/useLocalStorage';
import	useDebounce										from	'hook/useDebounce';
import	SectionButtons									from	'components/Bowswap/SectionButtons';
import	SectionFromVault 								from	'components/Bowswap/SectionFromVault';
import	SectionToVault 									from	'components/Bowswap/SectionToVault';
import	SectionBlockStatus								from	'components/Bowswap/SectionBlockStatus';
import	{toAddress}										from	'utils';
import	METAPOOL_SWAPS									from	'utils/detected_metapoolSwaps';
import	SWAPS											from	'utils/detected_swaps';

function	Bowswap({prices, yVaults}) {
	const	{provider, active} = useWeb3();
	const	{balancesOf} = useAccount();
	const	[, set_nonce] = useState(0);
	const	[fromVault, set_fromVault] = useLocalStorage('fromVault', yVaults[0]);
	const	[fromCounterValue, set_fromCounterValue] = useLocalStorage('fromCounterValue', 0);
	const	[fromAmount, set_fromAmount] = useLocalStorage('fromAmount', '');
	const	[balanceOfFromVault, set_balanceOfFromVault] = useState(0);
	const	[toVaultsListV2, set_toVaultsListV2] = useState(SWAPS.filter(e => e[0] === yVaults[0]));
	const	[toVaultsList, set_toVaultsList] = useState(yVaults.slice(1));
	const	[toVault, set_toVault] = useLocalStorage('toVault', yVaults[1]);
	const	[toCounterValue, set_toCounterValue] = useState(0);
	const	[expectedReceiveAmount, set_expectedReceiveAmount] = useState('');
	const	[slippage, set_slippage] = useState(0.05);
	const	[donation, set_donation] = useState(0.3);
	const	[isFetchingExpectedReceiveAmount, set_isFetchingExpectedReceiveAmount] = useState(false);
	const	debouncedFetchExpectedAmount = useDebounce(fromAmount, 750);
	const	[txApproveStatus, set_txApproveStatus] = useState({none: true, pending: false, success: false, error: false});
	const	[txSwapStatus, set_txSwapStatus] = useState({none: true, pending: false, success: false, error: false});
	const	[signature, set_signature] = useState(null);

	function	resetStates() {
		set_signature(null);
		set_fromAmount('');
		set_toCounterValue(0);
		set_expectedReceiveAmount('');
		set_slippage(0.05);
		set_donation(0.3);
		set_txApproveStatus({none: true, pending: false, success: false, error: false});
		set_txSwapStatus({none: true, pending: false, success: false, error: false});
	}

	async function computeTriCryptoPrice() {
		const	LP_TOKEN = '0xcA3d75aC011BF5aD07a98d02f18225F9bD9A6BDF';
		const	magicAddress = '0x83d95e0D5f402511dB06817Aff3f9eA88224B030';
		const	magicContract = new ethers.Contract(magicAddress, ['function getNormalizedValueUsdc(address, uint256) public view returns (uint256)'], provider);
		const	priceUSDC = await magicContract.getNormalizedValueUsdc(LP_TOKEN, '1000000000000000000');
		return	ethers.utils.formatUnits(priceUSDC, 6);
	}

	const	fetchEstimateOut = useCallback(async (from, to, amount) => {
		if (!provider || !active) {
			return;
		}
		const	Bowswap_Contract = new ethers.Contract(process.env.BOWSWAP_SWAPPER_ADDR, [
			'function metapool_estimate_out(address, address, uint256, uint256) public view returns (uint256)',
			'function estimate_out(address, address, uint256, tuple(uint8, address, uint128, uint128)[], uint256) public view returns (uint256)'
		], provider);

		if (toVault.metapool) {
			const	metapool_estimate_out = await Bowswap_Contract.metapool_estimate_out(
				from,
				to,
				amount,
				donation * 100
			);
			set_expectedReceiveAmount(ethers.utils.formatUnits(metapool_estimate_out, toVault.decimals));
			set_isFetchingExpectedReceiveAmount(false);
		} else {
			const	possibleSwap = SWAPS.find(path => path[0] === fromVault.address && path[1] === toVault.address);
			if (possibleSwap !== undefined) {
				const	estimate_out = await Bowswap_Contract.estimate_out(
					from,
					to,
					amount,
					possibleSwap[2],
					donation * 100
				);
				set_expectedReceiveAmount(ethers.utils.formatUnits(estimate_out, toVault.decimals));
				set_isFetchingExpectedReceiveAmount(false);
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromVault?.address, active, provider, toVault?.address, toVault?.decimals, toVault?.type, donation]);

	/**************************************************************************
	**	This function will be used to compute the counter value of the want
	**	token of the `FROM` vault.
	**	To compute the price of the token, we will need the virtualPrice, aka
	**	the ~ price of the tokens in the curve pool and the pricePerShare, to
	**	know how many tokens we are working with.
	**	We will also need the price of the underlying token to adapt the price
	**	to USD.
	**
	**	@TRIGGER : any time the `FROM` vault changes
	**************************************************************************/
	async function fetchFromVaultVirtualPrice() {
		const	poolContract = new ethers.Contract(
			process.env.CURVE_REGISTRY_ADDR,
			['function get_virtual_price_from_lp_token(address) public view returns (uint256)'],
			provider
		);
		const	vaultContract = new ethers.Contract(fromVault.address, [
			'function pricePerShare() public view returns (uint256)',
			'function balanceOf(address) public view returns (uint256)'
		], provider);
		const	underlyingContract = new ethers.Contract(
			fromVault?.token?.address,
			['function balanceOf(address) public view returns (uint256)'],
			provider
		);
		const	virtualPrice = await poolContract.get_virtual_price_from_lp_token(fromVault?.token?.address);
		const	pricePerShare = await vaultContract.pricePerShare();
		const	balanceOfVault = await underlyingContract.balanceOf(fromVault.address);
		const	scaledBalanceOf = ethers.BigNumber.from(ethers.constants.WeiPerEther).mul(pricePerShare).div(ethers.BigNumber.from(10).pow(18)).mul(virtualPrice).div(ethers.BigNumber.from(10).pow(18));

		const	isEUR = ((fromVault.display_name).toLowerCase()).includes('eur');
		const	isBTC = ((fromVault.display_name).toLowerCase()).includes('btc');
		const	isETH = ((fromVault.display_name).toLowerCase()).includes('eth');
		const	isAAVE = ((fromVault.display_name).toLowerCase()).includes('aave');
		const	isLINK = ((fromVault.display_name).toLowerCase()).includes('link');
		const	isTRI = (((fromVault.display_name).toLowerCase()).includes('tri') || ((fromVault.display_name).toLowerCase()).includes('3crypto'));

		if (isBTC) {
			set_fromCounterValue(prices.bitcoin.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (isEUR) {
			set_fromCounterValue((prices?.['tether-eurt'].usd || 1) * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (isETH) {
			set_fromCounterValue(prices.ethereum.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (isAAVE) {
			set_fromCounterValue(prices.aave.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (isLINK) {
			set_fromCounterValue(prices.chainlink.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (isTRI) {
			const	price = await computeTriCryptoPrice();
			set_fromCounterValue(price * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else {
			set_fromCounterValue(ethers.utils.formatUnits(scaledBalanceOf, 18));
		}
		set_balanceOfFromVault(ethers.utils.formatUnits(balanceOfVault, fromVault.decimals));
	}

	/**************************************************************************
	**	This function will be used to compute the counter value of the want
	**	token of the `TO` vault.
	**	To compute the price of the token, we will need the virtualPrice, aka
	**	the ~ price of the tokens in the curve pool and the pricePerShare, to
	**	know how many tokens we are working with.
	**	We will also need the price of the underlying token to adapt the price
	**	to USD.
	**
	**	@TRIGGER : any time the `TO` vault changes
	**************************************************************************/
	async function fetchToVaultVirtualPrice() {
		if (!toVault) {
			return;
		}
		const	poolContract = new ethers.Contract(
			process.env.CURVE_REGISTRY_ADDR,
			['function get_virtual_price_from_lp_token(address) public view returns (uint256)'],
			provider
		);
		const	vaultContract = new ethers.Contract(
			toVault.address,
			['function pricePerShare() public view returns (uint256)'],
			provider
		);
		const	virtualPrice = await poolContract.get_virtual_price_from_lp_token(toVault?.token?.address);
		const	pricePerShare = await vaultContract.pricePerShare();
		const	scaledBalanceOf = ethers.BigNumber.from(ethers.constants.WeiPerEther).mul(pricePerShare).div(ethers.BigNumber.from(10).pow(18)).mul(virtualPrice).div(ethers.BigNumber.from(10).pow(18));

		const	isEUR = ((toVault.display_name).toLowerCase()).includes('eur');
		const	isBTC = ((toVault.display_name).toLowerCase()).includes('btc');
		const	isETH = ((toVault.display_name).toLowerCase()).includes('eth');
		const	isAAVE = ((toVault.display_name).toLowerCase()).includes('aave');
		const	isLINK = ((toVault.display_name).toLowerCase()).includes('link');
		const	isTRI = (((toVault.display_name).toLowerCase()).includes('tri') || ((toVault.display_name).toLowerCase()).includes('3crypto'));

		if (isBTC) {
			set_toCounterValue(prices.bitcoin.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (isEUR) {
			set_toCounterValue((prices?.['tether-eurt'].usd || 1) * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (isETH) {
			set_toCounterValue(prices.ethereum.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (isAAVE) {
			set_toCounterValue(prices.aave.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (isLINK) {
			set_toCounterValue(prices.chainlink.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (isTRI) {
			const	price = await computeTriCryptoPrice();
			set_toCounterValue(price * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else {
			set_toCounterValue(ethers.utils.formatUnits(scaledBalanceOf, 18));
		}
	}

	/**************************************************************************
	**	Any time the fromVault address is changed, we need to change the list
	**	of addresses that can be used as `TO` vaults. With BowswapV2 there is
	**	two available list, the Legacy (aka metapool, aka btc <> btc or
	**	usd <> usd), and the V2, allowing swap between pools.
	**
	**	@TRIGGER : any time the `FROM` vault changes
	**************************************************************************/
	useEffect(() => {
		if (!provider || !active || !fromVault?.token) {
			return;
		}

		let		_hasPath = false;
		const	_legacyPaths = METAPOOL_SWAPS
			.filter(e => toAddress(e[0]) === toAddress(fromVault?.address))
			.map(e => e[1]);
		const	_toVault = yVaults
			.filter(e => _legacyPaths.includes(toAddress(e.address)))
			.map(e => ({...e, metapool: true}));
		set_toVaultsList(_toVault);
		if (_toVault.length > 0) {
			_hasPath = true;
			set_toVault(_toVault[0] || null);
		}

		const	_paths = SWAPS
			.filter(e => toAddress(e[0]) === toAddress(fromVault.address))
			.map(e => e[1]);
		const	_toVault2 = yVaults
			.filter(e => _paths.includes(toAddress(e.address)))
			.map(e => ({...e, metapool: false}));
		set_toVaultsListV2(_toVault2);
		if (!_hasPath) {
			set_toVault(_toVault2[0] || null);
		}

		if (provider)
			fetchFromVaultVirtualPrice();
		set_nonce(n => n + 1);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromVault?.address, provider, active]);

	/**************************************************************************
	**	Any time the fromVault address is changed, we need to change the list
	**	of addresses that can be used as `TO` vaults. With BowswapV2 there is
	**	two available list, the Legacy (aka metapool, aka btc <> btc or
	**	usd <> usd), and the V2, allowing swap between pools.
	**
	**	@TRIGGER : any time the `TO` vault changes
	**************************************************************************/
	useEffect(() => {
		if (provider && active) {
			fetchToVaultVirtualPrice();
			set_nonce(n => n + 1);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toVault?.address, provider, active]);

	/**************************************************************************
	**	This is used to get the estimateOut based on the current inputed
	**	amount. This is triggered with a delay to avoid too many requests
	**
	**	@TRIGGER : any time the debouncedFetchExpectedAmount can be called,
	**	plus when the `FROM` vault changes or the `TO` vault changes
	**************************************************************************/
	useEffect(() => {
		if (Number(fromAmount) !== 0 && toVault?.address) {
			set_isFetchingExpectedReceiveAmount(true);
			fetchEstimateOut(
				fromVault.address,
				toVault.address,
				ethers.utils.parseUnits(fromAmount, fromVault.decimals)
			);
			set_nonce(n => n + 1);
		} else {
			set_expectedReceiveAmount('');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedFetchExpectedAmount, fromAmount, donation, fromVault?.address, toVault?.address, fromVault?.decimals]);

	if (!fromVault) {
		return null;
	}

	return (
		<div className={'w-full max-w-2xl'}>
			<div className={'bg-white rounded-xl shadow-base p-4 w-full relative space-y-0 md:space-y-4'}>
				<SectionFromVault
					disabled={!txApproveStatus.none || (!txSwapStatus.none && !txSwapStatus.success)}
					vaults={yVaults}
					fromVault={fromVault}
					set_fromVault={set_fromVault}
					fromAmount={fromAmount}
					set_fromAmount={set_fromAmount}
					fromCounterValue={fromCounterValue}
					balanceOf={balancesOf[fromVault?.address]?.toString() || '0'}
					slippage={slippage}
					set_slippage={set_slippage}
					donation={donation}
					set_donation={set_donation}
					yVaults={yVaults} />

				<div className={'flex w-full justify-center pt-4'}>
					<SectionBlockStatus
						txApproveStatus={txApproveStatus}
						txSwapStatus={txSwapStatus}
						slippage={slippage}
						fromAmount={fromAmount}
						balancesOf={balancesOf}
						fromVault={fromVault}
						toVault={toVault} />
				</div>

				<SectionToVault
					disabled={!txApproveStatus.none || (!txSwapStatus.none && !txSwapStatus.success)}
					vaults={[...toVaultsList, ...toVaultsListV2]}
					toVault={toVault}
					set_toVault={set_toVault}
					expectedReceiveAmount={expectedReceiveAmount}
					toCounterValue={toCounterValue}
					slippage={slippage}
					balanceOf={balancesOf[toVault?.address]?.toString() || '0'}
					isFetchingExpectedReceiveAmount={isFetchingExpectedReceiveAmount}
					yVaults={yVaults} />

				<SectionButtons
					fromAmount={fromAmount}
					fromVault={fromVault}
					balanceOfFromVault={balanceOfFromVault}
					expectedReceiveAmount={expectedReceiveAmount}
					toVault={toVault}
					slippage={slippage}
					donation={donation}
					txApproveStatus={txApproveStatus}
					set_txApproveStatus={set_txApproveStatus}
					signature={signature}
					set_signature={set_signature}
					set_txSwapStatus={set_txSwapStatus}
					resetStates={resetStates} />
			</div>
		</div>
	);
}

export default Bowswap;