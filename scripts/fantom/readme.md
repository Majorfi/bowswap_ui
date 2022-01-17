# How to use
**USE THESES SCRIPTS FROM ROOT, NOT HERE : `cd ../..`**

1. Update the listings we can use. This can be updated every time a new curve pool is created to try to find new paths.
```
npx hardhat run scripts/fantom/0_detect_listing.js > scripts/fantom/detected_listing.json --network localhost
```
This will create a new json file with the detected listings. This will be used in next scripts.

2. The second and main feature of Bowswap is the `swap` command. This command will try to find the best path to swap the tokens.
```
npx hardhat run scripts/fantom/1_detect_swaps.js > scripts/fantom/detected_swaps.json --network localhost
```
This is the big backtracking function that will try to find the valid path. Depending on the depth (see Line ~217 : `for (let max = 0; max < 7; max++) {` where `7` is depth) it can be very slow. A new file will be created in the `scripts` folder and will be used the next script.

3. A new feature was introduced to perform actual swap when possible and save 1 operation when possible. You can use this script to update the `detected_swaps.json` file.
```
node scripts/fantom/2_upgrade_swaps.js > utils/swaps/fantom/swaps.json
```