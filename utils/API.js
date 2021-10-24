<<<<<<< HEAD
/******************************************************************************
**	@Author:				Bowswap
**	@Date:					Saturday January 2nd 2021
**	@Filename:				API.js
******************************************************************************/

=======
>>>>>>> 1029127fdace860cc962d3544ed0aa3a9de9628f
import	axios			from	'axios';

export const	performGet = (url) => {
	return (
		axios.get(url)
			.then(function (response) {
				return response.data;
			})
			.catch(function (error) {
				console.warn(error);
				return null;
			})
	);
};

export async function	fetchCryptoPrice(from, to) {
	const	result = await performGet(
		`https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`
	);

	if (result) {
		return result;
	}
	return null;
}

export async function	fetchYearnVaults() {
	const	result = await performGet('https://api.yearn.finance/v1/chains/1/vaults/all');

	if (result) {
		return result;
	}
	return null;
}