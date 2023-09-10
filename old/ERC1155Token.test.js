const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC1155Token", function () {
  let ERC1155Token, carbonCreditERC1155, owner, addr1, addr2;

  beforeEach(async function () {
    ERC1155Token = await ethers.getContractFactory("ERC1155Token");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    carbonCreditERC1155 = await ERC1155Token.deploy("https://example.com/metadata/");
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await carbonCreditERC1155.owner()).to.equal(owner.address);
    });

    it("Should set the correct metadata URI", async function () {
      expect(await carbonCreditERC1155.uri(0)).to.equal("https://example.com/metadata/{id}");
    });
  });

  describe("Token minting", function () {
    it("Should mint new tokens successfully", async function () {
      await carbonCreditERC1155.connect(owner).mint(addr1.address, 0, 100, []);
      expect(await carbonCreditERC1155.balanceOf(addr1.address, 0)).to.equal(100);
    });

    it("Should fail minting tokens from a non-owner account", async function () {
      await expect(
        carbonCreditERC1155.connect(addr1).mint(addr1.address, 0, 100, [])
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Token transfers", function () {
    beforeEach(async function () {
      await carbonCreditERC1155.connect(owner).mint(addr1.address, 0, 100, []);
    });

    it("Should transfer tokens between accounts", async function () {
      await carbonCreditERC1155.connect(addr1).safeTransferFrom(addr1.address, addr2.address, 0, 50, []);
      expect(await carbonCreditERC1155.balanceOf(addr1.address, 0)).to.equal(50);
      expect(await carbonCreditERC1155.balanceOf(addr2.address, 0)).to.equal(50);
    });

    it("Should fail transferring tokens without sufficient balance", async function () {
      await expect(
        carbonCreditERC1155.connect(addr1).safeTransferFrom(addr1.address, addr2.address, 0, 200, [])
      ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
    });
  });
});
