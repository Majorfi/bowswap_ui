/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Thursday July 29th 2021
**	@Filename:				InputTokenDisabled.js
******************************************************************************/

import	React, {useEffect, useState, useRef}	from	'react';
import	{ethers}								from	'ethers';

function	InputTokenDisabled({value, toCounterValue, slippage, isFetchingExpectedReceiveAmount, balanceOf, decimals}) {
	const	inputRef = useRef();
	const	[formatedValue, set_formatedValue] = useState(value);

	useEffect(() => {
		let		_formatedValue = value;
		const	[dec, frac] = _formatedValue.split('.');
		if (frac) _formatedValue = `${dec}.${frac.slice(0, 10)}`;

		if (inputRef?.current) {
			let inputWitdh = (_formatedValue.length * 20) + 3;
			if (_formatedValue.length === 0) {
				inputRef.current.style.width = `${1}px`;
			} else {
				inputRef.current.style.width = `${inputWitdh + 1}px`;
			}
			set_formatedValue(_formatedValue);
		}
	}, [value]);

	return (
		<div className={'relative w-full text-left bg-white border border-ygray-100 rounded-lg cursor-default focus:outline-none flex flex-col justify-between text-ygray-800 h-24 py-2 px-2 space-y-1'}>
			<div className={'h-4'}>
				<div className={'flex flex-row items-center justify-end w-full'}>
					<label
						className={'font-normal text-ybase text-ygray-500 hidden md:flex flex-row items-center cursor-pointer'}>
						{`Balance: ${Number(ethers.utils.formatUnits(balanceOf, decimals))}`}
					</label>
					<label
						className={'font-normal text-ybase text-ygray-500 flex flex-row items-center md:hidden cursor-pointer'}>
						{`Balance: ${Number(ethers.utils.formatUnits(balanceOf, decimals)).toFixed(8)}`}
					</label>
				</div>
			</div>
			<div className={`flex w-full h-10 ${isFetchingExpectedReceiveAmount ? 'hidden' : ''}`}>
				<label
					htmlFor={'fromInput'}
					className={`with-placeholder placeholder-${value.length} flex justify-end w-full h-10 text-4xl font-medium text-ygray-700 text-opacity-20 proportional-nums cursor-text`}>
					<input
						ref={inputRef}
						value={formatedValue}
						disabled
						readOnly
						style={{backgroundColor: 'transparent'}}
						className={'block w-full text-4xl font-medium h-full text-right text-ygray-700'}
						type={'text'}
						min={0} />
				</label>
			</div>
			<div className={'h-4'}>
				<div className={`flex w-full justify-between items-center ${isFetchingExpectedReceiveAmount ? 'hidden' : ''}`}>
					<div className={'items-center text-ybase font-medium text-ygray-500'}>
						<span>{`≃ $${(toCounterValue * Number(value)).toFixed(2)}`}</span>
					</div>
					<div className={'items-center text-xxs font-medium text-ygray-500'}>
						<span>{`≥ ${(Number(value) - ((Number(value) * slippage / 100))).toFixed(6)} with slippage`}</span>
					</div>
				</div>
			</div>
			<div className={`absolute inset-0 flex flex-row w-full justify-center items-center space-x-2 ${isFetchingExpectedReceiveAmount ? '' : 'hidden'}`}>
				<div className={'w-3 h-3 rounded-full bg-ygray-400 animate animate-pulse'} />
				<div className={'w-3 h-3 rounded-full bg-ygray-400 animate animate-pulse animation-delay-500'} />
				<div className={'w-3 h-3 rounded-full bg-ygray-400 animate animate-pulse'} />
			</div>
		</div>
	);
}

export default InputTokenDisabled;