/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday July 29th 2021
**	@Filename:				InputToken.js
******************************************************************************/

import	React				from	'react';
import	{ethers}			from	'ethers';
import	PopoverSlippage		from	'components/PopoverSlippage';

function	InputToken({value, set_value, slippage, set_slippage, balanceOf, decimals, fromCounterValue}) {
	return (
		<div className={'w-full'}>
			<div className={'relative w-full text-left bg-gray-100 rounded-lg cursor-default focus:outline-none flex flex-col justify-between text-gray-800 h-24 py-2'}>
				<div className={'flex w-full h-17'}>
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
						}}
						placeholder={''}
						style={{background: 'transparent'}}
						className={'block truncate w-full text-3xl font-medium h-full'}
						type={'text'}
						min={0} />
				</div>
				<div className={'flex w-full h-7 justify-between px-3 items-center relative'}>
					<div className={'items-center text-xs font-medium text-gray-500'}>
						<span>{`≃ $${(fromCounterValue * Number(value)).toFixed(2)}`}</span>
					</div>
					<div className={'flex flex-row items-center'}>
						<button
							onClick={() => set_value(ethers.utils.formatUnits(balanceOf, decimals))}
							className={'items-center text-xxs variant-petit-caps py-0.5 text-white bg-sky-400 hover:bg-sky-500 focus:outline-none px-2 rounded-lg transition-colors h-5'}>
							<span>{'MAX'}</span>
						</button>
						<PopoverSlippage slippage={slippage} set_slippage={set_slippage}/>
					</div>
				</div>

			</div>
		</div>
	);
}

export default InputToken;