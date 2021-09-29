/******************************************************************************
**	@Author:				Bowswap
**	@Date:					Thursday July 29th 2021
**	@Filename:				InputToken.js
******************************************************************************/

import	React, {useEffect, useRef}		from	'react';
import	{ethers}						from	'ethers';
import	PopoverSlippage					from	'components/Bowswap/PopoverSlippage';

function	InputToken({value, set_value, slippage, set_slippage, balanceOf, decimals, fromCounterValue, disabled}) {
	const	inputRef = useRef();

	useEffect(() => {
		if (inputRef?.current) {
			let inputWitdh = (value.length * 20) + 3;
			if (String(value).includes('.')) {
				inputWitdh -= 10;
			}
			if (value.length === 0) {
				inputRef.current.style.width = `${1}px`;
			} else {
				inputRef.current.style.width = `${inputWitdh + 1}px`;
			}
		}
	}, [value]);

	return (
		<div className={'w-full text-left bg-ygray-100 rounded-lg cursor-default focus:outline-none flex flex-col justify-between text-ygray-800 h-24 py-2 px-2 space-y-1'}>
			<div className={'h-4'}>
				<div className={'flex flex-row items-center justify-end w-full'}>
					<label
						onClick={() => disabled ? null : set_value(ethers.utils.formatUnits(balanceOf, decimals))}
						className={`font-normal text-ybase text-ygray-500 hidden md:flex flex-row items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
						{`Balance: ${Number(ethers.utils.formatUnits(balanceOf, decimals))}`}
					</label>
					<label
						onClick={() => disabled ? null : set_value(ethers.utils.formatUnits(balanceOf, decimals))}
						className={`font-normal text-ybase text-ygray-500 flex flex-row items-center md:hidden ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
						{`Balance: ${Number(ethers.utils.formatUnits(balanceOf, decimals)).toFixed(8)}`}
					</label>
				</div>
			</div>
			<label
				htmlFor={'fromInput'}
				className={`with-placeholder placeholder-${value.length} flex justify-end w-full h-10 text-4xl font-medium text-ygray-900 text-opacity-20 proportional-nums cursor-text ${disabled ? 'cursor-not-allowed' : 'cursor-text'}`}>
				<input
					ref={inputRef}
					id={'fromInput'}
					name={'fromInput'}
					autoComplete={'off'}
					disabled={disabled}
					readOnly={disabled}
					value={value}
					onChange={(e) => {
						if (disabled) {
							return;
						}
						let		_value = e.target.value.replaceAll('..', '.').replaceAll(/[^0-9.]/g, '');
						const	[dec, frac] = _value.split('.');
						if (frac) _value = `${dec}.${frac.slice(0, 10)}`;

						if (_value === '.') {
							set_value('0.');
						} else if (_value.length > 0 && _value[0] === '-') {
							set_value('');
						} else if (_value.length >= 2 && _value[0] === '0' && _value[1] !== '.') {
							set_value(_value.slice(1) || '');
						} else {
							set_value(_value || '');
						}
					}}
					style={{backgroundColor: 'transparent'}}
					className={`block w-full text-4xl font-medium h-full text-right ${disabled ? 'cursor-not-allowed' : 'cursor-text'} ${Number(value) > Number(ethers.utils.formatUnits(balanceOf, decimals)) ? 'text-error' : 'text-ygray-900'}`}
					type={'text'}
					min={0} />
			</label>
			<div className={'h-4'}>
				<div className={'flex w-full justify-between items-center relative'}>
					<div className={'items-center text-ybase text-ygray-500'}>
						<span>{`≃ $${(fromCounterValue * Number(value)).toFixed(2)}`}</span>
					</div>
					<div className={'flex flex-row items-center'}>
						<button
							onClick={() => disabled ? null : set_value(ethers.utils.formatUnits(balanceOf, decimals))}
							className={`items-center text-xxs font-medium py-0.5 text-white bg-yblue hover:bg-yblue-hover focus:outline-none px-3 rounded-lg transition-colors h-5 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
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