import	React	from	'react';

function	TableHead({from, to}) {
	return (
		<div className={`sticky top-0 z-20 ${to !== '' ? 'withAfterGradient' : ''}`}>
			<table className={'w-full table-fixed whitespace-normal'}>
				<colgroup>
					<col style={{width: 500}} />
				</colgroup>
				<thead className={`${to !== '' ? 'bg-white' : ''} z-20`}>
					<tr>
						<th className={'pb-0'}>
							<div className={'flex w-full justify-start items-center pb-2'}>
								<div className={'flex w-1/3 bg-white'}>
									<label className={'font-medium text-ybase text-ygray-900 pl-12'}>{from}</label>
								</div>
								<div className={'flex w-2/3 justify-end pr-6 z-50'}>
									<label className={'text-ybase font-medium text-ygray-900 w-28 text-left'}>{to}</label>
								</div>
							</div>
						</th>
					</tr>
				</thead>
			</table>
		</div>
	);
}

export default TableHead;