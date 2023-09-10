const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OffsetServiceContract", function () {
  let OffsetServiceContract, offsetServiceContract, CarbonCreditERC1155, carbonCreditERC1155, owner, addr1, addr2;

  beforeEach(async function () {
    // Deploy CarbonCreditERC1155 contract
    CarbonCreditERC1155 = await ethers.getContractFactory("CarbonCreditERC1155");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    carbonCreditERC1155 = await CarbonCreditERC1155.deploy("https://example.com/metadata/");

    // Deploy OffsetServiceContract
    OffsetServiceContract = await ethers.getContractFactory("OffsetServiceContract");
    offsetServiceContract = await OffsetServiceContract.deploy(carbonCreditERC1155.address);

    // Mint carbon credits to addr1
    await carbonCreditERC1155.connect(owner).mint(addr1.address, 0, ethers.utils.parseEther("100"), "0x");
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await offsetServiceContract.owner()).to.equal(owner.address);
    });

    it("Should set the correct carbonCreditERC1155 address", async function () {
      expect(await offsetServiceContract.carbonCreditERC1155()).to.equal(carbonCreditERC1155.address);
    });
  });

  describe("Offsetting carbon emissions", function () {
    it("Should offset carbon emissions successfully", async function () {
      await offsetServiceContract.connect(addr1).offsetCarbon(0, ethers.utils.parseEther("50"));

      const receiptId = await offsetServiceContract.connect(addr1).getReceiptId(addr1.address);
      expect(receiptId).to.equal(1);

      const receipt = await carbonCreditERC1155.connect(addr1).uri(receiptId);
      expect(receipt).to.equal("https://example.com/metadata/1");

      expect(await carbonCreditERC1155.balanceOf(addr1.address, 0)).to.equal(ethers.utils.parseEther("50"));
    });

    it("Should fail offsetting carbon emissions without sufficient balance", async function () {
      await expect(offsetServiceContract.connect(addr1).offsetCarbon(0, ethers.utils.parseEther("150"))).to.be.revertedWith(
        "CarbonCreditERC1155: insufficient balance for transfer"
      );
    });
  });
});
