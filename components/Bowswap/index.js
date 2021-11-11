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
import	BOWSWAP_CRV_EUR_VAULTS							from	'utils/BOWSWAP_CRV_EUR_VAULTS';
import	BOWSWAP_CRV_BTC_VAULTS							from	'utils/BOWSWAP_CRV_BTC_VAULTS';
import	BOWSWAP_CRV_USD_VAULTS							from	'utils/BOWSWAP_CRV_USD_VAULTS';
import	BOWSWAP_CRV_V2_VAULTS							from	'utils/BOWSWAP_CRV_V2_VAULTS';
import	V2_PATHS										from	'utils/currentPaths';
import	{bigNumber, toAddress}							from	'utils';

function	Bowswap({prices}) {
	const	{provider, active} = useWeb3();
	const	{balancesOf, yearnVaultData} = useAccount();
	const	[, set_nonce] = useState(0);
	const	[fromVault, set_fromVault] = useLocalStorage('fromVault', BOWSWAP_CRV_USD_VAULTS[0]);
	const	[fromCounterValue, set_fromCounterValue] = useLocalStorage('fromCounterValue', 0);
	const	[fromAmount, set_fromAmount] = useLocalStorage('fromAmount', '');
	const	[balanceOfFromVault, set_balanceOfFromVault] = useState(0);
	const	[toVaultsListV2, set_toVaultsListV2] = useState(V2_PATHS.filter(e => e[0] === BOWSWAP_CRV_USD_VAULTS[0]));
	const	[toVaultsList, set_toVaultsList] = useState(BOWSWAP_CRV_USD_VAULTS.slice(1));
	const	[toVault, set_toVault] = useLocalStorage('toVault', BOWSWAP_CRV_USD_VAULTS[1]);
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
		const	fromToken = new ethers.Contract(process.env.BOWSWAP_SWAPPER_ADDR, [
			'function metapool_estimate_out(address from, address to, uint256 amount, uint256 donation) public view returns (uint256)',
			'function estimate_out(address from, address to, uint256 amount, tuple(bool deposit, address pool, uint128 n)[] instructions, uint256 donation) public view returns (uint256)'
		], provider);

		if (toVault.scope === 'v2') {
			if (V2_PATHS.find(path => path[0] === fromVault.address && path[1] === toVault.address) !== undefined) {
				const	estimate_out = await fromToken.estimate_out(
					from,
					to,
					amount,
					V2_PATHS.find(path => path[0] === fromVault.address && path[1] === toVault.address)?.[2],
					10_000 - donation * 100
				);
				set_expectedReceiveAmount(ethers.utils.formatUnits(estimate_out, toVault.decimals));
				set_isFetchingExpectedReceiveAmount(false);
			}
		} else {
			const	metapool_estimate_out = await fromToken.metapool_estimate_out(
				from,
				to,
				amount,
				10_000 - donation * 100
			);
			set_expectedReceiveAmount(ethers.utils.formatUnits(metapool_estimate_out, toVault.decimals));
			set_isFetchingExpectedReceiveAmount(false);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromVault.address, active, provider, toVault?.address, toVault?.decimals, toVault?.scope, toVault?.type, donation]);

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
		const	poolContract = new ethers.Contract(fromVault.poolAddress, ['function get_virtual_price() public view returns (uint256)'], provider);
		const	vaultContract = new ethers.Contract(fromVault.address, [
			'function pricePerShare() public view returns (uint256)',
			'function balanceOf(address) public view returns (uint256)'
		], provider);
		const	underlyingContract = new ethers.Contract(fromVault.tokenAddress, [
			'function balanceOf(address) public view returns (uint256)'
		], provider);
		const	virtualPrice = await poolContract.get_virtual_price();
		const	pricePerShare = await vaultContract.pricePerShare();
		const	balanceOfVault = await underlyingContract.balanceOf(fromVault.address);
		const	scaledBalanceOf = bigNumber.from(ethers.constants.WeiPerEther).mul(pricePerShare).div(bigNumber.from(10).pow(18)).mul(virtualPrice).div(bigNumber.from(10).pow(18));

		if (fromVault.scope === 'btc' || (fromVault.scope === 'v2' && fromVault.type === 'btc')) {
			set_fromCounterValue(prices.bitcoin.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (fromVault.scope === 'eur' || (fromVault.scope === 'v2' && fromVault.type === 'eur')) {
			set_fromCounterValue((prices?.['tether-eurt'].usd || 1) * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (fromVault.scope === 'v2' && fromVault.type === 'eth') {
			set_fromCounterValue(prices.ethereum.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (fromVault.scope === 'v2' && fromVault.type === 'aave') {
			set_fromCounterValue(prices.aave.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (fromVault.scope === 'v2' && fromVault.type === 'link') {
			set_fromCounterValue(prices.chainlink.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (fromVault.scope === 'v2' && fromVault.type === 'tri') {
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
		const	poolContract = new ethers.Contract(toVault.poolAddress, ['function get_virtual_price() public view returns (uint256)'], provider);
		const	vaultContract = new ethers.Contract(toVault.address, ['function pricePerShare() public view returns (uint256)'], provider);
		const	virtualPrice = await poolContract.get_virtual_price();
		const	pricePerShare = await vaultContract.pricePerShare();
		const	scaledBalanceOf = bigNumber.from(ethers.constants.WeiPerEther).mul(pricePerShare).div(bigNumber.from(10).pow(18)).mul(virtualPrice).div(bigNumber.from(10).pow(18));

		if (toVault.scope === 'btc' || (toVault.scope === 'v2' && toVault.type === 'btc')) {
			set_toCounterValue(prices.bitcoin.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (toVault.scope === 'eur' || (toVault.scope === 'v2' && toVault.type === 'eur')) {
			set_toCounterValue((prices?.['tether-eurt'].usd || 1) * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (toVault.scope === 'v2' && toVault.type === 'eth') {
			set_toCounterValue(prices.ethereum.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (toVault.scope === 'v2' && toVault.type === 'aave') {
			set_toCounterValue(prices.aave.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (toVault.scope === 'v2' && toVault.type === 'link') {
			set_toCounterValue(prices.chainlink.usd * ethers.utils.formatUnits(scaledBalanceOf, 18));
		} else if (toVault.scope === 'v2' && toVault.type === 'tri') {
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
		if (!provider || !active) {
			return;
		}
		const	V2Paths = V2_PATHS.filter(e => toAddress(e[0]) === toAddress(fromVault.address)).map(e => e[1]);
		const	V2VaultList = BOWSWAP_CRV_V2_VAULTS.filter(e => V2Paths.includes(toAddress(e.address)));
		set_toVaultsListV2(V2VaultList);

		if (fromVault.scope === 'btc') {
			const	vaultList = BOWSWAP_CRV_BTC_VAULTS.filter(e => e.address !== fromVault.address);
			set_toVaultsList(vaultList);
			if (toVault.scope !== 'btc' || fromVault.address === toVault.address || !V2Paths.includes(toAddress(toVault.address)))
				set_toVault(vaultList[0]);
		} else if (fromVault.scope === 'usd') {
			const	vaultList = BOWSWAP_CRV_USD_VAULTS.filter(e => e.address !== fromVault.address);
			set_toVaultsList(vaultList);
			if (toVault.scope !== 'usd' || fromVault.address === toVault.address || !V2Paths.includes(toAddress(toVault.address)))
				set_toVault(vaultList[0]);
		} else if (fromVault.scope === 'eur') {
			const	vaultList = BOWSWAP_CRV_EUR_VAULTS.filter(e => e.address !== fromVault.address);
			set_toVaultsList(vaultList);
			if (toVault.scope !== 'eur' || fromVault.address === toVault.address || !V2Paths.includes(toAddress(toVault.address)))
				set_toVault(vaultList[0]);
		} else {
			set_toVaultsList([]);
			if (!V2Paths.includes(toVault.address) || toVault.scope !== 'v2') {
				set_toVault(V2VaultList[0]);
			}
		}

		if (provider)
			fetchFromVaultVirtualPrice();
		set_nonce(n => n + 1);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromVault.address, provider, active]);

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
		if (Number(fromAmount) !== 0) {
			set_isFetchingExpectedReceiveAmount(true);
			fetchEstimateOut(fromVault.address, toVault.address, ethers.utils.parseUnits(fromAmount, fromVault.decimals));
			set_nonce(n => n + 1);
		} else {
			set_expectedReceiveAmount('');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedFetchExpectedAmount, fromAmount, donation, fromVault.address, toVault?.address, fromVault.decimals]);

	return (
		<div className={'w-full max-w-2xl'}>
			<div className={'bg-white rounded-xl shadow-base p-4 w-full relative space-y-0 md:space-y-4'}>
				<SectionFromVault
					disabled={!txApproveStatus.none || (!txSwapStatus.none && !txSwapStatus.success)}
					vaults={[...BOWSWAP_CRV_USD_VAULTS, ...BOWSWAP_CRV_BTC_VAULTS, ...BOWSWAP_CRV_EUR_VAULTS, ...BOWSWAP_CRV_V2_VAULTS]}
					fromVault={fromVault}
					set_fromVault={set_fromVault}
					fromAmount={fromAmount}
					set_fromAmount={set_fromAmount}
					fromCounterValue={fromCounterValue}
					balanceOf={balancesOf[fromVault.address]?.toString() || '0'}
					slippage={slippage}
					set_slippage={set_slippage}
					donation={donation}
					set_donation={set_donation}
					yearnVaultData={yearnVaultData} />

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
					balanceOf={balancesOf[toVault.address]?.toString() || '0'}
					isFetchingExpectedReceiveAmount={isFetchingExpectedReceiveAmount}
					yearnVaultData={yearnVaultData} />

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