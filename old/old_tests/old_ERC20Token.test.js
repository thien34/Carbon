const { expect } = require("chai");

describe("ERC20Token", function () {
  let ERC20Token, erc20Token, owner, addr1, addr2;

  beforeEach(async () => {
    ERC20Token = await ethers.getContractFactory("ERC20Token");
    erc20Token = await ERC20Token.deploy("CarbonToken", "CT");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("should set the right token name and symbol", async function () {
      expect(await erc20Token.name()).to.equal("CarbonToken");
      expect(await erc20Token.symbol()).to.equal("CT");
    });

    it("should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await erc20Token.balanceOf(owner.address);
      expect(await erc20Token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("should transfer tokens between accounts", async function () {
      await erc20Token.transfer(addr1.address, 50);
      const addr1Balance = await erc20Token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      await erc20Token.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await erc20Token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await erc20Token.balanceOf(owner.address);

      await expect(
        erc20Token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");

      expect(await erc20Token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("should update balances after transfers", async function () {
      const initialOwnerBalance = await erc20Token.balanceOf(owner.address);

      await erc20Token.transfer(addr1.address, 100);
      await erc20Token.transfer(addr2.address, 50);

      const finalOwnerBalance = await erc20Token.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

      const addr1Balance = await erc20Token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await erc20Token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});
