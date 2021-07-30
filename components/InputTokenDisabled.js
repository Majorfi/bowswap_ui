/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday July 29th 2021
**	@Filename:				InputTokenDisabled.js
******************************************************************************/

import	React				from	'react';

function	InputTokenDisabled({value, toCounterValue, slippage, isFetchingExpectedReceiveAmount}) {
	return (
		<div className={'w-full'}>
			<div className={'relative w-full text-left bg-white border border-gray-100 rounded-lg cursor-default focus:outline-none flex flex-col justify-between text-gray-800 h-24 py-2'}>
				<div className={`flex w-full h-17 ${isFetchingExpectedReceiveAmount ? 'hidden' : ''}`}>
					<input
						value={value}
						disabled
						readOnly
						className={'block truncate w-full text-3xl text-gray-500 font-medium h-full'}
						type={'text'}
						min={0} />
				</div>
				<div className={`flex w-full h-7 justify-between px-3 items-center ${isFetchingExpectedReceiveAmount ? 'hidden' : ''}`}>
					<div className={'items-center text-xs font-medium text-gray-500'}>
						<span>{`≃ $${(toCounterValue * Number(value)).toFixed(2)}`}</span>
					</div>
					<div className={'items-center text-xxs font-medium text-gray-500'}>
						<span>{`≥ ${(Number(value) - ((Number(value) * slippage / 100))).toFixed(6)} with slippage`}</span>
					</div>
				</div>
				<div className={`absolute inset-0 flex flex-row w-full justify-center items-center space-x-2 ${isFetchingExpectedReceiveAmount ? '' : 'hidden'}`}>
					<div className={'w-3 h-3 rounded-full bg-gray-400 animate animate-pulse'} />
					<div className={'w-3 h-3 rounded-full bg-gray-400 animate animate-pulse animation-delay-500'} />
					<div className={'w-3 h-3 rounded-full bg-gray-400 animate animate-pulse'} />
				</div>
			</div>
		</div>
	);
}

export default InputTokenDisabled;