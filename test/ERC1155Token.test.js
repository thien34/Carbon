const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC1155Token", function () {
    let ERC1155Token;
    let erc1155Token;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        ERC1155Token = await ethers.getContractFactory("ERC1155Token");
        erc1155Token = await ERC1155Token.deploy("https://api.example.com/tokens/");
        await erc1155Token.deployed();
    });

    describe("Deployment", function () {
        it("Should set the correct URI", async function () {
            expect(await erc1155Token.uri(0)).to.equal("https://api.example.com/tokens/");
        });
    });

    describe("Minting tokens", function () {
        it("Should mint fungible tokens successfully", async function () {
            const tokenId = 1;
            const amount = 100;
            await erc1155Token.connect(owner).mintFungibleToken(addr1.address, amount, "0x");
            expect(await erc1155Token.balanceOf(addr1.address, tokenId)).to.equal(amount);
        });

        it("Should mint non-fungible tokens successfully", async function () {
            const tokenId = 1;
            await erc1155Token.connect(owner).mintNonFungibleToken(addr1.address, "0x");
            expect(await erc1155Token.balanceOf(addr1.address, tokenId)).to.equal(1);
        });

        it("Should only allow owner or the contract to mint tokens", async function () {
            const amount = 100;
            const tokenId = 1;
            await expect(erc1155Token.connect(addr1).mint(addr1.address, tokenId, amount, "0x")).to.be.revertedWith("ERC1155Token: Only owner or the contract itself can mint tokens");
        });
    });

    describe("Burning tokens", function () {
        it("Should burn tokens successfully", async function () {
            const tokenId = 1;
            const amount = 100;
            await erc1155Token.connect(owner).mintFungibleToken(addr1.address, amount, "0x");
            expect(await erc1155Token.balanceOf(addr1.address, tokenId)).to.equal(amount);

            await erc1155Token.connect(owner).burn(addr1.address, tokenId, amount);
            expect(await erc1155Token.balanceOf(addr1.address, tokenId)).to.equal(0);
        });

        it("Should only allow owner to burn tokens", async function () {
            const tokenId = 1;
            const amount = 100;
            await erc1155Token.connect(owner).mintFungibleToken(addr1.address, amount, "0x");
            expect(await erc1155Token.balanceOf(addr1.address, tokenId)).to.equal(amount);

            await expect(erc1155Token.connect(addr1).burn(addr1.address, tokenId, amount)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Setting URI", function () {
        it("Should set the URI successfully", async function () {
            const newURI = "https://api.example.com/newtokens/";
            await erc1155Token.connect(owner).setURI(newURI);
            expect(await erc1155Token.uri(0)).to.equal(newURI);
        });

        it("Should only allow owner to set the URI", async function () {
            const newURI = "https://api.example.com/newtokens/";
            await expect(erc1155Token.connect(addr1).setURI(newURI)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});