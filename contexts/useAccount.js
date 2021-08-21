/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday June 13th 2021
**	@Filename:				useAccount.js
******************************************************************************/

import	React, {useContext, useState, useEffect, createContext}	from	'react';
import	{ethers}							from	'ethers';
import	useWeb3								from	'contexts/useWeb3';
import	BOWSWAP_CRV_BTC_VAULTS				from	'utils/BOWSWAP_CRV_BTC_VAULTS';
import	BOWSWAP_CRV_USD_VAULTS				from	'utils/BOWSWAP_CRV_USD_VAULTS';

const AccountContext = createContext();

export const AccountContextApp = ({children}) => {
	const	{address, provider} = useWeb3();
	const	[nonce, set_nonce] = useState(0);
	const	[contractInstances, set_contractInstances] = useState({});
	const	[balancesOf, set_balancesOf] = useState({});

	useEffect(() => {
		if (provider && address) {
			const	_contractInstances = {};
			([...BOWSWAP_CRV_USD_VAULTS, ...BOWSWAP_CRV_BTC_VAULTS]).forEach((contract) => {
				_contractInstances[contract.address] = new ethers.Contract(
					contract.address,
					['function balanceOf(address) public view returns (uint256)'],
					provider
				);
			});
			set_contractInstances(_contractInstances);
			set_nonce(n => n + 1);
		}
	}, [provider, address]);

	useEffect(() => {
		if (nonce > 0) {
			Object.entries(contractInstances).forEach(([key, instance]) => {
				instance.balanceOf(address).then((_balanceOf) => {
					set_balancesOf((b) => {
						b[key] = _balanceOf;
						return b;
					});
				});
			}, []);
		}
	}, [nonce]);

	async function	updateBalanceOf() {
		set_nonce(n => n + 1);
	}

	return (
		<AccountContext.Provider value={{balancesOf, updateBalanceOf}}>
			{children}
		</AccountContext.Provider>
	);
};

export const useAccount = () => useContext(AccountContext);
export default useAccount;
