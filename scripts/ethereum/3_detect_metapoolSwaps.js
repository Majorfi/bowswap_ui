const {default: axios} = require('axios');
const {expect} = require('chai');
const {ethers} = require('hardhat');

const	DEPLOYED_VAULT_SWAPPER_ADDRESS = '0x000000000037d42ab4e2226ce6f44c5dc0cf5b16';
const	YEARN_API_ROUTE = 'https://api.yearn.finance/v1/chains/1/vaults/all';

const toBytes32 = (bn) => {
	return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
};
const setStorageAt = async (address, index, value) => {
	await ethers.provider.send('hardhat_setStorageAt', [address, index, value]);
	await ethers.provider.send('evm_mine', []); // Just mines to the next block
};
async function	getVyperTokens(addr, user, amount, slot) {
	const index = ethers.utils.solidityKeccak256(
		['uint256', 'uint256'],
		[slot, user]
	);
	try {
		await setStorageAt(
			addr,
			index.toString(),
			toBytes32(amount).toString()
		);
	} catch (error) {
		//
	}
}
async function	getSolidityTokens(addr, user, amount, slot) {
	const index = ethers.utils.solidityKeccak256(
		['uint256', 'uint256'],
		[user, slot]
	);
	try {
		await setStorageAt(
			addr,
			index.toString(),
			toBytes32(amount).toString()
		);	
	} catch (error) {
		//
	}
}
async function initBalance(provider, from, amount) {
	const	vault = new ethers.Contract(
		from,
		['function balanceOf(address _spender) external view returns (uint256)'],
		provider
	);

	for (let index = 2; index < 25; index++) {
		await	getVyperTokens(from, provider.address, amount, index);
		let balance = await vault.balanceOf(provider.address);
		if (balance.gt(0)) {
			return true;
		}

		await	getSolidityTokens(from, provider.address, amount, index);
		balance = await vault.balanceOf(provider.address);
		if (balance.gt(0)) {
			return true;
		}
	}
	return false;
}
async function depositUnderlying(provider, from, amount) {
	const	vault = new ethers.Contract(
		from, [
			'function balanceOf(address _spender) external view returns (uint256)',
			'function token() public view returns (address)',
			'function totalSupply() public view returns (uint256)',
			'function deposit(uint256) public returns (uint256)',
		], provider
	);
	const	underlying = await vault.token();
	await	initBalance(provider, underlying, amount);

	const	totalSupply = await vault.totalSupply();
	if (totalSupply.gte(amount)) {
		return;
	}

	const	token = new ethers.Contract(
		underlying,
		['function approve(address, uint256) public'],
		provider
	);
	const	approveTx = await token.approve(from, amount, {from: provider.address});
	const	approveTxReceipt = await approveTx.wait();
	await	expect(approveTxReceipt.status).to.be.eq(1);

	const	depositTx = await vault.deposit(amount, {from: provider.address});
	const	depositTxReceipt = await depositTx.wait();
	await	expect(depositTxReceipt.status).to.be.eq(1);
}

async function detectMetapools() {
	const	[provider] = await ethers.getSigners();
	const	vaultSwapper = new ethers.Contract(
		DEPLOYED_VAULT_SWAPPER_ADDRESS,
		['function metapool_swap(address,address,uint256,uint256)'],
		provider
	);


	const	allVaults = await axios.get(YEARN_API_ROUTE);
	const	validVaults = allVaults.data
		.filter(e => e.type === 'v2')
		.filter(e => !e.migration || e.migration?.available === false);
	const	possibleSwaps = [];
	const	checked = [];

	for (let i = 0; i < validVaults.length; i++) {
		for (let j = 0; j < validVaults.length; j++) {
			if (i === j) continue;
			const from = validVaults[i].address;
			const to = validVaults[j].address;
			if (checked.includes(`${from}_${to}`))
				continue;
			checked.push(`${from}_${to}`);

			{
				const	vault = new ethers.Contract(
					from, [
						'function approve(address _spender, uint256 _value) external',
						'function decimals() external view returns (uint256)'
					],
					provider
				);

				const	decimals = await vault.decimals();
				const	amount = ethers.utils.parseUnits('1000', Number(decimals));
				await	initBalance(provider, from, amount);
				const	approveTx = await vault.approve(vaultSwapper.address, ethers.constants.MaxUint256, {from: provider.address});
				const	approveTxReceipt = await approveTx.wait();
				await	expect(approveTxReceipt.status).to.be.eq(1);
			}

			{
				const	vault = new ethers.Contract(
					from,
					['function decimals() external view returns (uint256)'],
					provider
				);

				const	decimals = await vault.decimals();
				const	amount = ethers.utils.parseUnits('10', decimals);
				try {
					await	depositUnderlying(provider, from, amount);

					try {
						await	expect(
							vaultSwapper.metapool_swap(
								from,
								to,
								amount,
								1,
								{from: provider.address}
							)
						).not.to.be.reverted;
						possibleSwaps.push([from, to]);
					} catch (error) {
						//
					}
				} catch (error) {
					//
				}
			}
		}
	}

	const toJSON = JSON.stringify(possibleSwaps, null, 2);
	console.log(toJSON);
}


async function main() {
	await detectMetapools();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

