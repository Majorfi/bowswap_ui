import	React, {useState, useEffect}					from	'react';
import	{ethers}										from	'ethers';
import	useWeb3											from	'contexts/useWeb3';
import	useAccount										from	'contexts/useAccount';
import	useLocalStorage									from	'hook/useLocalStorage';
import	useDebounce										from	'hook/useDebounce';
import	SectionButtons									from	'components/Bowswap/SectionButtons';
import	SectionFromVault 								from	'components/Bowswap/SectionFromVault';
import	SectionToVault 									from	'components/Bowswap/SectionToVault';
import	SectionBlockStatus								from	'components/Bowswap/SectionBlockStatus';
import	{toAddress, computeTriCryptoPrice}				from	'utils';
import	METAPOOL_SWAPS									from	'utils/swaps/ethereum/metapoolSwaps';
import	SWAPS											from	'utils/swaps/ethereum/swaps';

function parseAmount(amount) {
	let		_value = amount.replaceAll('..', '.').replaceAll(/[^0-9.]/g, '');
	const	[dec, frac] = _value.split('.');
	if (frac) _value = `${dec}.${frac.slice(0, 12)}`;

	if (_value === '.') {
		return ('0.');
	} else if (_value.length > 0 && _value[0] === '-') {
		return ('');
	} else if (_value.length >= 2 && _value[0] === '0' && _value[1] !== '.') {
		return (_value.slice(1) || '');
	} else {
		return (_value || '');
	}
}

