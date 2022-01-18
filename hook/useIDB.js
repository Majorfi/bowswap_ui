import {useState, useEffect, useCallback} from 'react';

const hasIDB = typeof window !== 'undefined';

const dbp = new Promise((resolve, reject) => {
	if (!hasIDB) {
		return resolve(undefined);
	}
	const openreq = window.indexedDB.open('bowswap_V1', 1);
	openreq.onerror = () => reject(openreq.error);
	openreq.onsuccess = () => resolve(openreq.result);
	openreq.onupgradeneeded = () => openreq.result.createObjectStore('idb');
});

const call = async (type, method, ...args) => {
	const db = await dbp;
	return new Promise((resolve, reject) => {
		if (hasIDB){
			const transaction = db.transaction('idb', type);
			const store = transaction.objectStore('idb');
			const req = store[method](...args);
			transaction.oncomplete = () => resolve(req);
			transaction.onabort = transaction.onerror = () => reject(transaction.error);
		} else {
			resolve(undefined);
		}
	});
};

const get = async key => (await call('readonly', 'get', key)).result;
const set = (key, value) => value === undefined ? call('readwrite', 'delete', key) : call('readwrite', 'put', value, key);

const initMapping = {};
const getIsInit = (key) => initMapping[key];
const setIsInit = (key) => initMapping[key] = true;

const useIdb = (key, initialState) => {
	const [item, setItem] = useState(initialState);
	const [staleItems, setStaleItems] = useState([]);


	function onInitEnded() {
		staleItems.forEach((value) => {
			if (value instanceof Function) {
				setItem((prev) => {
					const newState = value(prev);
					set(key, newState);
					return newState;
				});
			} else {
				setItem(value);
				return set(key, value);
			}
		});
	}

	const onLoad = useCallback(async () => {
		const value = await get(key);
		setIsInit(key);
		onInitEnded([value === undefined || value, ...staleItems]);
		return value === undefined || setItem(value);
	}, [key]);
	useEffect(() => onLoad(), [onLoad]);

	const	setValue = (value) => {
		const	init = getIsInit(key);
		if (!init) {
			setStaleItems((prev) => [...prev, value]);
			return;
		}
		if (value instanceof Function) {
			setItem((prev) => {
				const newState = value(prev);
				set(key, newState);
				return newState;
			});
		} else {
			setItem(value);
			return set(key, value);
		}
	};

	return [
		item,
		setValue
	];
};
export default useIdb;