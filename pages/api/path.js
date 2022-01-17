import	{toAddress}				from	'utils';
import	METAPOOL_SWAPS			from	'utils/swaps/ethereum/metapoolSwaps';
import	SWAPS					from	'utils/swaps/ethereum/swaps';

export default async function handler(req, res) {
	let		{from, to} = req.query;
	if (!from || from === '' || !to || to === '') {
		return res.status(200).json({});
	}

	from = toAddress(from);
	to = toAddress(to);

	const	metapoolSwap = METAPOOL_SWAPS.find(e => e[0] === from && e[1] === to);
	if (metapoolSwap) {
		return res.status(200).json({
			isMetapoolSwap: true,
			data: metapoolSwap,
		});
	}
	const	swap = SWAPS.find(e => e[0] === from && e[1] === to);
	if (swap) {
		return res.status(200).json({
			isMetapoolSwap: false,
			data: swap,
		});
	}
	return res.status(200).json({});
}