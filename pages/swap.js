import	React			from	'react';
import	axios			from	'axios';
import	Bowswap			from	'components/Bowswap';
import	METAPOOL_SWAPS	from	'utils/swaps/ethereum/metapoolSwaps';
import	SWAPS			from	'utils/swaps/ethereum/swaps';

const	fetcher = url => axios.get(url).then(res => res.data);

function	BetweenVaults({prices, yVaults}) {
	return <Bowswap prices={prices} yVaults={yVaults} />;
}


export async function getServerSideProps() {
	let	result = await fetcher('https://api.yearn.finance/v1/chains/1/vaults/all');
	result = result.filter(e => !e.migration || !e.migration?.available);
	result = result.filter(e => e.type !== 'v1');
	// result = result.filter(e => ((e.symbol).toLowerCase()).includes('curve') || ((e.symbol).toLowerCase()).includes('crv'));

	const allFrom = [...new Set([...METAPOOL_SWAPS.map(e => e[0]), ...SWAPS.map(e => e[0])])];
	const allTo = [...new Set([...METAPOOL_SWAPS.map(e => e[1]), ...SWAPS.map(e => e[1])])];
	const yVaults = [...result].filter(e => allFrom.includes(e.address) || allTo.includes(e.address));
	// const to = [...result].filter(e => allTo.includes(e.address));

	return {props: {yVaults}};
}

export default BetweenVaults;
