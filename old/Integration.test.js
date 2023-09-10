const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCreditBridge", function () {
  let CarbonCreditBridge, carbonCreditBridge, CarbonCreditERC1155, carbonCreditERC1155, WrappedBCT, wrappedBCT, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    CarbonCreditERC1155 = await ethers.getContractFactory("CarbonCreditERC1155");
    carbonCreditERC1155 = await CarbonCreditERC1155.deploy("https://example.com/metadata/");

    WrappedBCT = await ethers.getContractFactory("WrappedBCT");
    wrappedBCT = await WrappedBCT.deploy(carbonCreditERC1155.address, 1);

    CarbonCreditBridge = await ethers.getContractFactory("CarbonCreditBridge");
    carbonCreditBridge = await CarbonCreditBridge.deploy(carbonCreditERC1155.address);

    await carbonCreditBridge.addSupportedWrapper(wrappedBCT.address);
  });

  describe("wrapTokens", function () {
    it("should wrap tokens and mint carbon credits", async function () {
      const amount = 100;
      await carbonCreditERC1155.connect(owner).mint(addr1.address, 1, amount, "");
      await carbonCreditERC1155.connect(owner).approve(wrappedBCT.address, amount);
      const balanceBefore = await carbonCreditERC1155.balanceOf(address(this), 1);
      await carbonCreditBridge.connect(addr1).wrapTokens(wrappedBCT.address, amount);
      const balanceAfter = await carbonCreditERC1155.balanceOf(address(this), 1);
      expect(balanceAfter).to.equal(balanceBefore + amount);
    });

    it("should not wrap tokens if wrapper not supported", async function () {
      const amount = 100;
      await carbonCreditERC1155.connect(owner).mint(addr1.address, 1, amount, "");
      await carbonCreditERC1155.connect(owner).approve(wrappedBCT.address, amount);
      await carbonCreditBridge.removeSupportedWrapper(wrappedBCT.address);
      const balanceBefore = await carbonCreditERC1155.balanceOf(address(this), 1);
      await expect(carbonCreditBridge.connect(addr1).wrapTokens(wrappedBCT.address, amount)).to.be.revertedWith("CarbonCreditBridge: Unsupported wrapper");
      const balanceAfter = await carbonCreditERC1155.balanceOf(address(this), 1);
      expect(balanceAfter).to.equal(balanceBefore);
    });
  });
});

describe("CarbonCreditERC1155", function () {
  let CarbonCreditERC1155, carbonCreditERC1155, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    CarbonCreditERC1155 = await ethers.getContractFactory("CarbonCreditERC1155");
    carbonCreditERC1155 = await CarbonCreditERC1155.deploy("https://example.com/metadata/");
  });

  describe("mint", function () {
    it("should mint tokens", async function () {
      const amount = 100;
      const tokenId = 1;
      await carbonCreditERC1155.connect(owner).mint(addr1.address, tokenId, amount, "");
      const balance = await carbonCreditERC1155.balanceOf(addr1.address, tokenId);
      expect(balance).to.equal(amount);
    });

    it("should only allow owner or the contract to mint tokens", async function () {
      const amount = 100;
      const tokenId = 1;
      await expect(carbonCreditERC1155.connect(addr1).burn(addr1.address, tokenId, amount)).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(carbonCreditERC1155.connect(addr1).mint(addr1.address, tokenId, amount, "")).to.be.revertedWith("CarbonCreditERC1155: Only owner or the contract itself can mint tokens");
    });

    it("should mint fungible tokens", async function () {
      const amount = 100;
      const tokenId = 1;

      await carbonCreditERC1155.connect(owner).mintFungibleToken(addr1.address, amount, "");

      expect(await carbonCreditERC1155.balanceOf(addr1.address, tokenId)).to.equal(amount);
    });

    it("should mint non-fungible tokens", async function () {
      const tokenId = 1;

      await carbonCreditERC1155.connect(owner).mintNonFungibleToken(addr1.address, "");

      expect(await carbonCreditERC1155.balanceOf(addr1.address, tokenId)).to.equal(1);
    });

    it("should burn tokens", async function () {
      const amount = 100;
      const tokenId = 1;

      await carbonCreditERC1155.connect(owner).mint(addr1.address, tokenId, amount, "");

      await carbonCreditERC1155.connect(owner).burn(addr1.address, tokenId, amount);

      expect(await carbonCreditERC1155.balanceOf(addr1.address, tokenId)).to.equal(0);
    });

    it("should set URI", async function () {
      const newURI = "https://example.com/new-uri/";
      await carbonCreditERC1155.connect(owner).setURI(newURI);
      expect(await carbonCreditERC1155.uri(tokenId)).to.equal(newURI);
    });
  });

  describe("WrappedBCT", function () {
    let wrappedBCT;
    let erc20;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
      [owner, addr1, addr2] = await ethers.getSigners();
      erc20 = await ethers.getContractFactory("ERC20Mock").deploy("ERC20Mock", "ERC20M", owner.address, 1000000); wrappedBCT = await ethers.getContractFactory("WrappedBCT").deploy(erc20.address, 1);
      await erc20.transfer(wrappedBCT.address, 1000);
    });

    describe("Deployment", function () {
      it("Should set the right wrappedToken", async function () {
        expect(await wrappedBCT.wrappedToken()).to.equal(erc20.address);
      }); it("Should set the right tokenId", async function () {
        expect(await wrappedBCT.tokenId()).to.equal(1);
      });
    });

    describe("Wrapping tokens", function () {
      it("Should wrap tokens successfully", async function () {
        const amount = 100;
        await erc20.connect(addr1).approve(wrappedBCT.address, amount);
        await wrappedBCT.connect(addr1).wrap(amount);
        expect(await erc20.balanceOf(addr1.address)).to.equal(900);
        expect(await erc20.balanceOf(wrappedBCT.address)).to.equal(100);
        expect(await carbonCreditERC1155.balanceOf(addr1.address, 1)).to.equal(amount);
      }); it("Should fail if user does not have enough tokens", async function () {
        const amount = 100;
        await erc20.connect(addr1).approve(wrappedBCT.address, amount);
        await expect(wrappedBCT.connect(addr2).wrap(amount)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      });
    });

    describe("Unwrapping tokens", function () {
      it("should unwrap tokens", async function () {
        const amount = 100;
        await wrappedBCT.wrap(addr1.address, amount);
        const balanceBefore = await erc20.balanceOf(addr1.address);
        await wrappedBCT.connect(owner).unwrap(addr1.address, amount);
        const balanceAfter = await erc20.balanceOf(addr1.address);
        expect(balanceAfter).to.equal(balanceBefore.add(amount));
      }); it("should only allow owner to unwrap tokens", async function () {
        const amount = 100;
        await wrappedBCT.wrap(addr1.address, amount);
        await expect(wrappedBCT.connect(addr1).unwrap(addr1.address, amount)).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  })
})
