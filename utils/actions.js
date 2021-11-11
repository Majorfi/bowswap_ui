import	{ethers}						from	'ethers';

const	BOWSWAP_UI_ORIGIN = 1;

export async function	signTransaction({provider, vaultAddress, contractAddress, amount, nonceOverwrite}, callback) {
	const	signer = provider.getSigner();
	const	contract = new ethers.Contract(
		vaultAddress, [
			'function apiVersion() public view returns (string)',
			'function nonces(address) public view returns (uint256)',
		],
		signer
	);
	const	chainId = (await provider.getNetwork())?.chainId;
	const	address = await signer.getAddress();
	const	apiVersion = await contract.apiVersion();
	const	nonce = await contract.nonces(address);
	const domain = {
		name: 'Yearn Vault',
		version: apiVersion,
		chainId: chainId, //TESTNET -> SET 1
		verifyingContract: vaultAddress
	};
	const types = {
		Permit: [
			{name: 'owner', type: 'address'},
			{name: 'spender', type: 'address'},
			{name: 'value', type: 'uint256'},
			{name: 'nonce', type: 'uint256'},
			{name: 'deadline', type: 'uint256'},
		]
	};
	const value = {
		owner: address,
		spender: contractAddress,
		value: amount,
		nonce: nonceOverwrite || nonce, //SET TESTNET NONCE
		deadline: 0,
	};

	let	signature = null;
	try {
		signature = await signer._signTypedData(domain, types, value);
	} catch (error) {
		return callback({error: error, data: undefined});
	}

	return callback({error: false, data: signature});
}

export async function	approveToken({provider, contractAddress, amount, from}, callback) {
	const	signer = provider.getSigner();
	const	erc20 = new ethers.Contract(
		contractAddress,
		['function approve(address spender, uint256 amount) public returns (bool)'],
		signer
	);

	/**********************************************************************
	**	In order to avoid dumb error, let's first check if the TX would
	**	be successful with a static call
	**********************************************************************/
	try {
		await erc20.callStatic.approve(from, amount);
	} catch (error) {
		callback({error: true, data: undefined});
		return;
	}

	/**********************************************************************
	**	If the call is successful, try to perform the actual TX
	**********************************************************************/
	try {
		const	transaction = await erc20.approve(from, amount);
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 1) {
			callback({error: false, data: amount});
		} else {
			callback({error: true, data: undefined});
		}
	} catch (error) {
		callback({error: true, data: undefined});
	}
}

//BowswapV1
export async function	metapoolSwapTokens({provider, contractAddress, from, to, amount, minAmountOut, shouldIncreaseGasLimit, donation}, callback) {
	const	signer = provider.getSigner();
	const	contract = new ethers.Contract(
		contractAddress,
		['function metapool_swap(address from, address to, uint256 amount, uint256 min_amount_out, uint256 donation, uint256 origin) public'],
		signer
	);
	if (shouldIncreaseGasLimit) {
		console.warn('Using extra gasLimit');
	}

	/**********************************************************************
	**	If the call is successful, try to perform the actual TX
	**********************************************************************/
	try {
		await contract.estimateGas.metapool_swap(
			from,
			to,
			amount,
			minAmountOut,
			donation,
			BOWSWAP_UI_ORIGIN
		);

		const	safeGasLimit = ethers.BigNumber.from(shouldIncreaseGasLimit ? 3_000_000 : 2_000_000);
		const	transaction = await contract.metapool_swap(from, to, amount, minAmountOut, donation, BOWSWAP_UI_ORIGIN, {gasLimit: safeGasLimit});
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 1) {
			callback({error: false, data: amount});
		} else {
			callback({error: true, data: undefined});
		}
	} catch (error) {
		callback({error: error, data: undefined});
	}
}

//BowswapV1 Signature
export async function	metapoolSwapTokensWithSignature({provider, contractAddress, from, to, amount, minAmountOut, signature, donation, shouldIncreaseGasLimit}, callback) {	
	const	signer = provider.getSigner();
	const	contract = new ethers.Contract(
		contractAddress,
		['function metapool_swap_with_signature(address from_vault, address to_vault, uint256 amount, uint256 min_amount_out, uint256 expiry, bytes calldata signature, uint256 donation, uint256 origin) public'],
		signer
	);
	if (shouldIncreaseGasLimit) {
		console.warn('Using extra gasLimit');
	}

	/**********************************************************************
	**	In order to avoid dumb error, let's first check if the TX would
	**	be successful with a static call
	**********************************************************************/
	try {
		await contract.callStatic.metapool_swap_with_signature(
			from,
			to,
			amount,
			minAmountOut,
			0,
			signature,
			donation,
			BOWSWAP_UI_ORIGIN
		);
	} catch (error) {
		callback({error, data: undefined});
		return;
	}

	/**********************************************************************
	**	If the call is successful, try to perform the actual TX
	**********************************************************************/
	try {
		await contract.estimateGas.metapool_swap_with_signature(
			from,
			to,
			amount,
			minAmountOut,
			0,
			signature,
			donation,
			BOWSWAP_UI_ORIGIN
		);

		const	safeGasLimit = ethers.BigNumber.from(shouldIncreaseGasLimit ? 3_000_000 : 2_000_000);
		const	transaction = await contract.metapool_swap_with_signature(from, to, amount, minAmountOut, 0, signature, donation, BOWSWAP_UI_ORIGIN, {gasLimit: safeGasLimit});
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 1) {
			callback({error: false, data: amount});
		} else {
			callback({error: true, data: undefined});
		}
	} catch (error) {
		callback({error, data: undefined});
	}
}

