import	React, {useState, useEffect, useContext, createContext, useCallback}	from	'react';
import	{ethers}							from	'ethers';
import	QRCodeModal							from	'@walletconnect/qrcode-modal';
import	{useWeb3React}						from	'@web3-react/core';
import	{InjectedConnector}					from	'@web3-react/injected-connector';
import	{ConnectorEvent}					from	'@web3-react/types';
import	{WalletConnectConnector}			from	'@web3-react/walletconnect-connector';
import	useLocalStorage						from	'hook/useLocalStorage';
import	useWindowInFocus					from	'hook/useWindowInFocus';
import	useDebounce							from	'hook/useDebounce';
import	{toAddress}							from	'utils';

const walletType = {NONE: -1, METAMASK: 0, WALLET_CONNECT: 1};
const Web3Context = createContext();

function getProvider(chain = 'ethereum') {
	if (chain === 'ethereum') {
		return new ethers.providers.AlchemyProvider('homestead', process.env.ALCHEMY_KEY);
	} else if (chain === 'major') {
		return new ethers.providers.JsonRpcProvider('http://localhost:8545');
	}
	return (new ethers.providers.AlchemyProvider('homestead', process.env.ALCHEMY_KEY));
}

export const Web3ContextApp = ({children}) => {
	const	web3 = useWeb3React();
	const	{activate, active, library, connector, account, chainId, deactivate} = web3;
	const	[provider, set_provider] = useState(undefined);
	const	[address, set_address] = useLocalStorage('address', '');
	const	[ens, set_ens] = useLocalStorage('ens', '');
	const	[chainID, set_chainID] = useLocalStorage('chainID', -1);
	const	[lastWallet, set_lastWallet] = useLocalStorage('lastWallet', walletType.NONE);
	const	[, set_nonce] = useState(0);
	const	[disableAutoChainChange, set_disableAutoChainChange] = useState(false);
	const	debouncedChainID = useDebounce(chainID, 500);
	const	windowInFocus = useWindowInFocus();

	const onUpdate = useCallback(async (update) => {
		if (update.provider) {
			set_provider(library);
		}
		if (update.chainId) {
			const	isANumber = !isNaN(update.chainId) && !String(update.chainId).startsWith('0x');
			set_chainID(isANumber ? Number(update.chainId) : parseInt(update.chainId, 16));
		}
		if (update.account) {
			await getProvider().lookupAddress(toAddress(update.account)).then(_ens => set_ens(_ens || ''));
			set_address(toAddress(update.account));
		}
		set_nonce(n => n + 1);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [library]);

	const onDesactivate = useCallback(() => {
		set_chainID(-1);
		set_provider(undefined);
		set_lastWallet(walletType.NONE);
		set_address('');
		set_ens('');
		if (connector !== undefined) {
			connector
				.off(ConnectorEvent.Update, onUpdate)
				.off(ConnectorEvent.Deactivate, onDesactivate);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connector]);

	const onActivate = useCallback(async () => {
		set_provider(library);
		set_address(toAddress(account));
		const	isANumber = !isNaN(chainId) && !String(chainId).startsWith('0x');
		set_chainID(isANumber ? Number(chainId) : parseInt(chainId, 16));
		await getProvider().lookupAddress(toAddress(account)).then(_ens => set_ens(_ens || ''));

		connector
			.on(ConnectorEvent.Update, onUpdate)
			.on(ConnectorEvent.Deactivate, onDesactivate);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account, chainId, connector, library, onDesactivate, onUpdate]);

	const onSwitchChain = useCallback((force) => {
		if (!force && (!active || disableAutoChainChange)) {
			return;
		}
		const	isCompatibleChain = (
			Number(debouncedChainID) === 1 ||
			Number(debouncedChainID) === 1337
		);
		if (isCompatibleChain) {
			return;
		}
		if (!provider || !active) {
			console.error('Not initialized');
			return;
		}
		provider
			.send('wallet_switchEthereumChain', [{chainId: '0x1'}])
			.catch(() => set_disableAutoChainChange(true));
	}, [active, disableAutoChainChange, debouncedChainID, provider]);

	useEffect(() => {
		onSwitchChain();
	}, [windowInFocus, onSwitchChain]);

	/**************************************************************************
	**	connect
	**	What should we do when the user choose to connect it's wallet ?
	**	Based on the providerType (AKA Metamask or WalletConnect), differents
	**	actions should be done.
	**	Then, depending on the providerType, a similar action, but different
	**	code is executed to set :
	**	- The provider for the web3 actions
	**	- The current address/account
	**	- The current chain
	**	Moreover, we are starting to listen to events (disconnect, changeAccount
	**	or changeChain).
	**************************************************************************/
	const connect = useCallback(async (_providerType) => {
		if (_providerType === walletType.METAMASK) {
			if (active) {
				deactivate();
			}
			const	injected = new InjectedConnector();
			activate(injected, undefined, true);
			set_lastWallet(walletType.METAMASK);
		} else if (_providerType === walletType.WALLET_CONNECT) {
			if (active) {
				deactivate();
			}
			const walletconnect = new WalletConnectConnector({
				rpc: {
					1: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
					1337: 'http://localhost:8545',
				},
				chainId: 1,
				bridge: 'https://bridge.walletconnect.org',
				pollingInterval: 12000,
				qrcodeModal: QRCodeModal,
				qrcode: true,
			});
			try {
				await activate(walletconnect, undefined, true);
				set_lastWallet(walletType.WALLET_CONNECT);
			} catch (error) {
				console.error(error);
				set_lastWallet(walletType.NONE);
			}
		}
	}, [activate, active, deactivate, set_lastWallet]);

	useEffect(() => {
		if (active) {
			onActivate();
		}
	}, [active, onActivate]);

	useEffect(() => {
		if (!active && lastWallet !== walletType.NONE) {
			connect(lastWallet);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [active]);

	return (
		<Web3Context.Provider
			value={{
				address,
				ens,
				connect,
				deactivate,
				onDesactivate,
				walletType,
				chainID,
				onSwitchChain,
				active: active && (chainID === 1 || chainID === 1337),
				provider,
				getProvider,
			}}>
			{children}
		</Web3Context.Provider>
	);
};

export const useWeb3 = () => useContext(Web3Context);
export default useWeb3;
