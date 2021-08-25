/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Wednesday August 25th 2021
**	@Filename:				index.js
******************************************************************************/

import	React					from	'react';
import	Image					from	'next/image';
import	Link					from	'next/link';
import	Parallax				from	'parallax-js';

function	Target({width = 174, height = 170}) {
	return (
		<svg width={width} height={height} viewBox={'0 0 174 170'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
			<g clipPath={'url(#clip0)'} filter={'url(#filter0_f)'}><path d={'M154.929 87.2395C162.053 58.4381 144.347 29.2815 115.381 22.1165C86.4149 14.9516 57.158 32.4914 50.0337 61.2928C42.9095 90.0942 60.6157 119.251 89.5817 126.416C118.548 133.581 147.805 116.041 154.929 87.2395Z'} fill={'#1E6EDF'}/><path d={'M144.387 84.6316C150.079 61.6195 135.932 38.3235 112.788 32.5988C89.6444 26.874 66.2682 40.8882 60.576 63.9004C54.8837 86.9126 69.0309 110.208 92.1746 115.933C115.318 121.658 138.694 107.644 144.387 84.6316Z'} fill={'white'}/><path d={'M130.33 81.1547C134.113 65.8615 124.711 50.3797 109.331 46.5752C93.9502 42.7707 78.4151 52.0841 74.6322 67.3773C70.8493 82.6705 80.2511 98.1523 95.6317 101.957C111.012 105.761 126.547 96.4479 130.33 81.1547Z'} fill={'#333333'}/><path d={'M121.633 79.0033C124.235 68.4862 117.769 57.8394 107.192 55.2231C96.6145 52.6067 85.9311 59.0115 83.3296 69.5286C80.7281 80.0457 87.1937 90.6925 97.7709 93.3089C108.348 95.9252 119.032 89.5204 121.633 79.0033Z'} fill={'white'}/><path d={'M112.848 76.8301C114.256 71.1374 110.756 65.3745 105.031 63.9583C99.3057 62.5421 93.5229 66.0089 92.1147 71.7016C90.7066 77.3944 94.2063 83.1573 99.9316 84.5735C105.657 85.9897 111.44 82.5229 112.848 76.8301Z'} fill={'#1E6EDF'}/><path fillRule={'evenodd'} clipRule={'evenodd'} d={'M54.1628 62.3141C51.4747 73.1811 52.6684 84.199 56.8011 93.7695C57.3934 95.1411 56.7573 96.7278 55.3803 97.3134C54.0033 97.8991 52.4069 97.262 51.8146 95.8903C47.2365 85.2883 45.9087 73.0695 48.8916 61.0102C56.1711 31.5816 86.065 13.6599 115.662 20.9809C145.259 28.302 163.35 58.0933 156.071 87.5219C148.792 116.951 118.898 134.872 89.3008 127.551C77.206 124.56 67.0265 117.811 59.7201 108.869C58.7733 107.71 58.9478 106.009 60.1099 105.07C61.272 104.131 62.9816 104.31 63.9284 105.468C70.5158 113.53 79.6864 119.611 90.5972 122.31C117.283 128.911 144.236 112.752 150.8 86.2181C157.363 59.6841 141.051 32.823 114.365 26.2221C87.6797 19.6212 60.7262 35.7801 54.1628 62.3141Z'} fill={'#333333'}/><path d={'M52.0371 105.353L27.1208 120.29L22.3727 139.486C22.2902 139.819 22.3091 140.17 22.427 140.494C22.5448 140.817 22.7564 141.099 23.0349 141.303C23.3134 141.508 23.6463 141.626 23.9916 141.642C24.3368 141.658 24.679 141.572 24.9747 141.395L45.6621 128.993C46.0585 128.755 46.3434 128.37 46.4542 127.923L52.0371 105.353Z'} fill={'#1E6EDF'}/><path d={'M52.0371 105.353L27.1208 120.29L7.81579 115.515C7.48018 115.432 7.1766 115.252 6.94343 114.997C6.71026 114.743 6.55797 114.425 6.50581 114.085C6.45364 113.745 6.50395 113.398 6.65037 113.087C6.79679 112.775 7.03275 112.515 7.32842 112.337L28.0159 99.9351C28.4124 99.6975 28.888 99.6265 29.338 99.7377L52.0371 105.353Z'} fill={'#92D3F5'}/><path fillRule={'evenodd'} clipRule={'evenodd'} d={'M103.661 72.737C104.49 74.1031 104.052 75.8769 102.681 76.6987L22.0094 126.871C20.6386 127.693 18.8547 127.251 18.025 125.885C17.1954 124.519 17.6341 122.745 19.005 121.923L99.6764 71.7514C101.047 70.9296 102.831 71.3708 103.661 72.737Z'} fill={'black'}/></g><defs><filter id={'filter0_f'} x={'-3.7605'} y={'-3.7605'} width={'177.521'} height={'177.521'} filterUnits={'userSpaceOnUse'} colorInterpolationFilters={'sRGB'}><feFlood floodOpacity={'0'} result={'BackgroundImageFix'}/><feBlend mode={'normal'} in={'SourceGraphic'} in2={'BackgroundImageFix'} result={'shape'}/><feGaussianBlur stdDeviation={'2'} result={'effect1_foregroundBlur'}/></filter><clipPath id={'clip0'}><rect width={'140'} height={'140'} fill={'white'} transform={'translate(0.239502 136.144) rotate(-76.1063)'}/></clipPath></defs>
		</svg>
	);
}
function	Bow({width = 132, height = 132, className}) {
	return (
		<svg width={width} height={height} viewBox={'0 0 132 132'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'} className={className}>
			<g filter={'url(#filter0_f)'}><path fillRule={'evenodd'} clipRule={'evenodd'} d={'M93.8491 33.9547C94.565 34.6706 94.565 35.8314 93.8491 36.5474L36.602 93.7958C35.886 94.5117 34.7252 94.5118 34.0093 93.7958C33.2933 93.0799 33.2933 91.919 34.0092 91.2031L91.2563 33.9547C91.9723 33.2387 93.1331 33.2387 93.8491 33.9547Z'} fill={'black'}/><path fillRule={'evenodd'} clipRule={'evenodd'} d={'M100.81 27.61C105.213 37.8432 106.446 49.1623 104.347 60.1034C102.248 71.0446 96.9154 81.1045 89.0378 88.9821C81.1602 96.8598 71.1002 102.193 60.159 104.291C49.2178 106.39 37.8986 105.158 27.6654 100.754L27.6632 100.753C26.7433 100.356 25.9346 99.7394 25.3073 98.9581C24.68 98.1768 24.2532 97.254 24.0641 96.2701C23.875 95.2861 23.9294 94.2708 24.2224 93.3127C24.5155 92.3542 25.0384 91.4826 25.7453 90.773L25.7486 90.7696C26.618 89.9013 27.7277 89.3136 28.9345 89.0824C30.1413 88.8512 31.3896 88.987 32.5184 89.4725C40.4943 92.9052 49.3172 93.866 57.8451 92.2305C66.3729 90.5949 74.2139 86.4383 80.354 80.2983C86.494 74.1583 90.6506 66.3173 92.2862 57.7894C93.9217 49.2615 92.961 40.4391 89.5284 32.4631C89.2097 31.7224 89.04 30.9258 89.029 30.1195C89.0181 29.3132 89.1661 28.5127 89.4646 27.7636C90.0674 26.2507 91.2464 25.0393 92.7424 24.3957C94.2384 23.7522 95.9288 23.7293 97.4417 24.3321C98.9545 24.9349 100.166 26.114 100.81 27.61Z'} fill={'black'}/><path fillRule={'evenodd'} clipRule={'evenodd'} d={'M97.526 29.0221C101.647 38.5985 102.801 49.1913 100.837 59.4303C98.8734 69.6693 93.8828 79.0837 86.5107 86.4557C79.1387 93.8278 69.7243 98.8184 59.4853 100.782C49.2463 102.746 38.6535 101.592 29.0771 97.4709C27.7751 96.9106 27.1738 95.4008 27.7342 94.0987C28.2946 92.7966 29.8044 92.1954 31.1065 92.7558C39.7393 96.4712 49.2883 97.511 58.5184 95.7407C67.7486 93.9705 76.2353 89.4716 82.8809 82.8259C89.5266 76.1803 94.0255 67.6936 95.7957 58.4634C97.566 49.2333 96.5262 39.6843 92.8108 31.0515C92.2504 29.7494 92.8516 28.2396 94.1537 27.6792C95.4558 27.1188 96.9656 27.7201 97.526 29.0221Z'} fill={'#A57939'}/><path d={'M57.1234 57.0689L44.1104 44.0559L31.5482 44.0559C31.3298 44.056 31.1163 44.1207 30.9347 44.2421C30.7532 44.3635 30.6116 44.5359 30.5281 44.7377C30.4445 44.9395 30.4226 45.1615 30.4652 45.3757C30.5078 45.5899 30.613 45.7867 30.7674 45.9411L41.5717 56.7455C41.7789 56.9525 42.0597 57.0688 42.3526 57.0689L57.1234 57.0689Z'} fill={'#1E6EDF'}/><path d={'M57.1234 57.069L44.1104 44.056L44.1104 31.4938C44.1104 31.2754 44.1752 31.0619 44.2965 30.8804C44.4179 30.6988 44.5904 30.5573 44.7921 30.4737C44.9939 30.3901 45.2159 30.3683 45.4302 30.4109C45.6444 30.4535 45.8411 30.5586 45.9956 30.713L56.8 41.5174C57.007 41.7245 57.1233 42.0054 57.1234 42.2982L57.1234 57.069Z'} fill={'#92D3F5'}/><path fillRule={'evenodd'} clipRule={'evenodd'} d={'M107.513 107.567C106.797 108.283 105.636 108.283 104.92 107.567L39.2723 41.9197C38.5564 41.2038 38.5564 40.043 39.2723 39.327C39.9883 38.611 41.1491 38.611 41.8651 39.327L107.513 104.975C108.229 105.691 108.229 106.851 107.513 107.567Z'} fill={'black'}/><path fillRule={'evenodd'} clipRule={'evenodd'} d={'M106.216 94.5928C107.229 94.5928 108.049 95.4136 108.049 96.4261L108.049 106.271C108.049 107.284 107.229 108.104 106.216 108.104L96.8862 108.104C95.8737 108.104 95.0528 107.284 95.0528 106.271C95.0528 105.259 95.8737 104.438 96.8862 104.438L104.383 104.438L104.383 96.4261C104.383 95.4136 105.203 94.5928 106.216 94.5928Z'} fill={'black'}/></g><defs><filter id={'filter0_f'} x={'-12'} y={'-12'} width={'156'} height={'156'} filterUnits={'userSpaceOnUse'} colorInterpolationFilters={'sRGB'}><feFlood floodOpacity={'0'} result={'BackgroundImageFix'}/><feBlend mode={'normal'} in={'SourceGraphic'} in2={'BackgroundImageFix'} result={'shape'}/><feGaussianBlur stdDeviation={'6'} result={'effect1_foregroundBlur'}/></filter></defs>
		</svg>
	);
}

function	Index() {
	React.useEffect(() => {
		if (typeof(window) !== 'undefined') {
			new Parallax(document.getElementById('bow1'));
			new Parallax(document.getElementById('bow2'));
			new Parallax(document.getElementById('target1'));
			new Parallax(document.getElementById('target2'));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [typeof(window)]);

	return (
		<section className={'mt-14 pt-14 w-full flex justify-center md:px-12 px-4 space-y-12 mb-64 z-10 relative'}>
			<div className={'w-150 h-104 relative'}>
				<div className={'absolute -top-24 -right-24 z-30 filter-blur-4'}>
					<div data-relative-input={'false'} id={'target1'}>
						<div data-depth={'0.2'}>
							<Target />
						</div>
					</div>
				</div>
				<div className={'absolute -bottom-52 -left-52 z-30 filter-blur-20 -rotate-90 transform'}>
					<div data-relative-input={'false'} id={'bow1'}>
						<div data-depth={'0.2'}>
							<Bow width={322} height={322} />
						</div>
					</div>
				</div>

				<div className={'flex justify-center items-center flex-col bg-white bg-opacity-50 backdrop-blur-md rounded-2xl px-24 pt-8 pb-10 z-20 border-2 border-solid border-white border-opacity-70 border-r-0 border-b-0'}>
					<Image src={'/yBowswap.png'} width={56} height={56} quality={95} loading={'eager'} />

					<div className={'text-center mt-4 lg:mt-10'}>
						<h1 className={'text-4xl lg:text-5xl font-bold text-ygray-900'}>{'BOWSWAP'}</h1>
					</div>
					<div className={'text-center mt-6 lg:mt-10'}>
						<p className={'text-2xl font-medium text-ygray-900'}>{'Increase Your Yield with Yearn'}</p>
						<p className={'text-base text-ygray-700 mt-4'}>{'Swap yield bearing tokens to get the best available yield. Simple!'}</p>
					</div>
					<Link href={'/swap'}>
						<div className={'mt-10 w-full flex justify-center'}>
							<div className={'max-w-xs cursor-pointer bg-yblue hover:bg-yblue-hover transition-colors rounded-lg py-3 text-white text-sm flex items-center justify-center w-full min-w-max'}>
								{'Swap!'}
							</div>
						</div>
					</Link>
				</div>

				<div className={'absolute -bottom-14 -right-12 filter-blur-12 rotate-60 transform'} style={{zIndex: -10,}}>
					<div data-relative-input={'false'} id={'target2'}>
						<div data-depth={'0.2'}>
							<Target width={88} height={88} />
						</div>
					</div>
				</div>
				<div className={'absolute -top-18 -left-18 filter-blur-12'} style={{zIndex: -10}}>
					<div data-relative-input={'false'} id={'bow2'}>
						<div data-depth={'0.2'}>
							<Bow />
						</div>
					</div>
				</div>

			</div>
		</section>
	);
}

export default Index;
