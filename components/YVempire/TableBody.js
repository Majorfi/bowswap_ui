<<<<<<< HEAD
/******************************************************************************
**	@Author:				Bowswap
**	@Date:					Thursday August 19th 2021
**	@Filename:				TableBody.js
******************************************************************************/

=======
>>>>>>> 1029127fdace860cc962d3544ed0aa3a9de9628f
import	React		from	'react';
import	TableRow	from	'components/YVempire/TableRow';
import {ethers} from 'ethers';

function	TableBody({elements, balancesOf, yearnVaultData, selectedTokens, onSelectToken, set_nonce}) {
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
				{elements.sort((a, b) => Number(ethers.utils.formatUnits(balancesOf[b.uToken?.address] || 0, b.decimals)) - Number(ethers.utils.formatUnits(balancesOf[a.uToken?.address] || 0, a.decimals))).map((pair) => (
					<TableRow
						key={`${pair.underlyingAddress}-${pair.uToken.address}-${pair.yvToken.address}`}
						pair={pair}
						yearnVaultData={yearnVaultData.find(yv => yv.address === pair.yvToken.address)}
						balanceOf={balancesOf[pair.uToken.address]}
						selectedTokens={selectedTokens}
						onSelectToken={onSelectToken}
						set_nonce={set_nonce} />
				))}
			</tbody> 
		</table>
	);
}
export default TableBody;
