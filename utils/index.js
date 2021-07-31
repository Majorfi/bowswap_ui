/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday March 18th 2021
**	@Filename:				index.js
******************************************************************************/

import	{ethers}						from	'ethers';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export const toAddress = (address) => {
	if (!address) {
		return ADDRESS_ZERO;
	}
	if (address === 'GENESIS') {
		return ADDRESS_ZERO;
	}
	try {
		return ethers.utils.getAddress(address);	
	} catch (error) {
		return ADDRESS_ZERO;
	}
};

export const bigNumber = ethers.BigNumber;

export function truncateAddress(address) {
	if (address !== undefined) {
		return `${address.slice(0, 4)}...${address.slice(-4)}`;
	}
	return '0x000...0000';
}

export async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}