import	React, {useState}			from	'react';
import	Image						from	'next/image';
import	{ethers}					from	'ethers';
import	Arrow						from	'components/Icons/Arrow';
import	{formatAmount}				from	'utils';

function	TableRow({pair, balanceOf, yearnVaultData, selectedTokens, set_nonce, onSelectToken}) {
	const	[isChecked, set_isChecked] = useState(false);
	const	disabled = balanceOf?.isZero() || !balanceOf;
	if (pair?.uToken?.isHidden) {
		return null;
	}

	const	yearnAPY = Number((yearnVaultData?.apy?.net_apy || 0) * 100);
	const	uAPY = Number(pair.uToken.apy);

	return (
		<tr className={'bg-white z-10 relative'}>
			<td>
				<div
					className={`w-full ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
					onClick={() => {
						if (disabled) {
							return;
						}
						set_isChecked(!isChecked);
						set_nonce(n => n + 1);
						onSelectToken(pair.uToken.address);
					}}>
					<div className={`flex flex-row w-full items-center hover:bg-light-hover rounded-lg pl-2 pr-6 py-2 ${disabled ? 'filter grayscale cursor-not-allowed' : 'cursor-pointer'}`}>
						<div className={'flex flex-row w-1/3 items-center'}>
							<input
								type={'checkbox'}
								className={`focus:ring-yblue text-yblue border-yblue border-2 rounded ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
								disabled={disabled}
								style={{width: 22, height: 22}}
								checked={selectedTokens[pair.uToken.address]}
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
								<div className={'text-ybase text-ygray-400 overflow-ellipsis mt-1'}>{`${uAPY.toFixed(2)}%`}</div>
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
									<div key={pair.yvToken.apy} className={'text-ybase font-medium text-yblue overflow-ellipsis mt-1'}>{`${yearnAPY.toFixed(2)}%`}</div>
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