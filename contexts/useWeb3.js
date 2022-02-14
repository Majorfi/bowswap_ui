import	React, {useState, useEffect, useContext, createContext, useCallback}	from	'react';
import	{ethers}							from	'ethers';
import	QRCodeModal							from	'@walletconnect/qrcode-modal';
import	{useWeb3React}						from	'@web3-react/core';
import	{InjectedConnector}					from	'@web3-react/injected-connector';
import	{WalletConnectConnector}			from	'@web3-react/walletconnect-connector';
import	useLocalStorage						from	'hook/useLocalStorage';
import	useWindowInFocus					from	'hook/useWindowInFocus';
import	useDebounce							from	'hook/useDebounce';
import	useClientEffect						from	'hook/useClientEffect';
import	{toAddress}							from	'utils';
import	performBatchedUpdates				from	'utils/performBatchedUpdates';

const walletType = {NONE: -1, METAMASK: 0, WALLET_CONNECT: 1};
const Web3Context = createContext();

function getProvider(chain = 'ethereum') {
	if (chain === 'ethereum') {
		return new ethers.providers.AlchemyProvider('homestead', process.env.ALCHEMY_KEY);
	} else if (chain === 'fantom') {
		return new ethers.providers.JsonRpcProvider('https://rpc.ftm.tools');
	} else if (chain === 'major') {
		return new ethers.providers.JsonRpcProvider('http://localhost:8545');
	}
	return (new ethers.providers.AlchemyProvider('homestead', process.env.ALCHEMY_KEY));
}

export const Web3ContextApp = ({children}) => {
	const	web3 = useWeb3React();
	const	{activate, active, library, account, chainId, deactivate} = web3;
	const	[ens, set_ens] = useLocalStorage('ens', '');
	const	[lastWallet, set_lastWallet] = useLocalStorage('lastWallet', walletType.NONE);
	const	[disableAutoChainChange, set_disableAutoChainChange] = useState(false);
	const	[disconnected, set_disconnected] = useState(false);
	const	debouncedChainID = useDebounce(chainId, 500);
	const	windowInFocus = useWindowInFocus();

	const onSwitchChain = useCallback((force) => {
		if (!force && (!active || disableAutoChainChange)) {
			return;
		}
		const	isCompatibleChain = (
			Number(debouncedChainID) === 1 ||
			Number(debouncedChainID) === 250 ||
			Number(debouncedChainID) === 1337 ||
			Number(debouncedChainID) === 31337
		);
		if (isCompatibleChain) {
			return;
		}
		if (!library || !active) {
			console.error('Not initialized');
			return;
		}
		library
			.send('wallet_switchEthereumChain', [{chainId: '0x1'}])
			.catch(() => set_disableAutoChainChange(true));
	}, [active, disableAutoChainChange, chainId, library]);

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
					250: 'https://rpc.ftm.tools',
					1337: 'http://localhost:8545',
					31337: 'http://localhost:8545',
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
	}, [activate, active, set_lastWallet]);

	useClientEffect(() => {
		if (!active && lastWallet !== walletType.NONE) {
			connect(lastWallet);
		}
	}, [active]);

	useClientEffect(() => {
		if (account) {
			getProvider().lookupAddress(toAddress(account)).then(_ens => set_ens(_ens || ''));
		}
	}, [account]);

	return (
		<Web3Context.Provider
			value={{
				address: account,
				connect,
				deactivate,
				walletType,
				chainID: process.env.IS_TEST ? process.env.TESTED_NETWORK : Number(chainId || 0),
				active: active && (Number(chainId) === 1 || Number(chainId) === 250 || Number(chainId) === 1337 || Number(chainId) === 31337),
				provider: library,
				getProvider,
				ens,
				onDesactivate: () => {
					performBatchedUpdates(() => {
						set_lastWallet(walletType.NONE);
						set_disconnected(true);
					});
					setTimeout(() => set_disconnected(false), 100);
				},
				disconnected,
				onSwitchChain,
			}}>
			{children}
		</Web3Context.Provider>
	);
};

export const useWeb3 = () => useContext(Web3Context);
export default useWeb3;
