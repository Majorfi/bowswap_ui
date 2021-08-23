/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday June 13th 2021
**	@Filename:				useAccount.js
******************************************************************************/

import	React, {useContext, useState, useEffect, createContext}	from	'react';
import	{ethers}							from	'ethers';
import	useWeb3								from	'contexts/useWeb3';
import	AAVE_V1								from	'utils/AaveV1';
import	AAVE_V2								from	'utils/AaveV2';
import	COMPOUND							from	'utils/Compound';
import	BOWSWAP_CRV_BTC_VAULTS				from	'utils/BOWSWAP_CRV_BTC_VAULTS';
import	BOWSWAP_CRV_USD_VAULTS				from	'utils/BOWSWAP_CRV_USD_VAULTS';

const AccountContext = createContext();

export const AccountContextApp = ({children}) => {
	const	{active, address, provider} = useWeb3();
	const	[nonce, set_nonce] = useState(0);
	const	[contractInstances, set_contractInstances] = useState({});
	const	[yVempireContractInstances, set_yVempireContractInstances] = useState({});
	const	[balancesOf, set_balancesOf] = useState({});
	const	[allowances, set_allowances] = useState({});

	useEffect(() => {
		if (provider && address) {
			const	_contractInstances = {};
			const	_yVempireContractInstances = {};
			([...BOWSWAP_CRV_USD_VAULTS, ...BOWSWAP_CRV_BTC_VAULTS]).forEach((contract) => {
				_contractInstances[contract.address] = new ethers.Contract(
					contract.address, ['function balanceOf(address) public view returns (uint256)'], provider
				);
			});
			([...COMPOUND, ...AAVE_V1, ...AAVE_V2]).forEach((contract) => {
				_yVempireContractInstances[contract.uToken.address] = new ethers.Contract(
					contract.uToken.address,
					[
						'function balanceOf(address) public view returns (uint256)',
						'function allowance(address, address) public view returns (uint256)'
					],
					provider
				);
			});
			set_contractInstances(_contractInstances);
			set_yVempireContractInstances(_yVempireContractInstances);
			set_nonce(n => n + 1);
		}
	}, [provider, address]);

	useEffect(() => {
		if (nonce > 0) {
			Object.entries(yVempireContractInstances).forEach(([key, instance]) => {
				Promise.all([
					instance.balanceOf(address),
					instance.allowance(address, process.env.VYEMPIRE_SWAPPER)	
				]).then(([_balanceOf, _allowance]) => {
					set_balancesOf((b) => {b[key] = _balanceOf; return b;});
					set_allowances((b) => {b[key] = _allowance; return b;});
				});
			}, []);

			Object.entries(contractInstances).forEach(([key, instance]) => {
				instance.balanceOf(address).then(_balanceOf => set_balancesOf((b) => {b[key] = _balanceOf; return b;}));
			}, []);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nonce]);

	useEffect(() => {
		if (!active) {
			set_contractInstances({});
			set_yVempireContractInstances({});
			set_balancesOf({});
			set_allowances({});
			set_nonce(0);
		}
	}, [active]);

	async function	updateBalanceOf() {
		set_nonce(n => n + 1);
	}

	return (
		<AccountContext.Provider value={{balancesOf, updateBalanceOf, allowances, set_balancesOf, set_allowances}}>
			{children}
		</AccountContext.Provider>
	);
};

export const useAccount = () => useContext(AccountContext);
export default useAccount;
