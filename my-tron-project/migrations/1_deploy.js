const ERC1155Token = artifacts.require("ERC1155Token");
const Bridge = artifacts.require("Bridge");
const Marketplace = artifacts.require("Marketplace");
const Offset = artifacts.require("Offset");
const Treasury = artifacts.require("Treasury");
const WrappedBCT = artifacts.require("WrappedBCT");
const MockERC20 = artifacts.require("MockERC20");

module.exports = async function (deployer, network, accounts) {
    // Deploy MockERC20 tokens for local testing
    await deployer.deploy(MockERC20, "BCT", "BCT", "1000000000000000000000000");
    const bct = await MockERC20.deployed();

    await deployer.deploy(MockERC20, "TRX", "TRX", "1000000000000000000000000");
    const trxToken = await MockERC20.deployed();

    await deployer.deploy(MockERC20, "USDT", "USDT", "1000000000000000000000000");
    const usdtToken = await MockERC20.deployed();

    // Deploy ERC1155Token contract
    await deployer.deploy(ERC1155Token, "https://api.example.com/token/{id}");
    const erc1155Token = await ERC1155Token.deployed();

    // Deploy WrappedBCT contract
    await deployer.deploy(WrappedBCT, bct.address, 1);
    const wrappedBCT = await WrappedBCT.deployed();

    // Deploy Bridge contract
    await deployer.deploy(Bridge, wrappedBCT.address, bct.address, "https://api.example.com/token/{id}");
    const bridge = await Bridge.deployed();

    // Deploy Marketplace contract
    await deployer.deploy(Marketplace, erc1155Token.address, trxToken.address, usdtToken.address);
    const marketplace = await Marketplace.deployed();

    // Deploy Offset contract
    await deployer.deploy(Offset, bridge.address, erc1155Token.address, "https://api.example.com/nft/{id}");
    const offset = await Offset.deployed();

    // Deploy Treasury contract
    await deployer.deploy(Treasury, bridge.address, wrappedBCT.address, bct.address);
    const treasury = await Treasury.deployed();
};
