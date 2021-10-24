import	React		from	'react';
import	Bowswap		from	'components/Bowswap';

function	BetweenVaults({yearnVaultData, prices}) {
	return <Bowswap yearnVaultData={yearnVaultData} prices={prices} />;
}

export default BetweenVaults;
