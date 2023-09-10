Here's a detailed step-by-step handbook on how to deploy the smart contracts on the Shasta Testnet for TRON:

Prerequisites:

Node.js installed on your computer.
Truffle Suite installed globally: npm install -g truffle.
A Shasta Testnet account with some TRX to deploy the contracts.

Step 1: Set up the Truffle project

Create a new folder for your project: mkdir carbon-credit-marketplace && cd carbon-credit-marketplace.
Run truffle init to set up a new Truffle project.
Move your Solidity contracts to the contracts folder.
Create a migrations folder if it doesn't exist and add a file named 2_deploy_contracts.js. Inside the file, add the deployment code for your contracts:

javascript
Copy code

const MasterContract = artifacts.require("MasterContract");

module.exports = function (deployer) {
  deployer.deploy(MasterContract);
};

Step 2: Configure Truffle for the Shasta Testnet

Install TronBox: npm install tronbox.
Create a tronbox.js configuration file in the root of your project:

javascript
Copy code

module.exports = {
  networks: {
    shasta: {
      from: "your_shasta_testnet_address",
      privateKey: "your_private_key",
      userFeePercentage: 30,
      feeLimit: 1e8,
      originEnergyLimit: 1e7,
      fullNode: "https://api.shasta.trongrid.io",
      solidityNode: "https://api.shasta.trongrid.io",
      eventServer: "https://api.shasta.trongrid.io",
      network_id: "*" // Match any network id
    }
  },
  compilers: {
    solc: {
      version: "0.8.0" // Your solidity version
    }
  }
};

Replace your_shasta_testnet_address and your_private_key with your Shasta Testnet account address and private key.

Step 3: Install dependencies and compile the contracts

Install the necessary dependencies for your project: npm install.

Compile the contracts: tronbox compile.

Step 4: Deploy the contracts to Shasta Testnet

Deploy the contracts: tronbox migrate --network shasta.
The command will deploy your contracts to the Shasta Testnet, and you will see the transaction hash, contract addresses, and other relevant information.

Step 5: Interact with the deployed contracts

To interact with your deployed contracts, you can use the tronbox console --network shasta command, which gives you an interactive console to call your contract functions.
That's it! You've successfully deployed your smart contracts to the Shasta Testnet for TRON. You can now test and interact with your contracts on the testnet before deploying them to the mainnet.