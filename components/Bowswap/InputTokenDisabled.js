import	React				from	'react';
import	{ethers}			from	'ethers';

function	InputTokenDisabled({
	value, toCounterValue,
	slippage, balanceOf, decimals,
	isFetchingExpectedReceiveAmount
}) {
	const	expectedOutWithSettings = Number(value) !== 0 ? (Number(value) - ((Number(value) * slippage / 100))) : 0;
	const	tokenBalance = Number(ethers.utils.formatUnits(balanceOf, decimals));

	return (
		<div className={'relative w-full text-left bg-white border border-ygray-100 rounded-lg cursor-default focus:outline-none flex flex-col justify-between text-ygray-800 h-24 py-2 px-2 space-y-1'}>
			<div className={'h-4'}>
				<div className={'flex flex-row items-center justify-end w-full'}>
					<label
						className={'font-normal text-ybase text-ygray-500 hidden md:flex flex-row items-center cursor-pointer'}>
						{`Balance: ${tokenBalance !== 0 && tokenBalance < 0.001 ? '< 0.001' : tokenBalance}`}
					</label>
					<label
						className={'font-normal text-ybase text-ygray-500 flex flex-row items-center md:hidden cursor-pointer'}>
						{`Balance: ${tokenBalance !== 0 && tokenBalance < 0.001 ? '< 0.001' : tokenBalance.toFixed(8)}`}
					</label>
				</div>
			</div>
			<div className={`flex w-full h-10 ${isFetchingExpectedReceiveAmount ? 'hidden' : ''}`}>
				<label
					htmlFor={'fromInput'}
					className={`with-placeholder placeholder-${String(value).length} flex justify-end w-full h-10 text-4xl font-medium text-ygray-700 text-opacity-20 proportional-nums cursor-default`}>
					<input
						value={expectedOutWithSettings.toFixed(6)}
						disabled
						readOnly
						style={{backgroundColor: 'transparent', width: Number(value) === 0 ? '1px': 'auto'}}
						className={'block w-full text-4xl font-medium h-full text-right text-ygray-700'}
						type={'text'} />
				</label>
			</div>
			<div className={'h-4'}>
				<div className={`flex w-full justify-between items-center ${isFetchingExpectedReceiveAmount ? 'hidden' : ''}`}>
					<div className={'items-center text-ybase text-ygray-500'}>
						<span>{`≃ $${(toCounterValue * Number(expectedOutWithSettings)).toFixed(2)}`}</span>
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