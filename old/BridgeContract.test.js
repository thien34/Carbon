const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCreditBridgeContract", function () {
  let CarbonCreditBridge, carbonCreditBridge, CarbonCreditERC1155, carbonCreditERC1155, WrappedBCT, wrappedBCT, owner, addr1, addr2;

  beforeEach(async function () {
    // Deploy CarbonCreditERC1155 contract
    CarbonCreditERC1155 = await ethers.getContractFactory("CarbonCreditERC1155");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    carbonCreditERC1155 = await CarbonCreditERC1155.deploy("https://example.com/metadata/");
    
    // Deploy WrappedBCT contract
    WrappedBCT = await ethers.getContractFactory("WrappedBCT");
    wrappedBCT = await WrappedBCT.deploy(carbonCreditERC1155.address);

    // Deploy CarbonCreditBridgeContract
    CarbonCreditBridge = await ethers.getContractFactory("CarbonCreditBridgeContract");
    carbonCreditBridge = await CarbonCreditBridge.deploy(carbonCreditERC1155.address, wrappedBCT.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await carbonCreditBridge.owner()).to.equal(owner.address);
    });

    it("Should set the correct CarbonCreditERC1155 address", async function () {
      expect(await carbonCreditBridge.carbonCreditERC1155()).to.equal(carbonCreditERC1155.address);
    });

    it("Should set the correct WrappedBCT address", async function () {
      expect(await carbonCreditBridge.wrappedBCT()).to.equal(wrappedBCT.address);
    });
  });

  describe("Token minting and bridging", function () {
    it("Should mint and bridge tokens successfully", async function () {
      const projectID = 1;
      const amount = 100;

      await carbonCreditBridge.connect(owner).mintAndBridge(projectID, addr1.address, amount);
      expect(await carbonCreditERC1155.balanceOf(addr1.address, projectID)).to.equal(amount);
    });

    it("Should fail minting and bridging tokens if not owner", async function () {
      const projectID = 1;
      const amount = 100;

      await expect(
        carbonCreditBridge.connect(addr1).mintAndBridge(projectID, addr1.address, amount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
