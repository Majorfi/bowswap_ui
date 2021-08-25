/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday August 19th 2021
**	@Filename:				TableBody.js
******************************************************************************/

import	React, {useState}			from	'react';
import	Image						from	'next/image';
import	{ethers}					from	'ethers';
import	Arrow						from	'components/Icons/Arrow';
import	{formatAmount}				from	'utils';

function	TableRow({pair, balanceOf, yearnVaultData, set_nonce, set_selectedTokens}) {
	const	[isChecked, set_isChecked] = useState(false);

	return (
		<tr className={'bg-white z-10 relative'}>
			<td>
				<div
					className={'w-full cursor-pointer'}
					onClick={() => {
						set_isChecked(!isChecked);
						set_nonce(n => n + 1);
						set_selectedTokens((s) => {
							s[pair.uToken.address] = !s[pair.uToken.address];
							return (s);
						});
					}}>
					<div className={`flex flex-row w-full items-center hover:bg-light-hover cursor-pointer rounded-lg pl-2 pr-6 py-2 ${balanceOf?.isZero() || !balanceOf ? 'filter grayscale' : ''}`}>
						<div className={'flex flex-row w-1/3 items-center'}>
							<input
								type={'checkbox'}
								className={'focus:ring-yblue text-yblue border-yblue border-2 rounded'}
								style={{width: 22, height: 22}}
								checked={isChecked}
								onChange={() => null} />

							<div className={'ml-4 w-9 h-9 rounded-full flex justify-center items-center relative'} style={{minWidth: 36}}>
								<Image
									src={pair.uToken.image}
									objectFit={'contain'}
									loading={'eager'}
									width={36}
									height={36} />
							</div>
							<div className={'pl-4 text-left overflow-ellipsis'}>
								<div className={'text-ybase font-medium whitespace-nowrap'}>{pair.uToken.name}</div>
								<div className={'text-ybase text-ygray-400 overflow-ellipsis mt-1'}>{`${Number(pair.uToken.apy).toFixed(2)}%`}</div>
							</div>
						</div>

						<div className={'w-2/3 flex items-center justify-end'}>
							<div className={'flex flex-row items-center mr-8'}>
								<p className={'text-ygray-400 text-ybase font-medium whitespace-nowrap mr-2'}>{`${formatAmount(ethers.utils.formatUnits(balanceOf || 0, pair.service === 0 ? 8 : pair.decimals), 4)}`}</p>
								<Arrow className={'w-8 h-8 text-ygray-400'} />
							</div>
							<div className={'flex flex-row justify-start items-center w-28'}>
								<div className={'w-9 h-9 rounded-full flex justify-center items-center relative'} style={{minWidth: 36}}>
									<Image
										src={pair.yvToken.image}
										objectFit={'contain'}
										loading={'eager'}
										width={36}
										height={36} />
								</div>
								<div className={'pl-4 text-left overflow-ellipsis'}>
									<div className={'text-ybase font-medium whitespace-nowrap'}>{pair.yvToken.name}</div>
									<div key={pair.yvToken.apy} className={'text-ybase font-medium text-yblue overflow-ellipsis mt-1'}>{`${Number((yearnVaultData?.apy?.net_apy || 0) * 100).toFixed(2)}%`}</div>
								</div>
							</div>
						</div>
					</div>

				</div>
			</td>
		</tr>
	);

}

export default TableRow;