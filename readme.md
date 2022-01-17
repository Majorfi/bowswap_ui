# 🏹 Bowswap

## Setup  

1. Install the dependencies with `yarn`  
2. Create a `.env` file in the root directory with
```
ALCHEMY_KEY=YOUR_ALCHEMY_KEY
```  
3. Start the dev project with `yarn run dev`
4. [Go check the swap](http://localhost:3000)

## How to generate the paths
Bowswap works by generating a path for each possible swap. Detecting the correct swap from one vault to another require some backtracking to try to find the correct, most optimal path.   
Because of the number of possibilities, this is a very expensive operation.  
`From` and `To` will always be Yearn Vaults, fetched directly from the Yearn API here: [https://api.yearn.finance/v1/chains/1/vaults/all](https://api.yearn.finance/v1/chains/1/vaults/all).  
The possible paths (or *listing*) correspond to the possible pools from Curve Finance we could use to move from one specific LP token to another until we reach the underlying token of the `To` vault. The pools used are not limited to the one used in Yearn vaults, but integrates all the pools from Curve Finance, including the factory pools (ibBtc, ibEur for example).  
All commands must be run in the root directory of the project.  
Check `scripts/ethereum/readme.md` or `scripts/fantom/readme.md` for more information.

## Tests
You can test the paths with :   
- `npx hardhat test tests/00_metapoolswaps.js`  
- `npx hardhat test tests/01_swaps.js`  

## Links
- [Yearn](http://yearn.finance/) 
- [yCRV Metapool Swapper](https://github.com/pandadefi/y-crv-metapool-swapper) by @pandadefi
