/******************************************************************************
**	@Author:				Bowswap
**	@Date:					Sunday July 4th 2021
**	@Filename:				between-vaults.js
******************************************************************************/

import	React		from	'react';
import	Bowswap		from	'components/Bowswap';

function	BetweenVaults({yearnVaultData, prices}) {
	return <Bowswap yearnVaultData={yearnVaultData} prices={prices} />;
}

export default BetweenVaults;
