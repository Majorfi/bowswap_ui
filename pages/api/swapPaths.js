import	{toAddress}				from	'utils';
import	currentPaths			from	'utils/currentPaths';

function findPath({fromVault, toVault}) {
	const	result = currentPaths.find(p => toAddress(p[0]) === toAddress(fromVault) && toAddress(p[1]) === toAddress(toVault));
	if (result) {
		return result[2];
	}
}

export default async function handler(req, res) {
	let		{fromVault, toVault} = req.query;

	const	result = findPath({fromVault, toVault});
	return res.status(200).json(result || {});
}