//BowswapV2
export async function	swapTokens({provider, contractAddress, from, to, amount, minAmountOut, instructions, shouldIncreaseGasLimit, donation}, callback) {
	const	signer = provider.getSigner();
	const	contract = new ethers.Contract(
		contractAddress,
		['function swap(address from, address to, uint256 amount, uint256 min_amount_out, tuple(bool deposit, address pool, uint128 n)[] instructions, uint256 donation, uint256 origin) public'],
		signer
	);
	if (shouldIncreaseGasLimit) {
		console.warn('Using extra gasLimit');
	}

	/**********************************************************************
	**	If the call is successful, try to perform the actual TX
	**********************************************************************/
	try {
		await contract.estimateGas.swap(
			from,
			to,
			amount,
			minAmountOut,
			instructions,
			donation,
			BOWSWAP_UI_ORIGIN
		);


		const	safeGasLimit = ethers.BigNumber.from(shouldIncreaseGasLimit ? 3_000_000 : 2_000_000);
		const	transaction = await contract.swap(
			from,
			to,
			amount,
			minAmountOut,
			instructions,
			donation,
			BOWSWAP_UI_ORIGIN,
			{gasLimit: safeGasLimit}
		);
		const	transactionResult = await transaction.wait();

		if (transactionResult.status === 1) {
			callback({error: false, data: amount});
		} else {
			callback({error: true, data: undefined});
		}
	} catch (error) {
		callback({error: error, data: undefined});
	}
}

//BowswapV2 Signature
export async function	swapTokensWithSignature({provider, contractAddress, from, to, amount, minAmountOut, instructions, signature, donation, shouldIncreaseGasLimit}, callback) {
	const	signer = provider.getSigner();
	const	contract = new ethers.Contract(
		contractAddress,
		['function swap_with_signature(address from, address to, uint256 amount, uint256 min_amount_out, tuple(bool deposit, address pool, uint128 n)[] instructions, uint256 expiry, bytes calldata signature, uint256 donation, uint256 origin)'],
		signer
	);
	if (shouldIncreaseGasLimit) {
		console.warn('Using extra gasLimit');
	}

	/**********************************************************************
	**	In order to avoid dumb error, let's first check if the TX would
	**	be successful with a static call
	**********************************************************************/
	try {
		await contract.callStatic.swap_with_signature(
			from,
			to,
			amount,
			minAmountOut,
			instructions,
			0,
			signature,
			donation,
			BOWSWAP_UI_ORIGIN
		);
	} catch (error) {
		callback({error, data: undefined});
		return;
	}

	/**********************************************************************
	**	If the call is successful, try to perform the actual TX
	**********************************************************************/
	try {
		await contract.estimateGas.swap_with_signature(
			from,
			to,
			amount,
			minAmountOut,
			instructions,
			0,
			signature,
			donation,
			BOWSWAP_UI_ORIGIN
		);

		const	safeGasLimit = ethers.BigNumber.from(shouldIncreaseGasLimit ? 3_000_000 : 2_000_000);
		const	transaction = await contract.swap_with_signature(
			from,
			to,
			amount,
			minAmountOut,
			instructions,
			0,
			signature,
			donation,
			BOWSWAP_UI_ORIGIN,
			{gasLimit: safeGasLimit}
		);
		const	transactionResult = await transaction.wait();

		if (transactionResult.status === 1) {
			callback({error: false, data: amount});
		} else {
			callback({error: true, data: undefined});
		}
	} catch (error) {
		callback({error, data: undefined});
	}
}

//YVempire
export async function	migrateBachTokens({provider, contractAddress, batch}, callback) {
	const	abi = ['function migrate(tuple(uint8 service, address coin)[] swap)'];
	const	signer = provider.getSigner();
	const	contract = new ethers.Contract(contractAddress, abi, signer);

	/**********************************************************************
	**	If the call is successful, try to perform the actual TX
	**********************************************************************/
	try {

		const	transaction = await contract.migrate(batch);
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 1) {
			callback({error: false, data: undefined});
		} else {
			callback({error: true, data: undefined});
		}
	} catch (error) {
		console.error(error);
		callback({error: error, data: undefined});
	}
}
