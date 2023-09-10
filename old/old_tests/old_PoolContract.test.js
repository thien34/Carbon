const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("PoolContract", function () {
  let MasterContract, BridgeContract, PoolContract, ERC20CO2Token, masterContract, bridgeContract, poolContract, erc20Token, deployer, issuer, verifier, other;
  const tokenId = 1;
  const carbonCredits = 100;
  const initialPrice = ethers.utils.parseEther("1");

  before(async function () {
    MasterContract = await ethers.getContractFactory("MasterContract");
    BridgeContract = await ethers.getContractFactory("BridgeContract");
    PoolContract = await ethers.getContractFactory("PoolContract");
    ERC20CO2Token = await ethers.getContractFactory("ERC20CO2Token");
    [deployer, issuer, verifier, other] = await ethers.getSigners();
  });

  beforeEach(async function () {
    masterContract = await MasterContract.deploy();
    await masterContract.deployed();

    const bridgeTx = await masterContract.deployBridgeContract(issuer.address, verifier.address, tokenId, carbonCredits);
    const bridgeReceipt = await bridgeTx.wait();
    const bridgeEvent = bridgeReceipt.events.find((event) => event.event === "BridgeContractDeployed");
    bridgeContract = await BridgeContract.attach(bridgeEvent.args.bridgeContractAddress);

    const poolTx = await masterContract.deployPoolContract(bridgeContract.address, initialPrice, tokenId);
    const poolReceipt = await poolTx.wait();
    const poolEvent = poolReceipt.events.find((event) => event.event === "PoolContractDeployed");
    poolContract = await PoolContract.attach(poolEvent.args.poolContractAddress);

    const erc20Address = await poolContract.erc20Token();
    erc20Token = await ERC20CO2Token.attach(erc20Address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner address", async function () {
      const owner = await poolContract.owner();
      expect(owner).to.equal(masterContract.address);
    });

    it("Should set the correct Bridge Contract address", async function () {
      const storedBridgeContract = await poolContract.bridgeContract();
      expect(storedBridgeContract).to.equal(bridgeContract.address);
    });

    it("Should set the correct initial price", async function () {
      const storedPrice = await poolContract.getTokenPrice(tokenId);
      expect(storedPrice).to.equal(initialPrice);
    });
  });

  describe("setTokenPrice", function () {
    it("Should update the token price", async function () {
      const newPrice = ethers.utils.parseEther("2");
      await poolContract.connect(issuer).setTokenPrice(tokenId, newPrice);
      const updatedPrice = await poolContract.getTokenPrice(tokenId);
      expect(updatedPrice).to.equal(newPrice);
    });
  });

  // Add more tests as needed, like mintCO2Tokens, burnCO2Tokens, etc.
});