function	Bowswap({prices, yVaults}) {
	const	{provider, active} = useWeb3();
	const	{balancesOf} = useAccount();
	const	[, set_nonce] = useState(0);
	const	[fromVault, set_fromVault] = useLocalStorage('fromVault', yVaults[0]);
	const	[fromCounterValue, set_fromCounterValue] = useLocalStorage('fromCounterValue', 0);
	const	[fromAmount, set_fromAmount] = useLocalStorage('fromAmount', '');
	const	[balanceOfFromVault, set_balanceOfFromVault] = useState(0);
	const	[toVaultsListV2, set_toVaultsListV2] = useState([]);
	const	[toVaultsList, set_toVaultsList] = useState([]);
	const	[toVault, set_toVault] = useLocalStorage('toVault', {});

	const	[toCounterValue, set_toCounterValue] = useState(0);
	const	[expectedReceiveAmount, set_expectedReceiveAmount] = useState('');
	const	[slippage, set_slippage] = useState(0.05);
	const	[donation, set_donation] = useState(0.3);
	const	[isFetchingExpectedReceiveAmount, set_isFetchingExpectedReceiveAmount] = useState(false);
	const	debouncedFromAmount = useDebounce(fromAmount, 750);
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

	async function	fetchEstimateOut({_from, _to, _amount, _donation}) {
		if (txApproveStatus.error)
			set_txApproveStatus({none: false, pending: false, success: false, error: false});
		if (ethers.BigNumber.from(_amount).isZero())
			return (0);

		const	Bowswap_Contract = new ethers.Contract(process.env.BOWSWAP_SWAPPER_ADDR, [
			'function metapool_estimate_out(address, address, uint256, uint256) public view returns (uint256)',
			'function estimate_out(address, address, uint256, tuple(uint8, address, uint128, uint128)[], uint256) public view returns (uint256)'
		], provider);

		if (toVault.metapool) {
			try {
				const	metapool_estimate_out = await Bowswap_Contract.metapool_estimate_out(
					_from,
					_to,
					_amount,
					_donation * 100
				);
				return (ethers.utils.formatUnits(metapool_estimate_out, toVault.decimals));
			} catch (e) {
				set_txApproveStatus({none: false, pending: false, success: false, error: true, message: 'Impossible to use this path right now'});
				return (0);
			}
		} else {
			const	possibleSwap = SWAPS.find(path => path[0] === fromVault.address && path[1] === toVault.address);
			if (possibleSwap !== undefined) {
				try {
					const	estimate_out = await Bowswap_Contract.estimate_out(
						_from,
						_to,
						_amount,
						possibleSwap[2],
						_donation * 100
					);
					return (ethers.utils.formatUnits(estimate_out, toVault.decimals));
				} catch (e) {
					set_txApproveStatus({none: false, pending: false, success: false, error: true, message: 'Impossible to use this path right now'});
					return (0);
				}
			}
		}
		return (0);
	}

	async function fetchVaultVirtualPrice({_provider, _vault, _underlying, _prices, _name, _decimals}) {
		const	CURVE_REGISTRY_CONTRACT = new ethers.Contract(
			process.env.CURVE_REGISTRY_ADDR,
			['function get_virtual_price_from_lp_token(address) public view returns (uint256)'],
			_provider
		);
	
		const	YEARN_VAULT_CONTRACT = new ethers.Contract(
			_vault,
			['function pricePerShare() public view returns (uint256)'],
			_provider
		);
	
		let	scaledBalanceOf = 1;
		try {
			const	virtualPrice = await CURVE_REGISTRY_CONTRACT.get_virtual_price_from_lp_token(_underlying);
			const	pricePerShare = await YEARN_VAULT_CONTRACT.pricePerShare();
			scaledBalanceOf = ethers.BigNumber.from(ethers.constants.WeiPerEther)
				.mul(pricePerShare).div(ethers.BigNumber.from(10).pow(18))
				.mul(virtualPrice).div(ethers.BigNumber.from(10).pow(18));
		} catch (e) {
			const	pricePerShare = await YEARN_VAULT_CONTRACT.pricePerShare();
			scaledBalanceOf = ethers.BigNumber.from(ethers.constants.WeiPerEther)
				.mul(pricePerShare).div(ethers.BigNumber.from(10).pow(18));
		}

		const	isEUR = (_name.toLowerCase()).includes('eur');
		const	isBTC = (_name.toLowerCase()).includes('btc');
		const	isETH = (_name.toLowerCase()).includes('eth');
		const	isAAVE = (_name.toLowerCase()).includes('aave');
		const	isLINK = (_name.toLowerCase()).includes('link');
		const	isTRI = ((_name.toLowerCase()).includes('tri') || (_name.toLowerCase()).includes('3crypto'));
	
		if (isBTC) {
			return (_prices.bitcoin.usd * ethers.utils.formatUnits(scaledBalanceOf, _decimals));
		} else if (isEUR) {
			return ((_prices?.['tether-eurt'].usd || 1) * ethers.utils.formatUnits(scaledBalanceOf, _decimals));
		} else if (isETH) {
			return (_prices.ethereum.usd * ethers.utils.formatUnits(scaledBalanceOf, _decimals));
		} else if (isAAVE) {
			return (_prices.aave.usd * ethers.utils.formatUnits(scaledBalanceOf, _decimals));
		} else if (isLINK) {
			return (_prices.chainlink.usd * ethers.utils.formatUnits(scaledBalanceOf, _decimals));
		} else if (isTRI) {
			const	price = await computeTriCryptoPrice(provider);
			return (price * ethers.utils.formatUnits(scaledBalanceOf, _decimals));
		} else {
			return (ethers.utils.formatUnits(scaledBalanceOf, _decimals));
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

		/**********************************************************************
		**	First check if a legacy path (aka metapool swap) exists. Cheaper to
		**	compute than the V2 path.
		**********************************************************************/
		let		_hasPath = false;
		const	_legacyPaths = METAPOOL_SWAPS.filter(e => toAddress(e[0]) === toAddress(fromVault?.address)).map(e => e[1]);
		const	_toVault = yVaults.filter(e => _legacyPaths.includes(toAddress(e.address))).map(e => ({...e, metapool: true}));
		set_toVaultsList(_toVault);
		if (_toVault.length > 0) {
			_hasPath = true;
			set_toVault(_toVault[0] || null);
		}

		/**********************************************************************
		**	Then find the possible v2 paths.
		**********************************************************************/
		const	_paths = SWAPS.filter(e => toAddress(e[0]) === toAddress(fromVault.address)).map(e => e[1]);
		const	_toVault2 = yVaults.filter(e => _paths.includes(toAddress(e.address))).map(e => ({...e, metapool: false}));
		set_toVaultsListV2(_toVault2);
		if (!_hasPath) {
			set_toVault(_toVault2[0] || null);
		}

		/**********************************************************************
		**	Finally, compute the virtual price of the number for the from
		**	vault to use it as price.
		**********************************************************************/
		fetchVaultVirtualPrice({
			_provider: provider,
			_vault: fromVault.address,
			_underlying: fromVault.token.address,
			_prices: prices,
			_name: fromVault.display_name,
			_decimals: fromVault.decimals,
		}).then((virtualPrice) => set_fromCounterValue(virtualPrice));

		/**********************************************************************
		**	Sometime the from vault do not have enough liquidity to be used.
		**	In this situation, we need to increase gas limit because the
		**	contract will try to withdraw funds from strategies.
		**********************************************************************/
		const	underlyingContract = new ethers.Contract(
			fromVault?.token?.address,
			['function balanceOf(address) public view returns (uint256)'],
			provider
		);
		underlyingContract.balanceOf(fromVault.address).then((balanceOfVault) => {
			const	balance = balancesOf[fromVault?.address];
			if (balance)
				set_fromAmount(parseAmount(ethers.utils.formatUnits(balance, fromVault.decimals)));
			set_balanceOfFromVault(ethers.utils.formatUnits(balanceOfVault, fromVault.decimals));
		});

		set_nonce(n => n + 1);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromVault, provider, active]);

	/**************************************************************************
	**	Any time the fromVault address is changed, we need to change the list
	**	of addresses that can be used as `TO` vaults. With BowswapV2 there is
	**	two available list, the Legacy (aka metapool, aka btc <> btc or
	**	usd <> usd), and the V2, allowing swap between pools.
	**
	**	@TRIGGER : any time the `TO` vault changes
	**************************************************************************/
	useEffect(() => {
		if (provider && active && toVault?.token) {
			set_isFetchingExpectedReceiveAmount(true);
			set_expectedReceiveAmount('');
			Promise.all([
				fetchEstimateOut({
					_from: fromVault.address,
					_to: toVault.address,
					_amount: ethers.utils.parseUnits(Number(fromAmount).toFixed(fromVault.decimals), fromVault.decimals),
					_donation: donation
				}),
				fetchVaultVirtualPrice({
					_provider: provider,
					_vault: toVault.address,
					_underlying: toVault.token.address,
					_prices: prices,
					_name: toVault.display_name,
					_decimals: toVault.decimals,
				})
			]).then(([estimateOut, virtualPrice]) => {
				set_expectedReceiveAmount(estimateOut);
				set_toCounterValue(virtualPrice);
				set_isFetchingExpectedReceiveAmount(false);
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toVault?.address, provider, active]);

	useEffect(() => {
		if (provider && active && toVault) {
			set_isFetchingExpectedReceiveAmount(true);
			set_expectedReceiveAmount('');
			fetchEstimateOut({
				_from: fromVault.address,
				_to: toVault.address,
				_amount: ethers.utils.parseUnits(Number(debouncedFromAmount).toFixed(fromVault.decimals), fromVault.decimals),
				_donation: donation
			}).then((estimateOut) => {
				set_expectedReceiveAmount(estimateOut);
				set_isFetchingExpectedReceiveAmount(false);
			});
		} else {
			set_expectedReceiveAmount('0');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toVault?.address, provider, active, debouncedFromAmount]);

	if (!fromVault) {
		return null;
	}

	return (
		<div className={'w-full max-w-2xl'}>
			<div className={'bg-white rounded-xl shadow-base p-4 w-full relative space-y-0 md:space-y-4'}>
				<SectionFromVault
					disabled={txApproveStatus.success || (!txSwapStatus.none && !txSwapStatus.success)}
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
					disabled={txApproveStatus.success || (!txSwapStatus.none && !txSwapStatus.success)}
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