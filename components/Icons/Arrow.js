/******************************************************************************
**	@Author:				Thomas Bouder <Tbouder>
**	@Email:					Tbouder@protonmail.com
**	@Date:					Saturday July 31st 2021
**	@Filename:				Arrow.js
******************************************************************************/

import	React				from	'react';

function Icon({width = 30, height = 50, className}) {
	return (
		<>
			<svg className={className} width={width} height={height} viewBox={'0 0 30 50'} fill={'none'} xmlns={'http://www.w3.org/2000/svg'}>
				<path d={'M13.5858 49.4142C14.3668 50.1953 15.6332 50.1953 16.4142 49.4142L29.1421 36.6863C29.9232 35.9052 29.9232 34.6389 29.1421 33.8579C28.3611 33.0768 27.0948 33.0768 26.3137 33.8579L15 45.1716L3.68629 33.8579C2.90524 33.0768 1.63891 33.0768 0.857864 33.8579C0.0768147 34.6389 0.0768146 35.9052 0.857863 36.6863L13.5858 49.4142ZM13 26L13 48L17 48L17 26L13 26Z'} fill={'#888888'}/><circle cx={'15'} cy={'26'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'26'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'26'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'26'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'14'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'14'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'14'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'14'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'2'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'2'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'2'} r={'2'} fill={'#888888'}/><circle cx={'15'} cy={'2'} r={'2'} fill={'#888888'}/>
			</svg>
		</>
	);
}

export default Icon;
