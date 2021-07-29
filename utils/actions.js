/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Wednesday July 14th 2021
**	@Filename:				actions.js
******************************************************************************/

import	{ethers}						from	'ethers';
import	toast							from	'react-hot-toast';

export async function	approveToken({provider, contractAddress, amount, from}, callback) {
	const	signer = provider.getSigner();
	const	erc20 = new ethers.Contract(
		contractAddress,
		['function approve(address spender, uint256 amount) public returns (bool)'],
		signer
	);

	/**********************************************************************
	**	In order to avoid dumb error, let's first check if the TX would
	**	be successful with a static call
	**********************************************************************/
	try {
		await erc20.callStatic.approve(from, amount);
	} catch (error) {
		toast.error(error?.data?.message || error?.message);
		callback({error: true, data: undefined});
		return;
	}

	/**********************************************************************
	**	If the call is successful, try to perform the actual TX
	**********************************************************************/
	try {
		const	transaction = await erc20.approve(from, amount);
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 1) {
			toast.success('Transaction approve executed');
			callback({error: false, data: amount});
		} else {
			toast.error('Transaction mined but not successful');
			callback({error: true, data: undefined});
		}
	} catch (error) {
		toast.error(error?.data?.message || error?.message);
		callback({error: true, data: undefined});
	}
}

export async function	swapTokens({provider, contractAddress, from, to, amount, minAmountOut}, callback) {
	const	signer = provider.getSigner();
	const	contract = new ethers.Contract(
		contractAddress,
		['function swap(address from, address to, uint256 amount, uint256 min_amount_out)'],
		signer
	);

	/**********************************************************************
	**	If the call is successful, try to perform the actual TX
	**********************************************************************/
	try {
		const	transaction = await contract.swap(from, to, amount, minAmountOut);
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 1) {
			toast.success('Transaction swap executed');
			callback({error: false, data: amount});
		} else {
			toast.error('Transaction mined but not successful');
			callback({error: true, data: undefined});
		}
	} catch (error) {
		toast.error(error?.data?.message || error?.message);
		callback({error: true, data: undefined});
	}
}
