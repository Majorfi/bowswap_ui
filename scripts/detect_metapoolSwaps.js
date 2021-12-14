const {default: axios} = require('axios');
const {expect} = require('chai');
const hre = require('hardhat');
const ethers = hre.ethers;
let user_0001;


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

async function detectMetapools(vaultSwapper) {
	[user_0001] = await ethers.getSigners();

	const	allVaults = await axios.get('https://api.yearn.finance/v1/chains/1/vaults/all');
	const	validVaults = allVaults.data.filter(e => e.type === 'v2').filter(e => !e.migration || e.migration?.available === false).filter(e => ((e.display_name).toLowerCase()).includes('curve'));
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
					user_0001
				);

				const	decimals = await vault.decimals();
				const	amount = ethers.utils.parseUnits('1000', Number(decimals));
				await	initBalance(from, amount);
				const	approveTx = await vault.approve(vaultSwapper.address, ethers.constants.MaxUint256);
				const	approveTxReceipt = await approveTx.wait();
				await	expect(approveTxReceipt.status).to.be.eq(1);
			}

			{
				const	vault = new ethers.Contract(
					from,
					[
						'function decimals() external view returns (uint256)',
						'function depositLimit() external view returns (uint256)'
					],
					user_0001
				);

				const	decimals = await vault.decimals();
				const	amount = ethers.utils.parseUnits('1', decimals);
				await	depositUnderlying(from, amount);

				try {
					await	expect(
						vaultSwapper['metapool_swap(address,address,uint256,uint256)'](
							from,
							to,
							amount,
							1
						)
					).not.to.be.reverted;
					possibleSwaps.push([from, to]);
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
	const VaultSwapper = await hre.ethers.getContractFactory('VaultSwapper');
	const vaultSwapper = await VaultSwapper.deploy();
	await vaultSwapper.deployed();
	await detectMetapools(vaultSwapper);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

