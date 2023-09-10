Here's a step-by-step guide on how to set up the environment and test the contracts using Hardhat:

Install Node.js (version 14.x or later) and npm: Download the installer from the official Node.js website (https://nodejs.org/) and follow the installation instructions.

Create a new folder for your project and navigate to it using the command line or terminal.

Initialize a new Node.js project by running npm init and following the prompts.

Install Hardhat and the necessary dependencies by running the following command:

css
Copy code
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers chai
Create a new file named hardhat.config.js in the root folder of your project and paste the following content:
javascript
Copy code
require("@nomiclabs/hardhat-ethers");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
};
Create a folder named contracts in your project's root folder. Save all the contract code files (CarbonCreditERC1155.sol, WrappedBCT.sol, OffsetServiceContract.sol, and BCTToken.sol) inside this folder.

Create a folder named test in your project's root folder. Save all the test scripts (unit tests and integration test) inside this folder.

Run the tests by executing the following command in the terminal:

bash
Copy code
npx hardhat test
This command will compile your contracts and run all the tests saved in the test folder. You will see the test results in your terminal, including the passed and failed tests with their corresponding error messages (if any).

If you need to make changes to the contract code or tests, just update the corresponding files and re-run the tests using the npx hardhat test command.

If you want to deploy your contracts to a testnet or mainnet, you'll need to update your hardhat.config.js file with the necessary network configurations and deploy scripts. You can find more information on deployment in the Hardhat documentation: https://hardhat.org/guides/deploying.html