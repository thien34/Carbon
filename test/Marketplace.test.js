const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", () => {
    let ERC1155Token, erc1155Token;
    let MockERC20, trxToken, usdtToken;
    let Marketplace, marketplace;
    let owner, seller, buyer;

    beforeEach(async () => {
        // Deploy ERC1155 token contract
        ERC1155Token = await ethers.getContractFactory("ERC1155Token");
        erc1155Token = await ERC1155Token.deploy("https://tokenuri.com/");
        await erc1155Token.deployed();

        // Deploy Mock TRX and USDT tokens
        MockERC20 = await ethers.getContractFactory("MockERC20");
        trxToken = await MockERC20.deploy("Tronix", "TRX", 1000000000);
        await trxToken.deployed();
        usdtToken = await MockERC20.deploy("Tether", "USDT", 1000000000);
        await usdtToken.deployed();

        // Deploy Marketplace contract
        Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await Marketplace.deploy(
            erc1155Token.address,
            trxToken.address,
            usdtToken.address
        );
        await marketplace.deployed();

        [owner, seller, buyer] = await ethers.getSigners();
    });

    describe("createListing", () => {
        it("should create a new listing", async () => {
            // Mint ERC1155 token
            await erc1155Token.connect(owner).mint(seller.address, 1, 100, "0x");

            // Approve Marketplace contract to transfer ERC1155 token
            await erc1155Token.connect(seller).setApprovalForAll(marketplace.address, true);

            // Create a new listing
            await marketplace.connect(seller).createListing(1, 10, 100, true);

            // Check the created listing
            const listing = await marketplace.getListing(1);
            expect(listing.seller).to.equal(seller.address);
            expect(listing.tokenId).to.equal(1);
            expect(listing.amount).to.equal(10);
            expect(listing.pricePerToken).to.equal(100);
            expect(listing.isTRX).to.equal(true);
        });
    });

    describe("buyListing", () => {
        beforeEach(async () => {
            // Mint ERC1155 token
            await erc1155Token.connect(owner).mint(seller.address, 1, 100, "0x");

            // Approve Marketplace contract to transfer ERC1155 token
            await erc1155Token.connect(seller).setApprovalForAll(marketplace.address, true);

            // Create a new listing
            await marketplace.connect(seller).createListing(1, 10, 100, true);

            // Transfer TRX tokens to buyer
            await trxToken.connect(owner).transfer(buyer.address, 1000);
        });

        it("should buy tokens from a listing", async () => {
            // Approve Marketplace contract to transfer TRX tokens
            await trxToken.connect(buyer).approve(marketplace.address, 1000);

            // Buy tokens from the listing
            await marketplace.connect(buyer).buyListing(1, 5);

            // Check the updated listing
            const listing = await marketplace.getListing(1);
            expect(listing.amount).to.equal(5);

            // Check the token balances
            expect(await erc1155Token.balanceOf(seller.address, 1)).to.equal(90);
            // Check the token balances
            expect(await erc1155Token.balanceOf(seller.address, 1)).to.equal(90);
            expect(await erc1155Token.balanceOf(buyer.address, 1)).to.equal(5);

            // Check the TRX token balances
            expect(await trxToken.balanceOf(seller.address)).to.equal(500);
            expect(await trxToken.balanceOf(buyer.address)).to.equal(500);
        });
    });

    describe("cancelListing", () => {
        beforeEach(async () => {
            // Mint ERC1155 token
            await erc1155Token.connect(owner).mint(seller.address, 1, 100, "0x");

            // Approve Marketplace contract to transfer ERC1155 token
            await erc1155Token.connect(seller).setApprovalForAll(marketplace.address, true);

            // Create a new listing
            await marketplace.connect(seller).createListing(1, 10, 100, true);
        });

        it("should cancel a listing", async () => {
            // Cancel the listing
            await marketplace.connect(seller).cancelListing(1);

            // Check if the listing is removed
            const listing = await marketplace.getListing(1);
            expect(listing.seller).to.equal(ethers.constants.AddressZero);

            // Check the token balances
            expect(await erc1155Token.balanceOf(seller.address, 1)).to.equal(100);
        });
    });
});