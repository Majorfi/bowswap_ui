/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday August 19th 2021
**	@Filename:				TableBody.js
******************************************************************************/

import	React		from	'react';
import	TableRow	from	'components/YVempire/TableRow';

function	TableBody({elements, balancesOf, set_selectedTokens, set_nonce}) {
	return (
		<table className={'w-full table-fixed whitespace-normal mt-3'}>
			<colgroup>
				<col style={{width: 500}} />
			</colgroup>
			<thead>
				<tr>
					<td className={'text-left p-0 m-0 h-0'} />
				</tr>
			</thead>
			<tbody>
				{elements.map((pair) => (
					<TableRow
						key={`${pair.underlyingAddress}-${pair.uToken.address}-${pair.yvToken.address}`}
						pair={pair}
						balanceOf={balancesOf[pair.uToken.address]}
						set_selectedTokens={set_selectedTokens}
						set_nonce={set_nonce} />
				))}
			</tbody> 
		</table>
	);
}
export default TableBody;