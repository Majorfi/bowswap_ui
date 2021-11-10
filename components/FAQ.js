import	React, {useState}				from	'react';

function	FAQElement({label, children}) {
	const	[isExpanded, set_isExpanded] = useState(false);
	const	[isExpandedAnimation, set_isExpandedAnimation] = useState(false);

	function	onExpand() {
		if (isExpanded) {
			set_isExpandedAnimation(false);
			setTimeout(() => set_isExpanded(false), 300);
		} else {
			set_isExpanded(true);
			setTimeout(() => set_isExpandedAnimation(true), 1);
		}
	}

	return (
		<div  className={'bg-white rounded-lg w-full cursor-pointer'}>
			<div onClick={onExpand} className={'font-bold text-ygray-900 flex flex-row items-center justify-between p-6'}>
				{label}
				<svg
					width={'24'}
					height={'24'}
					className={`transform transition-transform ${isExpandedAnimation ? '' : '-rotate-90'}`}
					viewBox={'0 0 24 24'}
					fill={'none'}
					xmlns={'http://www.w3.org/2000/svg'}>
					<path fillRule={'evenodd'} clipRule={'evenodd'} d={'M17.7439 9.18558C18.0556 9.45834 18.0872 9.93216 17.8144 10.2439L12.5644 16.2439C12.422 16.4066 12.2163 16.5 12 16.5C11.7837 16.5 11.578 16.4066 11.4356 16.2439L6.18558 10.2439C5.91282 9.93216 5.9444 9.45834 6.25613 9.18558C6.56786 8.91282 7.04168 8.9444 7.31444 9.25613L12 14.6111L16.6856 9.25613C16.9583 8.9444 17.4321 8.91282 17.7439 9.18558Z'} fill={'#000000'}/>
				</svg>
			</div>
			<div className={`w-full transition-max-height duration-300 overflow-hidden ${isExpandedAnimation ? 'max-h-96' : 'max-h-0'}`}>
				{isExpanded ? children : <div />}
			</div>
		</div>
	);
}

function	FAQ() {


	return (
		<div className={'space-y-4 mt-6 w-full'}>
			<h3 className={'mb-6 font-bold text-center'}>{'FAQ'}</h3>
			<FAQElement label={'What is Bowswap?'}>
				<div className={'px-6 pb-6 font-normal text-ygray-700 text-sm leading-4'}>
					{'Bowswap is a platform that allows you to move your funds from one place to another using the most optimal route, to pursue better yield. You can either move them inside Yearn, or migrate them from other protocols.'}
				</div>
			</FAQElement>
			<FAQElement label={'What are the benefits of using Bowswap?'}>
				<div className={'px-6 pb-2 font-normal text-ygray-700 text-sm leading-4'}>
					{'Using Bowswap you save time and, more importantly, money. It\'s time-saving and simple. Just one click and you migrate.'}
				</div>
				<div className={'px-6 pb-6 font-normal text-ygray-700 text-sm leading-4'}>
					{'You save money in gas because Bowswap uses the most optimal route to migrate and sends all the transactions bundled.'}
				</div>
			</FAQElement>
			<FAQElement label={'How does the swap work?'}>
				<div className={'px-6 pb-2 font-normal text-ygray-700 text-sm leading-4'}>
					{'Bowswap smart contracts withdraw from the protocol, or yVault, and find the most optimal route to go from one place to the other.'}
				</div>
				<div className={'px-6 pb-2 font-normal text-ygray-700 text-sm leading-4'}>
					{'If you migrate from stable to stable, there are no swaps, just the automation of withdrawals and deposits into different protocols.'}
				</div>
				<div className={'px-6 pb-6 font-normal text-ygray-700 text-sm leading-4'}>
					{'If you move from one type of asset to another one, there will be a swap using the best available route.'}
				</div>
			</FAQElement>
			<FAQElement label={'I can\'t find the vault I want to migrate from/to, why?'}>
				<div className={'px-6 pb-6 font-normal text-ygray-700 text-sm leading-4'}>
					{'We want to make sure we can provide the best routes. Bowswap doesn\'t support every single vault yet. We are working hard to support more and more vaults every day.'}
				</div>
			</FAQElement>
			<FAQElement label={'Are there any fees to use it?'}>
				<div className={'px-6 pb-6 font-normal text-ygray-700 text-sm leading-4'}>
					{'Bowswap charges no fees for using it. But you can donate a tiny portion of your transaction to help maintain the team.'}
				</div>
			</FAQElement>
			<FAQElement label={'What is slippage?'}>
				<div className={'px-6 pb-2 font-normal text-ygray-700 text-sm leading-4'}>
					{'In trade, there is almost always a spread between the price that a buyer will pay and the price that a seller will sell an asset. When an order is made, this difference in price between buyer and seller expectations results in price slippage. This slippage in price is usually 1-3% but can be even more for coins with limited liquidity. This slippage can lead to a final sale price of the asset that is either more or less than the requested transaction amount.'}
				</div>
				<div className={'px-6 pb-6 font-normal text-ygray-700 text-sm leading-4'}>
					{'If you are moving between the same type of asset, there will be no swap, so no slippage will apply.'}
				</div>
			</FAQElement>
		</div>
	);
}

export default FAQ;
