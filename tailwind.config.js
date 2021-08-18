const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

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
			error: '#FF005E',
			pending: '#FFB800',
			success: '#A5DF00',
			yblue: '#1E6EDF',
			'connect-hover': '#D6E7FF',
			'yblue-lighter': '#1582FF',
			'yblue-hover': '#3B86F0',
			'light-hover': '#F1F4F8',
			ygray: {
				50: '#EDEDED',
				100: '#F2F3F5',
				400: '#BDBDBD',
				500: '#A5A5A5',
				700: '#828282',
				900: '#333333',
			}
		},
		extend: {
			fontFamily: {
				sans: ['Roboto', ...defaultTheme.fontFamily.sans],
			},
			height: {
				'17': '68px',
				'xxl': '520px',
			},
			maxWidth: {
				'2xl': '680px'
			},
			width: {
				'4/11': '36.3636%',
				'7/11': '63.6363%',
			},
			boxShadow: {
				base: '0px 16px 56px 0px #001D2D1A'
			},
			animation: {
				'scale-up-center': 'scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000)   both',
			},
			keyframes: {
				'scale-up-center': {
					'0%': {
						transform: 'scale(0)'
					},
					to: {
						transform: 'scale(1)'
					}
				}
			}
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
