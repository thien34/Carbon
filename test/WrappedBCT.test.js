const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WrappedBCT", function () {
  let WrappedBCT, wrappedBCT, MockERC20, mockERC20, owner, addr1, addr2;

  beforeEach(async function () {
    // Deploy MockERC20
    MockERC20 = await ethers.getContractFactory("MockERC20");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    mockERC20 = await MockERC20.deploy("Mock Token", "MTK", 1000000);

    // Deploy WrappedBCT
    WrappedBCT = await ethers.getContractFactory("WrappedBCT");
    wrappedBCT = await WrappedBCT.deploy(mockERC20.address, 1);
  });

  describe("Wrap Tokens", function () {
    it("Should wrap tokens correctly", async function () {
      // Transfer some tokens to addr1
      await mockERC20.transfer(addr1.address, 1000);

      // Connect to addr1 signer
      const mockERC20WithAddr1 = mockERC20.connect(addr1);

      // Approve wrappedBCT to transfer tokens on behalf of addr1
      await mockERC20WithAddr1.approve(wrappedBCT.address, 500);

      // Wrap 500 tokens
      const wrappedBCTWithAddr1 = wrappedBCT.connect(addr1);
      await wrappedBCTWithAddr1.wrap(addr1.address, 500);

      // Check if 500 tokens are transferred to WrappedBCT
      expect(await mockERC20.balanceOf(wrappedBCT.address)).to.equal(500);
    });
  });

  describe("Unwrap Tokens", function () {
    it("Should unwrap tokens correctly", async function () {
      // Transfer some tokens to addr1
      await mockERC20.transfer(addr1.address, 1000);

      // Connect to addr1 signer
      const mockERC20WithAddr1 = mockERC20.connect(addr1);

      // Approve wrappedBCT to transfer tokens on behalf of addr1
      await mockERC20WithAddr1.approve(wrappedBCT.address, 500);

      // Wrap 500 tokens
      const wrappedBCTWithAddr1 = wrappedBCT.connect(addr1);
      await wrappedBCTWithAddr1.wrap(addr1.address, 500);

      // Unwrap 200 tokens
      await wrappedBCT.unwrap(addr1.address, 200);

      // Check if 200 tokens are transferred back to addr1
      expect(await mockERC20.balanceOf(addr1.address)).to.equal(700);
    });
  });
});
