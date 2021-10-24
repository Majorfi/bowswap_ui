<<<<<<< HEAD
/******************************************************************************
**	@Author:				Bowswap
**	@Date:					Thursday July 29th 2021
**	@Filename:				useDebounce.js
******************************************************************************/

=======
>>>>>>> 1029127fdace860cc962d3544ed0aa3a9de9628f
import {useState, useEffect} from 'react';

function useDebounce(value, delay) {
	// State and setters for debounced value
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(
		() => {
			// Update debounced value after delay
			const handler = setTimeout(() => {
				setDebouncedValue(value);
			}, delay);

			// Cancel the timeout if value changes (also on delay change or unmount)
			// This is how we prevent debounced value from updating if value is changed ...
			// .. within the delay period. Timeout gets cleared and restarted.
			return () => {
				clearTimeout(handler);
			};
		},
		[value, delay], // Only re-call effect if value or delay changes
	);

	return debouncedValue;
}

export default useDebounce;
