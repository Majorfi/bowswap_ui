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
			gray: colors.blueGray,
			green: colors.green,
			red: colors.red,
			orange: colors.orange,
			white: colors.white,
			emerald: colors.emerald,
			blue: colors.blue,
			yellow: colors.yellow,
			indigo: colors.indigo,
		},
		extend: {
			height: {
				'15': '3.75rem',
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
		require('@tailwindcss/forms'),
		require('@tailwindcss/aspect-ratio'),
	],
};
