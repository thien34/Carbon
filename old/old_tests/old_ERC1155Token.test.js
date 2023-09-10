const { expect } = require("chai");

describe("ERC1155Token", function () {
  let ERC1155Token, erc1155Token, owner, addr1, addr2;

  beforeEach(async () => {
    ERC1155Token = await ethers.getContractFactory("ERC1155Token");
    erc1155Token = await ERC1155Token.deploy("https://token-uri.com/{id}");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("should set the right token URI", async function () {
      expect(await erc1155Token.uri(1)).to.equal("https://token-uri.com/{id}");
    });
  });

  describe("Minting", function () {
    it("should mint tokens to the owner", async function () {
      await erc1155Token.mint(owner.address, 1, 100, "0x");
      const ownerBalance = await erc1155Token.balanceOf(owner.address, 1);
      expect(ownerBalance).to.equal(100);
    });

    it("should fail if non-owner tries to mint tokens", async function () {
      await expect(
        erc1155Token.connect(addr1).mint(addr1.address, 1, 100, "0x")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Transfers", function () {
    beforeEach(async () => {
      await erc1155Token.mint(owner.address, 1, 100, "0x");
    });

    it("should transfer tokens between accounts", async function () {
      await erc1155Token.safeTransferFrom(owner.address, addr1.address, 1, 50, "0x");
      const addr1Balance = await erc1155Token.balanceOf(addr1.address, 1);
      expect(addr1Balance).to.equal(50);

      await erc1155Token.connect(addr1).safeTransferFrom(addr1.address, addr2.address, 1, 25, "0x");
      const addr2Balance = await erc1155Token.balanceOf(addr2.address, 1);
      expect(addr2Balance).to.equal(25);
    });

    it("should fail if sender doesn't have enough tokens", async function () {
      await expect(
        erc1155Token.connect(addr1).safeTransferFrom(addr1.address, addr2.address, 1, 10, "0x")
      ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
    });
  });

  describe("Burning", function () {
    beforeEach(async () => {
      await erc1155Token.mint(owner.address, 1, 100, "0x");
    });

    it("should burn tokens", async function () {
      await erc1155Token.burn(owner.address, 1, 50);
      const ownerBalance = await erc1155Token.balanceOf(owner.address, 1);
      expect(ownerBalance).to.equal(50);
    });

    it("should fail if trying to burn more tokens than available", async function () {
      await expect(
        erc1155Token.burn(owner.address, 1, 200)
      ).to.be.revertedWith("ERC1155: insufficient balance for burn");
    });
  });
});
