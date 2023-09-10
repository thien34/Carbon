const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Offset", function () {
    let Offset, Bridge, ERC1155Token, WrappedBCT, MockERC20;
    let offset, bridge, erc1155Token, wrappedBCT, mockERC20;
    let owner, user;
    const tokenId = 1;
    const amount = 100;

    beforeEach(async function () {
        Offset = await ethers.getContractFactory("Offset");
        Bridge = await ethers.getContractFactory("Bridge");
        ERC1155Token = await ethers.getContractFactory("ERC1155Token");
        WrappedBCT = await ethers.getContractFactory("WrappedBCT");
        MockERC20 = await ethers.getContractFactory("MockERC20");
    
        [owner, user] = await ethers.getSigners();
    
        erc1155Token = await ERC1155Token.deploy("https://example.com/token/");
        await erc1155Token.deployed();
    
        // Deploy the MockERC20 contract and mint tokens for testing
        mockERC20 = await MockERC20.deploy("MockToken", "MTK", 1000000);
        await mockERC20.deployed();
    
        const initialTokenId = 1;
    
        wrappedBCT = await WrappedBCT.deploy(mockERC20.address, initialTokenId);
        await wrappedBCT.deployed();
    
        // Deploy the Bridge contract with the correct WrappedBCT and ERC1155Token contract addresses
        bridge = await Bridge.deploy(wrappedBCT.address, erc1155Token.address, "https://example.com/token/");
        await bridge.deployed();
    
        offset = await Offset.deploy(bridge.address, erc1155Token.address, "https://example.com/nft/");
        await offset.deployed();
    });
    


    describe("offsetCarbonCredits", function () {
        it("should offset carbon credits and mint an NFT receipt", async function () {
            // Mint ERC1155 tokens for the user
            await erc1155Token.connect(owner).mint(user.address, tokenId, amount, "0x");

            // Check initial user balance
            expect(await erc1155Token.balanceOf(user.address, tokenId)).to.equal(amount);

            // Offset carbon credits
            await erc1155Token.connect(user).setApprovalForAll(offset.address, true);
            await offset.connect(user).offsetCarbonCredits(user.address, tokenId, amount);

            // Check updated user balance
            expect(await erc1155Token.balanceOf(user.address, tokenId)).to.equal(0);

            // Check if NFT receipt is minted
            expect(await offset.balanceOf(user.address, 0)).to.equal(1);
        });

        it("should fail when not enough carbon credits", async function () {
            // Try offsetting without minting any tokens for the user
            await expect(offset.connect(user).offsetCarbonCredits(user.address, tokenId, amount)).to.be.revertedWith(
                "Not enough carbon credits"
            );
        });
    });
});
