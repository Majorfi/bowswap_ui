const SWAPS = require('./detected_swaps.json');

async function	upgradeSwaps() {
	const upgradedSwaps = [];

	for (let index = 0; index < SWAPS.length; index++) {
		const swap = SWAPS[index];
		const instructions = swap[2];

		const path = [];
		let	previousInstruction = null;
		let	newInstructionPos = 0;
		for (let jindex = 0; jindex < instructions.length; jindex++) {
			const instruction = instructions[jindex];
			if (!previousInstruction) {
				path[newInstructionPos++] = instruction;
				previousInstruction = instruction;
				continue;
			}
			if (previousInstruction[1] === instruction[1]) {
				const newSwap = [2, instruction[1], previousInstruction[2], instruction[2]];
				path[newInstructionPos - 1] = newSwap;
				previousInstruction = newSwap;
			} else {
				path[newInstructionPos++] = instruction;
				previousInstruction = instruction;
			}
		}
		if (swap[0] !== swap[1])
			upgradedSwaps.push([swap[0], swap[1], path]);
	}

	const toJSON = JSON.stringify(upgradedSwaps, null, 0);
	console.log(toJSON);
}

upgradeSwaps();
