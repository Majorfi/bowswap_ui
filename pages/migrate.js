/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Sunday July 4th 2021
**	@Filename:				between-vaults.js
******************************************************************************/

import	React		from	'react';
import	YVempire	from	'components/YVempire';

function	FromDefi({yearnVaultData, yVempireData, set_yVempireData}) {
	return <YVempire yearnVaultData={yearnVaultData} yVempireData={yVempireData} set_yVempireData={set_yVempireData} />;
}

export default FromDefi;
