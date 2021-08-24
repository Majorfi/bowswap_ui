/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday July 4th 2021
**	@Filename:				index.js
******************************************************************************/

import	React		from	'react';
import	Bowswap		from	'components/Bowswap';

function	Index({yearnVaultData, prices}) {
	return <Bowswap yearnVaultData={yearnVaultData} prices={prices} />;
}

export default Index;
