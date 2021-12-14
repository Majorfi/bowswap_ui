import	React		from	'react';
import	axios		from	'axios';
import	Bowswap		from	'components/Bowswap';

const	fetcher = url => axios.get(url).then(res => res.data);

function	BetweenVaults({prices, yVaults}) {
	return <Bowswap prices={prices} yVaults={yVaults} />;
}


export async function getServerSideProps() {
	let	result = await fetcher('https://api.yearn.finance/v1/chains/1/vaults/all');
	result = result.filter(e => !e.migration || !e.migration?.available);
	result = result.filter(e => e.type !== 'v1');
	result = result.filter(e => ((e.symbol).toLowerCase()).includes('curve') || ((e.symbol).toLowerCase()).includes('crv'));

	return {props: {yVaults: result}};
}

export default BetweenVaults;
