/* eslint-disable no-undef */
const {expect, use} = require('chai');
const {solidity} = require('ethereum-waffle');
const {deployments, ethers} = require('hardhat');
const detected_metapoolSwaps = require('../utils/detected_metapoolSwaps.json');

const VaultSwapper = artifacts.require('VaultSwapper');

use(solidity);

const	PATHS = detected_metapoolSwaps;
let		user_0001;

describe('Tests', () => {
	let vaultSwapper;
	
	before(async () => {
		await deployments.fixture();
		[user_0001] = await ethers.getSigners();

		vaultSwapper = await VaultSwapper.new();
	});

	describe('MetapoolSwap', async () => {
		it('should be possible to approve all', async () => {
			const	allFrom = [];
			for (let i = 0; i < PATHS.length; i++) {
				allFrom.push(PATHS[i][0]);
			}
			const	allUniqueFrom = [...new Set(allFrom)];
			for (let index = 0; index < allUniqueFrom.length; index++) {
				const	vault = new ethers.Contract(
					allUniqueFrom[index], [
						'function approve(address _spender, uint256 _value) external',
						'function decimals() external view returns (uint256)'
					],
					user_0001
				);

				const	decimals = await vault.decimals();
				const	amount = ethers.utils.parseUnits('1000', Number(decimals));
				await	initBalance(allUniqueFrom[index], amount);
				const	approveTx = await vault.approve(vaultSwapper.address, ethers.constants.MaxUint256);
				const	approveTxReceipt = await approveTx.wait();
				await	expect(approveTxReceipt.status).to.be.eq(1);
			}
		});

		for (let i = 0; i < PATHS.length; i++) {
			const from = PATHS[i][0];
			const to = PATHS[i][1];
			it(`From ${from} -> To ${to}`, async () => {
				const	vault = new ethers.Contract(
					from, ['function decimals() external view returns (uint256)'], user_0001
				);
				const	decimals = await vault.decimals();
				const	amount = ethers.utils.parseUnits('1', decimals);
				await	depositUnderlying(from, amount);

				await	expect(
					vaultSwapper.metapool_swap(
						from,
						to,
						amount,
						1,
						{'from': user_0001.address},
					)
				).not.to.be.reverted;
			});
		}
	});
});




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
async function initBalance(from, amount) {
	const	vault = new ethers.Contract(
		from,
		['function balanceOf(address _spender) external view returns (uint256)'],
		user_0001
	);

	for (let index = 2; index < 25; index++) {
		await	getVyperTokens(from, user_0001.address, amount, index);
		let balance = await vault.balanceOf(user_0001.address);
		if (balance.gt(0)) {
			return true;
		}

		await	getSolidityTokens(from, user_0001.address, amount, index);
		balance = await vault.balanceOf(user_0001.address);
		if (balance.gt(0)) {
			return true;
		}
	}
	return false;
}
async function depositUnderlying(from, amount) {
	const	vault = new ethers.Contract(
		from, [
			'function balanceOf(address _spender) external view returns (uint256)',
			'function token() public view returns (address)',
			'function totalSupply() public view returns (uint256)',
			'function deposit(uint256) public returns (uint256)',
		], user_0001
	);
	const	underlying = await vault.token();
	await	initBalance(underlying, amount);

	const	totalSupply = await vault.totalSupply();
	if (totalSupply.gte(amount)) {
		return;
	}

	const	token = new ethers.Contract(
		underlying,
		['function approve(address, uint256) public'],
		user_0001
	);
	const	approveTx = await token.approve(from, amount);
	const	approveTxReceipt = await approveTx.wait();
	await	expect(approveTxReceipt.status).to.be.eq(1);

	const	depositTx = await vault.deposit(amount);
	const	depositTxReceipt = await depositTx.wait();
	await	expect(depositTxReceipt.status).to.be.eq(1);
}
