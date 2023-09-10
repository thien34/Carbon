const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("MasterContract", function () {
  let MasterContract, masterContract, deployer, issuer, verifier, other;

  before(async function () {
    MasterContract = await ethers.getContractFactory("MasterContract");
    [deployer, issuer, verifier, other] = await ethers.getSigners();
  });

  beforeEach(async function () {
    masterContract = await MasterContract.deploy();
    await masterContract.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct deployer address", async function () {
      const owner = await masterContract.owner();
      expect(owner).to.equal(deployer.address);
    });
  });

  describe("deployBridgeContract", function () {
    it("Should deploy a new Bridge Contract", async function () {
      const tokenId = 1;
      const carbonCredits = 100;

      await expect(masterContract.deployBridgeContract(issuer.address, verifier.address, tokenId, carbonCredits))
        .to.emit(masterContract, "BridgeContractDeployed")
        .withArgs(ethers.utils.hexZeroPad(tokenId, 32), ethers.constants.AddressZero);
    });
  });

  describe("deployPoolContract", function () {
    it("Should deploy a new Pool Contract", async function () {
      const bridgeContractAddress = "0x0000000000000000000000000000000000000001";
      const initialPrice = ethers.utils.parseEther("0.01");
      const tokenId = 1;

      await expect(masterContract.deployPoolContract(bridgeContractAddress, initialPrice, tokenId))
        .to.emit(masterContract, "PoolContractDeployed")
        .withArgs(ethers.utils.hexZeroPad(tokenId, 32), ethers.constants.AddressZero);
    });
  });

  // Add more tests as needed
});
