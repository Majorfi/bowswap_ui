const colors = require('tailwindcss/colors');

module.exports = {
	purge: [
		'./pages/**/*.js',
		'./components/**/*.js'
	],
	darkMode: false,
	corePlugins: {
		ringColor: false,
	},
	theme: {
		colors: {
			gray: colors.coolGray,
			green: colors.green,
			red: colors.red,
			white: colors.white,
			sky: colors.sky,
		},
		extend: {
			height: {
				'17': '68px',
				'xxl': '520px',
			},
			boxShadow: {
				base: '0 10px 30px rgb(209 213 223 / 50%)'
			},
		},
	},
	variants: {
		extend: {
			backgroundColor: ['group-focus'],
			opacity: ['group-hover', 'group-focus'],
			display: ['group-hover'],
			animation: ['group-hover'],
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/forms')
	],
};
