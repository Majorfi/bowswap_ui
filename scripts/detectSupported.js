/******************************************************************************
**	This script is used to check if a token has the function
**	remove_liquidity_one_coin
**	If the functions is not avaible, the smartcontract will not be able to
**	withdraw funds
******************************************************************************/

const	{ethers} = require('ethers');
const	axios = require('axios');
const	LISTING = require('./LISTING.json');

const	performGet = (url) => {
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
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
 
async function	checkTokens() {
	const	finalDoc = LISTING;
	const	API_KEY = '';
	await asyncForEach((Object.values(LISTING)), async (token) => {
		const	{result} = await performGet(`https://api.etherscan.io/api?module=contract&action=getabi&address=${token.address}&apikey=${API_KEY}`);
		const	iface = new ethers.utils.Interface(result)?.format(ethers.utils.FormatTypes.minimal);
		const	hasRemoveLiquidityOneCoin = iface.some((method) => {
			return method.startsWith('function remove_liquidity_one_coin(');
		});
		if (!hasRemoveLiquidityOneCoin) {
			finalDoc[token.address].canWithdraw = false;
		}
		await sleep(500);
	});
	console.log(finalDoc);
}


checkTokens();