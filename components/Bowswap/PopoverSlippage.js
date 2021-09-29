/******************************************************************************
**	@Author:				Bowswap
**	@Date:					Thursday July 29th 2021
**	@Filename:				PopoverSlippage.js
******************************************************************************/

import	React, {Fragment, useRef, useEffect, useState}	from	'react';
import	{Popover, Transition}					from	'@headlessui/react';

function PopoverSlippage({slippage, set_slippage}) {
	const	[open, set_open] = useState(false);
	const	buttonRef = useRef(null);

	const handleClickOutside = (event) => {
		if (buttonRef.current && !buttonRef.current.contains(event.target)) {
			set_open(false);
			event.stopPropagation();
		}
	};
	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});
	return (
		<Popover>
			<div ref={buttonRef}>
				<div className={'ml-2 items-center h-5 bg-white group focus:outline-none px-2 rounded-lg cursor-pointer flex'} onClick={() => set_open(!open)}>
					<Popover.Button>
						<svg className={'text-gray-700 group-hover:text-gray-900 transition-colors'} width={'8'} height={'8'} viewBox={'0 0 8 8'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
							<path fillRule={'evenodd'} clipRule={'evenodd'} d={'M3.71344 0C3.33734 0 3.01722 0.275236 2.95556 0.64995L2.85971 1.23311C2.62422 1.33278 2.40446 1.46222 2.20467 1.61681L1.65765 1.40916C1.30606 1.27604 0.91023 1.41957 0.722581 1.74891L0.436166 2.25157C0.248977 2.58011 0.322997 2.9987 0.612995 3.24058L1.0623 3.61502C1.04614 3.74109 1.03782 3.86951 1.03782 4C1.03782 4.13029 1.04614 4.2588 1.06231 4.38497L0.612892 4.7595C0.322894 5.00138 0.248979 5.4199 0.436169 5.74843L0.722584 6.2511C0.910232 6.58043 1.30632 6.72387 1.65791 6.59074L2.20467 6.38319C2.40446 6.53778 2.62422 6.66722 2.85971 6.76689L2.95556 7.35005C3.01722 7.72476 3.33734 8 3.71344 8H4.28627C4.66255 8 4.9828 7.72486 5.04448 7.34999L5.14035 6.76675C5.37574 6.66701 5.59537 6.53771 5.79527 6.38315L6.34238 6.59084C6.69425 6.72407 7.08939 6.58016 7.27724 6.25148L7.56387 5.74843C7.75109 5.41983 7.67713 5.00116 7.38657 4.7593L6.93759 4.38492C6.95372 4.25903 6.96222 4.13054 6.96222 4C6.96222 3.86926 6.95372 3.74086 6.9376 3.61507L7.38657 3.2407C7.67713 2.99884 7.75109 2.58017 7.56387 2.25157L7.27745 1.7489L7.27724 1.74852C7.08939 1.41984 6.69399 1.27603 6.34213 1.40926L5.79529 1.61684C5.59548 1.46229 5.37584 1.33283 5.14033 1.23312L5.04447 0.64995C4.98279 0.275084 4.66255 0 4.28627 0H3.71344ZM3.47892 1.53133L3.60581 0.759383C3.6147 0.705459 3.66043 0.666667 3.71344 0.666667H4.28627C4.33976 0.666667 4.38536 0.705611 4.39423 0.759383L4.52111 1.53133C4.54102 1.65244 4.62514 1.75267 4.74006 1.79223C5.0284 1.89147 5.29077 2.04703 5.5162 2.24695C5.60755 2.32797 5.73557 2.35159 5.84932 2.30841L6.57357 2.03348C6.62309 2.01477 6.67947 2.03494 6.70653 2.08214L6.99273 2.58443C7.01974 2.63183 7.00846 2.69201 6.96745 2.72614L6.37221 3.22248C6.27866 3.30048 6.23501 3.42413 6.25856 3.54442C6.2875 3.69223 6.30304 3.84421 6.30304 4C6.30304 4.15547 6.2875 4.30779 6.25856 4.45558C6.23501 4.57587 6.27866 4.69952 6.37221 4.77752L6.96766 5.27404C7.00867 5.30817 7.01974 5.36817 6.99273 5.41557L6.70647 5.91796C6.67944 5.96514 6.623 5.98512 6.57351 5.96649L5.84932 5.69159C5.73557 5.64841 5.60755 5.67203 5.5162 5.75305C5.29092 5.95284 5.02851 6.1082 4.73978 6.20787C4.625 6.24749 4.541 6.34767 4.52111 6.46867L4.39422 7.24067C4.38535 7.29444 4.33976 7.33333 4.28627 7.33333H3.71344C3.66043 7.33333 3.6147 7.29454 3.60581 7.24062L3.47892 6.46867C3.45902 6.34756 3.3749 6.24733 3.25998 6.20777C2.97152 6.10849 2.70891 5.95291 2.484 5.75319C2.39264 5.67206 2.26454 5.64838 2.15071 5.69159L1.42633 5.96657C1.37653 5.98532 1.32027 5.96484 1.29372 5.91824L1.00731 5.41557C0.980265 5.3681 0.991383 5.30795 1.03229 5.27383L1.62776 4.77758C1.72153 4.69944 1.76518 4.57546 1.74136 4.45496C1.71229 4.308 1.697 4.15589 1.697 4C1.697 3.8438 1.71229 3.69202 1.74136 3.54504C1.76518 3.42454 1.72153 3.30056 1.62776 3.22242L1.03219 2.72609C0.991365 2.69195 0.98029 2.63185 1.00731 2.58443L1.29372 2.08176C1.3203 2.03511 1.37669 2.01466 1.42653 2.03351L2.15071 2.30841C2.26454 2.35162 2.39264 2.32794 2.484 2.24681C2.70891 2.04709 2.97152 1.89151 3.25998 1.79223C3.3749 1.75267 3.45902 1.65244 3.47892 1.53133ZM3.34067 4C3.34067 3.63183 3.63601 3.33333 3.99985 3.33333C4.36396 3.33333 4.65904 3.63176 4.65904 4C4.65904 4.36824 4.36396 4.66667 3.99985 4.66667C3.63601 4.66667 3.34067 4.36816 3.34067 4ZM3.99985 2.66666C3.27209 2.66666 2.68149 3.2635 2.68149 4C2.68149 4.7365 3.27209 5.33333 3.99985 5.33333C4.72801 5.33333 5.31822 4.73643 5.31822 4C5.31822 3.26357 4.72801 2.66666 3.99985 2.66666Z'} fill={'currentcolor'}/>
						</svg>
					</Popover.Button>
				</div>

				<Transition
					show={open}
					as={Fragment}
					enter={'transition ease-out duration-200'}
					enterFrom={'opacity-0 translate-y-1'}
					enterTo={'opacity-100 translate-y-0'}
					leave={'transition ease-in duration-150'}
					leaveFrom={'opacity-100 translate-y-0'}
					leaveTo={'opacity-0 translate-y-1'}>
					<Popover.Panel className={'absolute right-0 z-30 w-screen max-w-xs px-4 pt-2 sm:px-0'}>
						<div className={'overflow-hidden rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-200'}>
							<div className={'relative bg-white p-4 max-h-96 overflow-scroll'}>
								<label className={'font-medium text-sm text-gray-800 flex flex-row items-center pb-4'}>
									<p className={'inline'}>{'Settings'}</p>
								</label>
								<div className={'flex flex-row items-center'}>
									<div className={'mr-2'}>
										<p className={'font-medium text-xs text-gray-600'}>{'Slippage'}</p>
									</div>
									<label
										htmlFor={'slippage'}
										className={'relative w-full text-left bg-white rounded-md border cursor-default focus:outline-none flex flex-row justify-between border-gray-200 text-gray-800 px-3'}>
										<input
											id={'slippage'}
											autoComplete={'off'}
											value={slippage}
											onChange={(e) => {
												set_slippage(e.target.value);
											}}
											style={{background: 'transparent'}}
											className={'truncate text-sm h-8'}
											min={0}
											max={100}
											step={0.01}
											type={'number'} />
										<div className={'absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'}>
											<span className={'text-gray-300'} id={'percent'}>
												{'%'}
											</span>
										</div>
									</label>
								</div>
							</div>
						</div>
					</Popover.Panel>
				</Transition>
			</div>
		</Popover>
	);
}


export default PopoverSlippage;