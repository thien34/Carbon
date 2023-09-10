require("@nomiclabs/hardhat-waffle");

module.exports = {
  networks: {
    hardhat: {
      ens: {
        enabled: false,
      },
    },
  },
  solidity: "0.8.4",
};
