/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday July 29th 2021
**	@Filename:				InputToken.js
******************************************************************************/

import	React, {useState, useEffect}	from	'react';
import	{ethers}						from	'ethers';

function	InputToken({value, set_value, balanceOf, decimals}) {
	const [txStatus, set_txStatus] = useState({none: true, pending: false, success: false, error: false});

	useEffect(() => {
		if (txStatus.error) {
			set_txStatus({none: true, pending: false, success: false, error: false});
		}
	}, [value, txStatus.error]);

	return (
		<div className={'w-full'}>
			<div className={'relative w-full text-left bg-white rounded-lg border cursor-default focus:outline-none flex flex-row justify-between border-gray-200 text-gray-800 h-15'}>
				<input
					value={value}
					onChange={(e) => {
						if (e.target.value.length > 0 && e.target.value[0] === '-') {
							set_value('0');
						} else if (Number(e.target.value) > Number(ethers.utils.formatUnits(balanceOf, decimals))) {
							set_value(ethers.utils.formatUnits(balanceOf, decimals) || '0');
						} else if (e.target.value.length >= 2 && e.target.value[0] === '0' && e.target.value[1] !== '.') {
							set_value(e.target.value.slice(1) || '0');
						} else {
							set_value(e.target.value || '0');
						}
						set_txStatus({none: true, pending: false, success: false, error: false});
					}}
					placeholder={''}
					style={{background: 'transparent'}}
					className={'block truncate py-4 w-full text-lg'}
					type={'text'}
					min={0} />

				<div className={'flex border-l border-gray-200'}>
					<button
						onClick={() => set_value(ethers.utils.formatUnits(balanceOf, decimals))}
						className={'items-center space-x-2 px-4 py-2 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-600 focus:outline-none'}>
						<span>{'max'}</span>
					</button>
				</div>

			</div>
		</div>
	);
}

export default InputToken;